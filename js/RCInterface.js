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
        // Variable
        this.numberFormat = d3.format( ".2f" );
        this.selectMultipleRegion = false;
        this.barChart = false;

        this.createDynamicAreasForResponsiveMap( "#imageFlux", "#mapForImageFlux", "#dynamicAreasForImageFlux", 850, true );
        this.createDynamicAreasForResponsiveMap( "#imageFluxForSynthesis", "#mapForImageFluxForSynthesis", "#dynamicAreasForImageFluxForSynthesis", 1100, false );

        this.initFileValuesAndCreateDCObjects();
        this.bindActions();
    },

    initFileValuesAndCreateDCObjects:function()
    {
        d3.csv( "data/Reccap_data_rows.csv", jQuery.proxy( function ( error, csv )
        {
            this.data = crossfilter( csv );
            // Init this.transposedData & this.continentsKeys
            this.transposeDataFromFile( csv );

            // TODO : see why it applies to ALL data
            this.data.dimension(
                    function( d )
                    {
                        return d["Value"];
                    } ).filter(
                    function( d )
                    {
                        if( 0 < Math.abs( d ) )
                            return d;
                    } );

            this.continents = this.data.dimension( jQuery.proxy( function( d )
            {
                return d["Continents"];
            }, this ) );

            // Create DC Objects
            this.createMap();
            this.createFunctions();
            this.createDataTable( "#data-count", "#data-table", this.data, this.data.groupAll(), this.continents );

            dc.renderAll();

            this.addToBarChart();
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
            this.createChoroplethMap( "#map-chart", 600, 300, countries, this.continents, this.continents.group() );
            dc.renderAll();
            this.updateCharts();
        }, this ) );
    },

    createFunctions:function()
    {
        var carbonBudgets = this.data.dimension( function( d )
        {
            return d["Carbon budget"];
        } );

        var budgetAmountGroup = carbonBudgets.group().reduceSum( function ( d )
        {
            return d3.format( ".2f" )( d["Value"] );
        } );

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

        this.createRowChart( "#function-chart", 350, 550, carbonBudgets, filteredFunctionAmountGroup );
    },

    createSimpleDCObject: function( dimensionValue, groupValue, DCObjectValue, chartId, width, height, chartGroup )
    {
        var dimension = this.data.dimension( function( d )
        {
            return d[dimensionValue];
        } );

        var group = this.getValuesGroupByBudget( dimension, groupValue );

        this.createBarChart( chartId, width, height, dimension, group, chartGroup );

        if( chartGroup )
            dc.renderAll( chartGroup );
        this.updateCharts();
    },


    /* ******************************************************************** */
    /* ****************************** CHARTS ****************************** */
    /* ******************************************************************** */
    createChoroplethMap: function( chartId, width, height, countries, continentsDimension, continentsGroup )
    {
        var projection = d3.geo.equirectangular()
                .translate( [width / 2,  height / 2] )
                .scale( [90] );

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

    createBarChart: function( chartId, width, height, dimension, group, chartGroup )
    {
        this.barChart = dc.barChart( chartId, chartGroup )
                .height( height )
                .width( width )
                .transitionDuration( 750 )
                .margins( {top: 20, right: 10, bottom: 80, left: 80} )
                .dimension( dimension )
                .group( group )
                .brushOn( false )
                .elasticY( true )
                .colors( ['#FF7F0E'] )
                .xUnits( dc.units.ordinal )
                .x( d3.scale.ordinal() )
//                .y( d3.scale.linear() )
                .renderHorizontalGridLines( true )
                .yAxis().tickFormat( d3.format( "s" ) );
    },

    createDataTable: function( countId, tableId, allD, allG, tableD )
    {
        dc.dataCount( countId )
                .dimension( allD )
                .group( allG );

        dc.dataTable( tableId )
                .dimension( tableD )
                .group( function( d )
        {
            return d["Continents"];
        } )
                .size( allG.value() )
                .columns( [
                function ( d )
                {
                    return d["Carbon budget"];
                },
                function ( d )
                {
                    return d["Value"];
                }
        ] ).renderlet( function ( table )
        {
            table.selectAll( ".dc-table-group" ).classed( "info", true );
        } );
    },

    createRowChart: function( chartId, width, height, functions, functionsGroup )
    {
//        var expenseColors = ["#fee391","#fec44f","#fe9929","#fd8d3c","#e08214","#fdb863","#fdae6b","#ec7014"];

        dc.rowChart( chartId )
                .width( width )
                .height( height )
                .margins( {top: 20, left: 10, right: 10, bottom: 20} )
                .transitionDuration( 750 )
                .dimension( functions )
                .group( functionsGroup )
                .colors( d3.scale.category20() )
//            .colors( expenseColors )
                .title( function ( d )
        {
            return "";
        } )
                .elasticX( true )
                .xAxis().tickFormat( d3.format( "s" ) );
    },


    /* ******************************************************************** */
    /* ************************ OTHERS FOR CHARTS ************************* */
    /* ******************************************************************** */
    updateCharts: function()
    {
        // Tooltips for menu
        $( ".toolButton img" ).tooltip( {
            placement: "right",
            container:'body'} );

        // Tooltips for charts
        var toolTip = d3.tip()
                .attr( 'class', 'd3-tip' )
                .offset( [-10, 0] )
                .html( jQuery.proxy( function ( d )
        {
            if( d.properties )
            // Choropleth
                return  "<span class='d3-tipTitle'>" + d.properties.continent + "</span>";
            else if( d.data )
            {
                if( "object" == jQuery.type( d.data.value ) )
                {
                    // Double Bar chart
                    var content = this.getToolTipContentForMultipleValues( d.data.value );
                    return "<span class='d3-tipTitle'>" + d.data.key + " : </span>" + content;
                }
                else
                // Simple Bar chart
                    return "<span class='d3-tipTitle'>" + d.data.key + " : </span>" + this.numberFormat( d.data.value );
            }
            else
            // Row chart
                return "<span class='d3-tipTitle'>" + d.key + " : </span>" + this.numberFormat( d.value );
        }, this ) );

        d3.selectAll( ".country, g.row, .bar" ).call( toolTip );
        d3.selectAll( ".country, g.row, .bar" )
                .on( 'mouseover', toolTip.show )
                .on( 'mouseout', toolTip.hide );


        // Bar chart : rotate the x Axis labels
        d3.selectAll( "g.x g text" )
                .attr( "class", "campusLabel" )
                .style( "text-anchor", "end" )
                .attr( "transform", "translate(-10,0)rotate(315)" );
    },

    createOrAddToBarChart: function( chartId, width, height, dimensionValue, groupValue )
    {
        var dimension = this.data.dimension( function( d )
        {
            return d[dimensionValue];
        } );

        var group = this.getValuesGroupByBudget( dimension, groupValue );

//        if( !this.barChart )
//            this.createBarChart( chartId, width, height, dimension, group, "barChar" );
//        else
        this.addToBarChart( chartId, dimension, group );

        dc.renderAll( "barChar" );
        this.updateCharts();
    },

// http://bl.ocks.org/gencay/4629518
//    http://cmaurer.github.io/angularjs-nvd3-directives/multi.bar.chart.html
//    http://bl.ocks.org/mbostock/3887051
//    addToBarChart: function( chartId, dimension, group, chartGroup )
    addToBarChart: function()
    {
        var margin = {top: 20, right: 20, bottom: 60, left: 40},
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

        var x0 = d3.scale.ordinal()
                .rangeRoundBands( [0, width], 0.1 );

        var x1 = d3.scale.ordinal();

        var y = d3.scale.linear()
                .range( [height, 0] );

        var xAxis = d3.svg.axis()
                .scale( x0 )
                .orient( "bottom" );

        var yAxis = d3.svg.axis()
                .scale( y )
                .orient( "left" )
                .tickFormat( d3.format( ".2s" ) );

//        var color = d3.scale.ordinal()
//                .range( ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"] );

        var svg = d3.select( "body" ).append( "svg" )
                .attr( "width", width + margin.left + margin.right )
                .attr( "height", height + margin.top + margin.bottom )
                .append( "g" )
                .attr( "transform", "translate(" + margin.left + "," + margin.top + ")" );

        var yBegin;

        this.columnHeaders = ["Heterotrophic Respiration","GPP","NPP","NEP","Land use change"];
        var data = this.transposedData;
        var color = d3.scale.category20().domain( this.columnHeaders );

        data.forEach( jQuery.proxy( function( d )
        {
            d.columnDetails = this.columnHeaders.map( function( element, index )
            {
                return {name: element, column: index.toString(), yBegin: 0, yEnd: +d[element]};
            } );
            d.total = d3.max( d.columnDetails, function( d )
            {
                return d ? d.yEnd : 0;
            } );
        }, this ) );

        x1.domain( d3.keys( this.columnHeaders ) ).rangeRoundBands( [0, x0.rangeBand()] );

        y.domain( [0, d3.max( this.transposedData, function( d )
        {
            return d.total;
        } )] );

        x0.domain( this.continentsKeys );
        x1.domain( d3.keys( this.columnHeaders ) ).rangeRoundBands( [0, x0.rangeBand()] );

        y.domain( [0, d3.max( data, function( d )
        {
            return d.total;
        } )] );

        svg.append( "g" )
                .attr( "class", "x axis" )
                .attr( "transform", "translate(0," + height + ")" )
                .call( xAxis );

        svg.append( "g" )
                .attr( "class", "y axis" )
                .call( yAxis )
                .append( "text" )
                .attr( "transform", "rotate(-90)" )
                .attr( "y", 6 )
                .attr( "dy", ".7em" )
                .style( "text-anchor", "end" )
                .text( "" );

        var project_stackedbar = svg.selectAll( ".project_stackedbar" )
                .data( data )
                .enter().append( "g" )
                .attr( "class", "g" )
                .attr( "transform", function( d )
        {
            return "translate(" + x0( d["Carbon budget"] ) + ",0)";
        } );

        project_stackedbar.selectAll( "rect" )
                .data( function( d )
        {
            return d.columnDetails;
        } )
                .enter().append( "rect" )
                .attr( "width", x1.rangeBand() )
                .attr( "x", function( d )
        {
            return x1( d.column );
        } )
                .attr( "y", function( d )
        {
            return y( d.yEnd );
        } )
                .attr( "height", function( d )
        {
            return y( d.yBegin ) - y( d.yEnd );
        } )
                .style( "fill", function( d )
        {
            return color( d.name );
        } );

        var legend = svg.selectAll( ".legend" )
                .data( this.columnHeaders.slice().reverse() )
                .enter().append( "g" )
                .attr( "class", "legend" )
                .attr( "transform", function( d, i )
        {
            return "translate(0," + i * 20 + ")";
        } );

        legend.append( "rect" )
                .attr( "x", width - 18 )
                .attr( "width", 18 )
                .attr( "height", 18 )
                .style( "fill", color );

        legend.append( "text" )
                .attr( "x", width - 24 )
                .attr( "y", 9 )
                .attr( "dy", ".35em" )
                .style( "text-anchor", "end" )
                .text( function( d )
        {
            return d;
        } );
    },

    bob: function ()
    {
        var margin = {top: 20, right: 20, bottom: 60, left: 40},
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

        this.x0 = d3.scale.ordinal().rangeRoundBands( [0, width], 0.1 );
        this.x0.domain( this.continentsKeys );

        this.x1 = d3.scale.ordinal();
        this.y = d3.scale.linear().range( [height, 0] );

        this.xAxis = d3.svg.axis()
                .scale( this.x0 )
                .orient( "bottom" );

        this.yAxis = d3.svg.axis()
                .scale( this.y )
                .orient( "left" )
                .tickFormat( d3.format( ".2s" ) );


        this.svg = d3.select( "body" ).append( "svg" )
                .attr( "width", width + margin.left + margin.right )
                .attr( "height", height + margin.top + margin.bottom )
                .append( "g" )
                .attr( "transform", "translate(" + margin.left + "," + margin.top + ")" );

        this.svg.append( "g" )
                .attr( "class", "x axis" )
                .attr( "transform", "translate(0," + height + ")" )
                .call( this.xAxis );

        this.svg.append( "g" )
                .attr( "class", "y axis" )
                .call( this.yAxis )
                .append( "text" )
                .attr( "transform", "rotate(-90)" )
                .attr( "y", 6 )
                .attr( "dy", ".7em" )
                .style( "text-anchor", "end" )
                .text( "" );

//        this.columnHeaders = ["Heterotrophic Respiration","GPP","NPP","NEP","Land use change"];
        this.columnHeaders = [];
        this.addColumn( "Fire", height, width );
//        this.addColumn("Heterotrophic Respiration", height, width);
        this.addColumn( "NPP", height, width );
    },

    addColumn: function( newColum, height, width )
    {
        this.columnHeaders.push( newColum );
        var color = d3.scale.category20().domain( this.columnHeaders );

        this.transposedData.forEach( jQuery.proxy( function( d )
        {
            d.columnDetails = this.columnHeaders.map( function( element, index )
            {
                return {name: element, column: index.toString(), yBegin: 0, yEnd: +d[element]};
            } );
            d.total = d3.max( d.columnDetails, function( d )
            {
                return d ? d.yEnd : 0;
            } );
        }, this ) );

        this.x1.domain( d3.keys( this.columnHeaders ) ).rangeRoundBands( [0, this.x0.rangeBand()] );

        this.y.domain( [0, d3.max( this.transposedData, function( d )
        {
            return d.total;
        } )] );


        var project_stackedbar = this.svg.selectAll( ".project_stackedbar" )
                .data( this.transposedData )
                .enter().append( "g" )
                .attr( "class", "g" )
                .attr( "transform", jQuery.proxy( function( d )
        {
            return "translate(" + this.x0( d["Carbon budget"] ) + ",0)";
        }, this ) );

        project_stackedbar.selectAll( "rect" )
                .data( function( d )
        {
            return d.columnDetails;
        } )
                .enter().append( "rect" )
                .attr( "width", this.x1.rangeBand() )
                .attr( "x", jQuery.proxy( function( d )
        {
            return d ? this.x1( d.column ) : 0;
        }, this ) )
                .attr( "y", jQuery.proxy( function( d )
        {
            return d ? this.y( d.yEnd ) : 0;
        }, this ) )
                .attr( "height", jQuery.proxy( function( d )
        {
            return d ? this.y( d.yBegin ) - this.y( d.yEnd ) : 0;
        }, this ) )
                .style( "fill", function( d )
        {
            return d ? color( d.name ) : 0;
        } );

//        project_stackedbar.selectAll( "text" )
//            .data( function( d )
//            {
//                return d.columnDetails;
//            } )
//            .enter().append("text")
//            .attr("x", jQuery.proxy(function(d) {
//            return d ? this.x1( d.column ) : 0;
//        }, this))
//            .attr("y", function(d,i){
//                return height-i*20;
//            })
//            .attr("dy", ".35em")
//            .text(function(d) {
//                return d.name + ", "+d.yEnd;
//            })
//            .style( "fill", function( d )
//            {
//                return "red";
////                return d ? color( d.columnDetails[0].name ) : 0;
//            } ) ;

        this.updateLegend( width, color );
    },


    updateLegend: function( width, color )
    {
        var legend = this.svg.selectAll( ".legend" )
                .data( this.columnHeaders.slice().reverse() )
                .enter().append( "g" )
                .attr( "class", "legend" )
                .attr( "transform", function( d, i )
        {
            return "translate(0," + i * 20 + ")";
        } );

        legend.append( "rect" )
                .attr( "x", width - 18 )
                .attr( "width", 18 )
                .attr( "height", 18 )
                .style( "fill", color );

        legend.append( "text" )
                .attr( "x", width - 24 )
                .attr( "y", 9 )
                .attr( "dy", ".35em" )
                .style( "text-anchor", "end" )
                .text( function( d )
        {
            return d;
        } );
    },

    removeChart: function( chartId )
    {
        $( "#" + chartId ).fadeOut( 500, function()
        {
            $( "#" + chartId ).remove();
        } );
    },

    getValuesGroupByBudget: function( dimension, carbonBudget )
    {
        return dimension.group().reduce(
                function ( p, v )
                {
                    if( carbonBudget == v["Carbon budget"] )
                        p += v["Value"];
                    return p;
                },
                function ( p, v )
                {
                    if( carbonBudget == v["Carbon budget"] )
                        p -= v["Value"];
                    return p;
                },
                function ()
                {
                    return "";
                } );
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
                                var isAlreadyAChart = $( argument.currentTarget ).hasClass( "selected" );
                                isAlreadyAChart ? $( argument.currentTarget ).removeClass( "selected" ) : $( argument.currentTarget ).addClass( "selected" );
                                if( isAlreadyAChart )
                                    this.removeChart( "bar-chart_" + argument.currentTarget.id );
                                else
                                    this.createOrAddToBarChart( "#bar-chart", 300, 200, "Continents", argument.currentTarget.getAttribute( "name" ) );
                            }, this ) );
                        $( dynamicAreasId ).append( div );
                    }, this ) );

                    $( mapId ).remove();
                }, this ),
                null
                );
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
        this.bindActionsForMenu();
        this.bindActionsForSlides();

        // Synthesis
        $( "#exportSynthesis" ).on( "click", function()
        {
            alert( "work in progress" );
        } );

        $( ".tools, #map-chart, .function, #bar-chart" ).draggable();
//        $( "#synthesis" ).click();
    },

    bindActionsForSlides: function()
    {
        $( "#dataSlide" ).on( "click", jQuery.proxy( function()
        {
            if( 0.4 == $( "#synthesisSlide" ).css( "opacity" ) )
                this.hideSlide();
            else
            {
                $( "#hiddenDivSlide" ).animate( {
                    width: "1200px"
                }, 700, function()
                {
                    $( "#dataDiv" ).fadeToggle( function()
                    {
                        $( "#hiddenDivSlide" ).height( Math.max( $( "#dataDiv" ).height(), $( "#pageWrapper .container-fluid" ).height() ) );
                    } );
                } );
                $( "#synthesisSlide" ).css( "opacity", 0.4 );
            }
        }, this ) );

        $( "#synthesisSlide" ).on( "click", jQuery.proxy( function()
        {
            if( 0.4 == $( "#dataSlide" ).css( "opacity" ) )
                this.hideSlide();
            else
            {
                $( "#hiddenDivSlide" ).animate( {
                    width: "1200px"
                }, 700, function()
                {
                    $( "#synthesisDiv" ).fadeToggle( function()
                    {
                        $( "#hiddenDivSlide" ).height( Math.max( $( "#synthesisDiv" ).height(), $( "#pageWrapper .container-fluid" ).height() ) );
                    } );
                } );
                $( "#dataSlide" ).css( "opacity", 0.4 );
            }
        }, this ) );

        $( "#hiddenDivSlide" ).on( "click", jQuery.proxy( function()
        {
            this.hideSlide();
        }, this ) );
    },

    hideSlide: function()
    {
        $( "#dataDiv" ).fadeOut();
        $( "#synthesisDiv" ).fadeOut();
        $( "#hiddenDivSlide" ).animate( {
            width: "10px"
        }, 700, function()
        {
            $( "#synthesisSlide" ).css( "opacity", 1 );
            $( "#dataSlide" ).css( "opacity", 1 );
            $( "#hiddenDivSlide" ).height( $( "#pageWrapper .container-fluid" ).height() );
        } );
    },

    bindActionsForMenu: function()
    {
        // Reset button
        $( "#reset" ).on( "click", jQuery.proxy( function()
        {
            $( ".dynamicArea" ).removeClass( "selected" );
            $( "#bar-chart div" ).fadeOut( 500, function()
            {
                $( "#bar-chart div" ).remove();
            } );
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
        $( "#regionActive" ).on( "click", jQuery.proxy( function()
        {
            this.geoChoroplethChart.setMultipleSelect( false );
            $( "#regionActive" ).fadeToggle();
            $( "#regionUnActive" ).fadeToggle();
            this.updateCharts();
        }, this ) );

        $( "#regionUnActive" ).on( "click", jQuery.proxy( function()
        {
            this.geoChoroplethChart.setMultipleSelect( true );
            $( "#regionActive" ).fadeToggle();
            $( "#regionUnActive" ).fadeToggle();
            this.updateCharts();
        }, this ) );

        // Data button
        $( "#data" ).on( "click", jQuery.proxy( function()
        {
            $( "#hiddenDiv" ).fadeToggle();
            $( "#dataDiv" ).fadeToggle( function()
            {
                $( "#hiddenDiv" ).height( Math.max( $( "#dataDiv" ).height(), $( "#pageWrapper .container-fluid" ).height() ) );
            } );
        }, this ) );

        // Synthesis button
        $( "#synthesis" ).on( "click", jQuery.proxy( function()
        {
            $( "#hiddenDiv" ).fadeToggle();
            $( "#synthesisDiv" ).fadeToggle( function()
            {
                $( "#hiddenDiv" ).height( Math.max( $( "#synthesisDiv" ).height(), $( "#pageWrapper .container-fluid" ).height() ) );
            } );
        }, this ) );

        $( "#hiddenDiv" ).on( "click", jQuery.proxy( function()
        {
            $( "#dataDiv" ).fadeOut();
            $( "#synthesisDiv" ).fadeOut();
            $( "#hiddenDiv" ).fadeToggle();
            $( "#hiddenDiv" ).height( $( "#pageWrapper .container-fluid" ).height() );
        }, this ) );
    },

    transposeDataFromFile: function( csv )
    {
        var arrayByContinents = new Array();
        // First we group all values by continents
        $.each( csv, function( i, d )
        {
            if( arrayByContinents[d.Continents] == undefined )
                arrayByContinents[d.Continents] = new Object();
            arrayByContinents[d.Continents][d["Carbon budget"]] = d["Value"];
        } );

        // Then we create a more simple array (no associative) to avoid tu use array's functions
        this.continentsKeys = d3.keys( arrayByContinents ).filter( function( key )
        {
            return key;
        } );

        this.transposedData = new Array();
        $.each( this.continentsKeys, jQuery.proxy( function( i, key )
        {
            var object = arrayByContinents[key];
            object["Carbon budget"] = key;
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
