/*
 ##########################################################################

 Vanessa.Maigne@ipsl.jussieu.fr      for Global Carbon Atlas
 Patrick.Brockmann@lsce.ipsl.fr      for Global Carbon Atlas

 PLEASE DO NOT COPY OR DISTRIBUTE WITHOUT PERMISSION

 ##########################################################################
 */
var RCInterface = Class.create( {

    initialize: function()
    {
        // File variables
        this.numberFormat = d3.format( ".2f" );
        this.regionColName = jQuery.i18n.prop( "regionColName" );
        this.fluxColName = jQuery.i18n.prop( "fluxColName" );
        this.valueColName = jQuery.i18n.prop( "valueColName" );

        // Variables
        this.initMapWidth = 600;
        this.initMapScale = 90;
        this.chartHeight = 0;
        this.chartWidth = $( "#bar-chart" ).width();
        this.imageHeight = 0;
        this.color = d3.scale.category20c();
        this.selectMultipleRegion = false;

        // Tooltips for charts
        this.toolTip = d3.tip()
                .attr( 'class', 'd3-tip' )
                .offset( [-10, 0] )
                .html( jQuery.proxy( function ( d )
        {
            if( d.properties )
            // Choropleth
                return  "<span class='d3-tipTitle'>" + d.properties.continent + "</span>";
            else if( d.column && d.name )
            {
                var value = (0 != d.yBegin ? d.yBegin : 0 != d.yEnd ? d.yEnd : 0);
                return "<span class='d3-tipTitle'>" + d.name + " : </span>" + value;
            }
            else if( d.data )
            // Bar chart
                return "<span class='d3-tipTitle'>" + d.data.key + " : </span>" + this.numberFormat( d.data.value );
            else
            // Row chart
                return "<span class='d3-tipTitle'>" + d.key + " : </span>" + this.numberFormat( d.value );
        }, this ) );


        // Areas for maps
        this.createDynamicAreasForResponsiveMap( "#imageFlux", "#mapForImageFlux", "#dynamicAreasForImageFlux", this.chartWidth, true );
        this.createDynamicAreasForResponsiveMap( "#imageFluxForSynthesis", "#mapForImageFluxForSynthesis", "#dynamicAreasForImageFluxForSynthesis", 1100, false );

        this.bindActions();
    },

    initFileValuesAndCreateDCObjects:function()
    {
        d3.csv( "data/Reccap_data_rows3.csv", jQuery.proxy( function ( error, csv )
        {
            this.data = crossfilter( csv );
            // Init this.transposedData & this.regionsKeys
            this.transposeDataFromFile( csv );

            // TODO : see why it applies to ALL data
            this.data.dimension(
                    jQuery.proxy( function( d )
                    {
                        return d[this.valueColName];
                    }, this ) ).filter(
                    function( d )
                    {
                        if( 0 < Math.abs( d ) )
                            return d;
                    } );

            this.continents = this.data.dimension( jQuery.proxy( function( d )
            {
                return d[this.regionColName];
            }, this ) );

            // Create DC Objects
            this.createMap();
            this.createFunctions();
            this.createDataTable( "#data-count", "#data-table", this.data, this.data.groupAll(), this.continents );
        }, this ) );
    },


    /* ******************************************************************** */
    /* ******************************** DC ******************************** */
    /* ******************************************************************** */
    createMap:function()
    {
        d3.json( "data/continent-geogame-110m.json", jQuery.proxy( function( error, world )
        {
            var countries = topojson.feature( world, world.objects.countries );
            var mapWidth = Math.min( this.imageHeight * 2, this.chartWidth );
            this.createChoroplethMap( "#map-chart", mapWidth, mapWidth / 2, countries, this.continents, this.continents.group() );
            $( "#map-chart" ).addClass( "countryWithPointer" );
            dc.renderAll();
            this.updateCharts();

            $( "#NPP" ).click();
        }, this ) );
    },

    createFunctions:function()
    {
        var carbonBudgets = this.data.dimension( jQuery.proxy( function ( d )
        {
            return d[this.fluxColName];
        }, this ) );

        var budgetAmountGroup = carbonBudgets.group().reduceSum( jQuery.proxy( function ( d )
        {
            return this.numberFormat( d[this.valueColName] );
        }, this ) );

        // Hack because this functionality is not yet available in dc.js
        var filteredFunctionAmountGroup = {
            all: function ()
            {
                return budgetAmountGroup.top( Infinity ).filter( function ( d )
                {
                    return 0 !== d.value;
                } );
            }
        };

        this.createBarChart( "#function-chart", this.chartWidth, this.chartHeight, carbonBudgets, budgetAmountGroup );
    },


    /* ******************************************************************** */
    /* ****************************** CHARTS ****************************** */
    /* ******************************************************************** */
//    http://www.d3noob.org/2013/03/a-simple-d3js-map-explained.html
    createChoroplethMap: function( chartId, width, height, countries, continentsDimension, continentsGroup )
    {
        var newScale = this.initMapScale * width / this.initMapWidth;
        var projection = d3.geo.equirectangular()
                .translate( [width / 2,  height / 2] )
                .scale( [newScale] );

        this.geoChoroplethChart = dc.geoChoroplethChart( chartId )
                .width( width )
                .height( height )
                .dimension( continentsDimension )
                .group( continentsGroup )
                .projection( projection )
                .overlayGeoJson( countries.features, "country", function( d )
        {
            return d.properties.continent;
        } )
                .title( function ( d )
        {
            return "";
        } );

        this.geoChoroplethChart.setMultipleSelect( this.selectMultipleRegion );
    },

    createDataTable: function( countId, tableId, allD, allG, tableD )
    {
        dc.dataCount( countId )
                .dimension( allD )
                .group( allG );

        dc.dataTable( tableId )
                .dimension( tableD )
                .group( jQuery.proxy( function( d )
        {
            return d[this.regionColName];
        }, this ) )
                .size( allG.value() )
                .columns( [
            jQuery.proxy( function( d )
            {
                return d[this.fluxColName];
            }, this ),
            jQuery.proxy( function( d )
            {
                return d[this.valueColName];
            }, this )
        ] ).
                renderlet( function ( table )
        {
            table.selectAll( ".dc-table-group" ).classed( "info", true );
        } );
    },

    createBarChart: function( chartId, width, height, dimension, group )
    {
        this.functionChart = dc.barChart( chartId )
                .height( height )
                .width( width )
                .transitionDuration( 750 )
                .margins( {top: 20, right: 80, bottom: 200, left: 50} )
                .dimension( dimension )
                .group( group )
                .brushOn( false )
                .elasticY( true )
                .colors( this.color )
                .xUnits( dc.units.ordinal )
                .x( d3.scale.ordinal() )
//                .y( d3.scale.linear() )
                .renderHorizontalGridLines( true );

        this.functionChart.yAxis().tickFormat( d3.format( "s" ) );
        this.functionChart.setCallBackOnClick( jQuery.proxy( this.onClickFunctionChart, this ) );
    },

//    createRowChart: function( chartId, width, height, functions, functionsGroup )
//    {
//        this.rowChart = dc.rowChart( chartId )
//                .width( width )
//                .height( height )
//                .margins( {top: 20, left: 10, right: 10, bottom: 20} )
//                .transitionDuration( 750 )
//                .dimension( functions )
//                .group( functionsGroup )
//                .colors( this.color )
//                .title( function ( d )
//        {
//            return "";
//        } )
//                .elasticX( true );
//
//        this.rowChart.xAxis().tickFormat( d3.format( "s" ) );
//        this.rowChart.setCallBackOnClick( jQuery.proxy( this.onClickRowChart, this ) );
//        this.rowChart.setCallBackOnCompleteDisplay( jQuery.proxy( this.onCompleteDisplayRowChart, this ) );
//    },

    onClickFunctionChart: function( element )
    {
        var dynamicAreaDivId = element.key.replace( / /g, "_" );
        this.addOrRemoveToGroupedBarChart( $( "#" + dynamicAreaDivId ), element.key );
    },

    onCompleteDisplayRowChart: function()
    {
//               alert("youhouuu");
    },


    /* ******************************************************************** */
    /* ************************ GROUPED BAR CHART ************************* */
    /* ******************************************************************** */
    addOrRemoveToGroupedBarChart: function( dynamicAreaDiv, fluxName )
    {
        this.displayedVariables = this.displayedVariables ? this.displayedVariables : [];
        var isAlreadyAChart = (0 <= getIndexInArray( this.displayedVariables, "name", fluxName ));
        isAlreadyAChart ? $( dynamicAreaDiv ).removeClass( "selected" ) : $( dynamicAreaDiv ).addClass( "selected" );
        if( isAlreadyAChart )
            this.removeToGroupedBarChart( fluxName );
        else
        {
//            var barChartHeight = $( "#pageWrapper" ).height() - $( ".imageFluxDiv" ).height() - 90;
            var barChartHeight = this.chartHeight - 50;
            this.createOrAddToBarChart( "#bar-chart", this.chartWidth, barChartHeight, fluxName );
        }
    },

    /**
     * This method create and/or add flux's bars in the grouped bar chart
     * http://bl.ocks.org/mbostock/3887051
     * http://bl.ocks.org/gencay/4629518
     * http://cmaurer.github.io/angularjs-nvd3-directives/multi.bar.chart.html
     * @param containerId
     * @param width
     * @param height
     * @param fluxValue
     */
    createOrAddToBarChart: function( containerId, width, height, fluxValue )
    {
        if( 0 >= $( "#bar-chartSvg" ).length )
            this.createGroupedBarChart( containerId, width, height );
        this.displayedVariables.push( {name : fluxValue, color: false} );
        this.updateGroupedBarChart();
        this.updateCharts();
    },

    /**
     * This method create the svg container for the grouped bar chart
     * @param containerId
     * @param width
     * @param height
     */
    createGroupedBarChart: function( containerId, width, height )
    {
        var margin = {top: 20, right: 20, bottom: 80, left: 40};
        this.barChartWidth = width - margin.left - margin.right;
        this.barChartHeight = height - margin.top - margin.bottom;

        this.barChartx0 = d3.scale.ordinal().rangeRoundBands( [0, this.barChartWidth], 0.1 ).domain( this.regionsKeys );
        this.barChartx1 = d3.scale.ordinal();
        this.barCharty = d3.scale.linear().range( [this.barChartHeight, 0] );

        // Axes
        this.barChartxAxis = d3.svg.axis().scale( this.barChartx0 );
        this.barChartyAxis = d3.svg.axis()
                .scale( this.barCharty )
                .orient( "left" )
                .tickFormat( d3.format( ".2s" ) )
                .tickSize( -this.barChartWidth, 0 );

        // BarChart
        this.barChartsvg = d3.select( containerId ).append( "svg" )
                .attr( "id", "bar-chartSvg" )
                .attr( "width", this.barChartWidth + margin.left + margin.right )
                .attr( "height", this.barChartHeight + margin.top + margin.bottom )
                .append( "g" )
                .attr( "transform", "translate(" + margin.left + "," + margin.top + ")" );

        this.barChartsvg.append( "g" )
                .attr( "class", "y axis" )
                .append( "text" )
                .attr( "transform", "rotate(-90)" )
                .attr( "y", 6 )
                .attr( "dy", ".7em" )
                .style( "text-anchor", "end" )
                .text( "" );

        this.barChartsvg.append( "g" )
                .attr( "class", "x axis" )
                .attr( "transform", "translate(0," + this.barChartHeight + ")" );

        // xAxis
        this.barChartsvg.select( '.x.axis' ).call( this.barChartxAxis );
    },

    /**
     * This method update the actual bar chart after an add or a remove of a flux value
     */
    updateGroupedBarChart: function()
    {
        // Create details for each column
        this.transposedData.forEach( jQuery.proxy( function( d )
        {
            d.columnDetails = this.displayedVariables.map( jQuery.proxy( function( element, index )
            {
                return {name: element.name, column: index.toString(), yBegin: (0 > d[element.name] ? d[element.name] : 0), yEnd: (0 < d[element.name] ? d[element.name] : 0), color:false};
            }, this ) );

            d.negativeTotal = d3.min( d.columnDetails, function( d )
            {
                return d ? parseInt( d.yBegin ) : 0;
            } );

            d.positiveTotal = d3.max( d.columnDetails, function( d )
            {
                return d ? parseInt( d.yEnd ) : 0;
            } );
        }, this ) );

        this.updateBarChartDomains();
        this.updateBarChartAxes();
        this.updateGroupedBar();
        this.updateBarChartLegend();
    },

    updateBarChartDomains: function()
    {
        this.barCharty.domain( [d3.min( this.transposedData, function( d )
        {
            return d.negativeTotal;
        } ), d3.max( this.transposedData, function( d )
        {
            return d.positiveTotal;
        } )] );
        this.barChartx1.domain( d3.keys( this.displayedVariables ) ).rangeRoundBands( [0, this.barChartx0.rangeBand()] );
    },

    updateBarChartAxes: function()
    {
        // Update yAxis
        this.barChartsvg
                .select( '.y.axis' )
                .call( this.barChartyAxis )
                .selectAll( 'line' )
                .filter( function( d )
        {
            return !d
        } )
                .classed( 'zero', true );
    },

    updateBarChartLegend: function()
    {
        var legend = this.barChartsvg.selectAll( ".legend" )
                .data( this.displayedVariables.slice() );

        var legendsEnter = legend.enter().append( "g" )
                .attr( "class", "legend" )
                .attr( "transform",
                function( d, i )
                {
                    return "translate(0," + i * 20 + ")";
                } );

        legendsEnter.append( "rect" )
                .attr( "x", this.barChartWidth - 18 )
                .attr( "width", 18 )
                .attr( "height", 18 );

        legendsEnter.append( "text" )
                .attr( "x", this.barChartWidth - 24 )
                .attr( "y", 9 )
                .attr( "dy", ".35em" )
                .style( "text-anchor", "end" )
                .text( function( d )
        {
            return jQuery.i18n.prop( d );
        } );
        legend.exit().remove();

        // When remove bar
        legend.select( "text" )
                .style( "fill", "#2C3537" )
                .text( function( d )
        {
            return jQuery.i18n.prop( d.name );
        } );

        legend.select( "rect" )
                .style( "fill", jQuery.proxy( function( d )
        {
            if( !d.color )
                d.color = this.color( d.name );
            return d.color;
        }, this ) )
                .style( "stroke", "#2C3537" )
                .on( "click", jQuery.proxy( function( d )
        {
            var divId = d.name.replace( / /g, "_" );
            $( "#" + divId ).removeClass( "selected" );
            this.removeToGroupedBarChart( d.name );
            this.functionChart.onClick( {key: d.name} );
        }, this ) );
    },

    updateGroupedBar: function()
    {
        var groupedBar = this.barChartsvg.selectAll( ".groupedBar" )
                .data( this.transposedData );

        var groupedBarEnter = groupedBar.enter().append( "g" )
                .attr( "class", "groupedBar" )
                .attr( "transform", jQuery.proxy( function( d )
        {
            return "translate(" + this.barChartx0( d[this.fluxColName] ) + ",0)";
        }, this ) );

        var groupedBarRect = groupedBar.selectAll( "rect" )
                .data( jQuery.proxy( function( d )
        {
            return d.columnDetails;
        }, this ) );

        groupedBarRect.enter().append( "rect" )
                .attr( "width", this.barChartx1.rangeBand() )
                .attr( "x", jQuery.proxy( function( d )
        {
            return this.barChartx1( d.column );
        }, this ) )
                .attr( "y", jQuery.proxy( function( d )
        {
            return this.barCharty( d.yEnd );
        }, this ) )
                .attr( "height", jQuery.proxy( function( d )
        {
            return this.barCharty( d.yBegin ) - this.barCharty( d.yEnd );
        }, this ) );
        groupedBarRect.exit().remove();

        groupedBar
                .transition()
                .duration( 200 )
                .ease( "linear" )
                .selectAll( "rect" )
                .attr( "width", this.barChartx1.rangeBand() )
                .attr( "x", jQuery.proxy( function( d )
        {
            return this.barChartx1( d.column );
        }, this ) )
                .attr( "y", jQuery.proxy( function( d )
        {
            return this.barCharty( d.yEnd );
        }, this ) )
                .attr( "height", jQuery.proxy( function( d )
        {
            return this.barCharty( d.yBegin ) - this.barCharty( d.yEnd );
        }, this ) )
                .style( "fill", jQuery.proxy( function( d )
        {
            if( !d.color )
                d.color = this.color( d.name );
            return d.color;
        }, this ) );
    },

    removeToGroupedBarChart: function( fluxName )
    {
        var index = getIndexInArray( this.displayedVariables, "name", fluxName );
        if( 0 > index )
            return;
        this.displayedVariables.splice( index, 1 );
        this.updateGroupedBarChart();
        if( 0 >= this.displayedVariables.length )
            $( "#bar-chartSvg" ).remove();
    },


    /* ******************************************************************** */
    /* ************************ OTHERS FOR CHARTS ************************* */
    /* ******************************************************************** */
    updateCharts: function()
    {
        // Tooltips for menu
        $( ".leftTools .toolButton img" ).tooltip( {
            placement: "bottom",
            container:'body'} );

        $( ".rightTools .toolButton img" ).tooltip( {
            placement: "left",
            container:'body'} );

        $( "#regionSelect .toolButton img" ).tooltip( {
            placement: "right",
            container:'body'} );

        d3.selectAll( ".country, g.row, .bar, #bar-chartSvg .groupedBar rect" ).call( this.toolTip );
        d3.selectAll( ".country, g.row, .bar, #bar-chartSvg .groupedBar rect" )
                .on( 'mouseover', this.toolTip.show )
                .on( 'mouseout', this.toolTip.hide );


        // Bar chart : rotate the x Axis labels
        d3.selectAll( "g.x g text" )
                .attr( "class", "campusLabel" )
                .style( "text-anchor", "end" )
                .attr( "transform", "translate(-10,0)rotate(315)" );
    },


    /* ******************************************************************** */
    /* ****************************** OTHERS ****************************** */
    /* ******************************************************************** */
    /**
     * This method resize the image and create dynamic divs to replace map/areas to get better css styles
     * @param width
     */
    createDynamicAreasForResponsiveMap: function( imageId, mapId, dynamicAreasId, width, activeClick )
    {
        // Responsive image with map/area
        $( imageId ).mapster( {
            stroke:false,
            fill:false
        } );
        $( imageId ).mapster( 'resize', width, 0, 0 );

        // Create "areas" divs
        $.waitUntil(
                function()
                {
                    return width == $( imageId ).width();
                },
                jQuery.proxy( function()
                {
                    this.createAreas( mapId, activeClick, dynamicAreasId );
                    this.chartHeight = $( "#pageWrapper" ).height() - $( "#imageFlux" ).height() - $( ".container-fluid" ).height();
                    this.imageHeight = $( "#imageFlux" ).height();
                    if( activeClick )
                        this.initFileValuesAndCreateDCObjects();
                }, this ),
                null
                );
    },

    createAreas : function( mapId, activeClick, dynamicAreasId )
    {
        $.each( $( mapId + " area" ), jQuery.proxy( function( i, element )
        {
            var coords = element.coords.split( ',' );
            var divId = element.alt.replace( / /g, "_" );
            var div = $( '<div id="' + divId + '" name="' + element.alt + '" class="dynamicArea"></div>' );
            if( null != element.getAttribute( "isRed" ) )
                div.addClass( "redSynthesisText" );
            div.css( "top", coords[1] );
            div.css( "left", coords[0] );
            div.width( coords[2] - coords[0] );
            div.height( coords[3] - coords[1] );
            if( activeClick )
                div.on( "click", jQuery.proxy( function( argument )
                {
                    this.addOrRemoveToGroupedBarChart( argument.currentTarget, argument.currentTarget.getAttribute( "name" ) );
                    this.functionChart.onClick( {key: argument.currentTarget.getAttribute( "name" )} );
                }, this ) );
            $( dynamicAreasId ).append( div );
        }, this ) );

        $( mapId ).remove();
    },

    getToolTipContentForMultipleValues: function( valueArray )
    {
        var content = "";
        jQuery.each( Object.keys( valueArray ), jQuery.proxy( function( i, d )
        {
            content += " " + d + " : " + this.numberFormat( valueArray[d] ) + ",";
        }, this ) );
        return content.slice( 0, -1 );
    },

    bindActions: function()
    {
        // Reset button
        $( "#reset" ).on( "click", jQuery.proxy( function()
        {
            $( "#dynamicAreasForImageFlux .dynamicArea" ).removeClass( "selected" );
            $( "#bar-chart" ).empty();
            this.displayedVariables = [];

            dc.filterAll();
            dc.renderAll();
            this.updateCharts();
        }, this ) );

        // Export button
        $( "#export" ).on( "click", function()
        {
            alert( "work in progress" );
        } );

        // Help button
        $( "#help" ).on( "click", function()
        {
            alert( "work in progress" );
        } );

        // Region select button
        $( "#regionUnActive" ).on( "click", jQuery.proxy( function()
        {
            $( "#map-chart" ).addClass( "countryWithPointer" );
            this.geoChoroplethChart.setMultipleSelect( true );
            this.geoChoroplethChart.setSelect( true );
            $( "#regionUnActive" ).fadeOut();
            $( "#regionActive" ).fadeIn();
            $( "#globeActive" ).fadeOut();
            this.updateCharts();
        }, this ) );

        $( "#regionActive" ).on( "click", jQuery.proxy( function()
        {
            $( "#map-chart" ).removeClass( "countryWithPointer" );
            this.geoChoroplethChart.setSelect( false );
            $( "#reset" ).click();
            $( "#regionUnActive" ).fadeOut();
            $( "#regionActive" ).fadeOut();
            $( "#globeActive" ).fadeIn();
            this.updateCharts();
        }, this ) );

        $( "#globeActive" ).on( "click", jQuery.proxy( function()
        {
            $( "#map-chart" ).addClass( "countryWithPointer" );
            this.geoChoroplethChart.setMultipleSelect( false );
            this.geoChoroplethChart.setSelect( true );
            $( "#regionUnActive" ).fadeIn();
            $( "#regionActive" ).fadeOut();
            $( "#globeActive" ).fadeOut();
            this.updateCharts();
        }, this ) );

        // Data button
        $( "#data" ).on( "click", jQuery.proxy( function()
        {
            $( "#hiddenDiv" ).fadeToggle();
            $( "#dataDiv" ).fadeToggle( function()
            {
                $( "#hiddenDiv" ).height( Math.max( $( "#dataDiv" ).height(), $( "#pageWrapper" ).height() ) );
            } );
        }, this ) );

        // Synthesis button
        $( "#synthesis" ).on( "click", jQuery.proxy( function()
        {
            $( "#hiddenDiv" ).fadeToggle();
            $( ".synthesisDiv" ).fadeToggle( function()
            {
                $( "#hiddenDiv" ).height( Math.max( $( "#synthesisDiv" ).height(), $( "#pageWrapper" ).height() ) );
            } );
        }, this ) );

        $( "#hiddenDiv, #synthesisDiv #imageFluxForSynthesis" ).on( "click", function()
        {
            $( "#dataDiv" ).fadeOut();
            $( ".synthesisDiv" ).fadeOut();
            $( "#hiddenDiv" ).fadeToggle();
            $( "#hiddenDiv" ).height( $( "#pageWrapper .container-fluid" ).height() );
        } );


        // Synthesis
        $( "#exportSynthesis" ).on( "click", function()
        {
            alert( "work in progress" );
        } );
    },

    transposeDataFromFile: function( csv )
    {
        var arrayByContinents = new Array();
        // First we group all values by continents
        $.each( csv, jQuery.proxy( function( i, d )
        {
            if( arrayByContinents[d[this.regionColName]] == undefined )
                arrayByContinents[d[this.regionColName]] = new Object();
            arrayByContinents[d[this.regionColName]][d[this.fluxColName]] = d[this.valueColName];
        }, this ) );

        // Then we create a more simple array (no associative) to avoid tu use array's functions
        this.regionsKeys = d3.keys( arrayByContinents ).filter( function( key )
        {
            return key;
        } );
        this.regionsKeys.sort();

        this.transposedData = new Array();
        $.each( this.regionsKeys, jQuery.proxy( function( i, key )
        {
            var object = arrayByContinents[key];
            object[this.fluxColName] = key;
            this.transposedData.push( object );
        }, this ) );
    }

} );

function print_filter( filter )
{
    var f = eval( filter );
    if( "undefined" != typeof(f.length) )
    {
    }
    else
    {
    }
    if( "undefined" != typeof(f.top) )
    {
        f = f.top( Infinity );
    }
    else
    {
    }
    if( "undefined" != typeof(f.dimension) )
    {
        f = f.dimension(
                function( d )
                {
                    return "";
                } ).top( Infinity );
    }
    else
    {
    }
//    console.log( filter + "(" + f.length + ") = " + JSON.stringify( f ).replace( "[", "[\n\t" ).replace( /}\,/g, "},\n\t" ).replace( "]", "\n]" ) );
}
