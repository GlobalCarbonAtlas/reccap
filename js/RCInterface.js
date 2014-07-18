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
        this.groupedBarChartWidth = $( "#groupedBarChart" ).width();
        this.functionBarChartWidth = $( "#functionBarChart" ).width();
        this.imageHeight = 0;
        this.barCharMargin = {top: 10, right: 20, bottom: 75, left: 35};
        this.color = d3.scale.category20c();
        this.selectMultipleRegion = false;
        this.orderForFlux = JSON.parse( jQuery.i18n.prop( "orderForFlux" ) );
        this.separatedFlux = JSON.parse( jQuery.i18n.prop( "separatedFlux" ) );
        this.mainFlux = JSON.parse( jQuery.i18n.prop( "mainFlux" ) );

        // Areas for maps
        this.createDynamicAreasForResponsiveMap( "#imageFlux", "#mapForImageFlux", "#dynamicAreasForImageFlux", this.groupedBarChartWidth, true );
        this.createDynamicAreasForResponsiveMap( "#imageFluxForSynthesis", "#mapForImageFluxForSynthesis", "#dynamicAreasForImageFluxForSynthesis", 1100, false );

        this.initToolTips();
        this.bindActions();
    },

    initToolTips: function()
    {
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
            // Function bar chart axis
                return "<span class='d3-tipTitle'>" + d + "</span>";
        }, this ) );

        // Tooltips for menu
        $( ".leftTools .toolButton img, #functionBarChartTitle" ).tooltip( {
            placement: "bottom",
            container:'body'} );

        $( ".rightTools .toolButton img" ).tooltip( {
            placement: "left",
            container:'body'} );

        $( "#regionSelect .toolButton img" ).tooltip( {
            placement: "right",
            container:'body'} );
    },

    initFileValuesAndCreateDCObjects:function()
    {
        d3.csv( "data/Reccap_data_rows3.csv", jQuery.proxy( function ( error, csv )
        {
            this.data = crossfilter( csv );
            // Init this.transposedData & this.regionsKeys
            this.transposeDataFromFile( csv );

            // TODO : see why it applies to ALL data
//            this.data.dimension(
//                    jQuery.proxy( function( d )
//                    {
//                        return d[this.valueColName];
//                    }, this ) ).filter(
//                    function( d )
//                    {
//                        if( 0 < Math.abs( d ) )
//                            return d;
//                    } );

            this.continents = this.data.dimension( jQuery.proxy( function( d )
            {
                return d[this.regionColName];
            }, this ) );

            // Create DC Objects
            this.createFunctions();
            this.createDataTable( "#data-count", "#data-table", this.data, this.data.groupAll(), this.continents );
            this.createMapAndUpdateAllAfterRender();
        }, this ) );
    },


    /* ******************************************************************** */
    /* ******************************** DC ******************************** */
    /* ******************************************************************** */
    createMapAndUpdateAllAfterRender:function()
    {
        d3.json( "data/continent-geogame-110m.json", jQuery.proxy( function( error, world )
        {
            var countries = topojson.feature( world, world.objects.countries );
            var mapWidth = Math.min( this.imageHeight * 2, this.functionBarChartWidth );
            this.createChoroplethMap( "#mapChart", mapWidth, mapWidth / 2, countries, this.continents, this.continents.group() );
            $( "#mapChart" ).addClass( "countryWithPointer" );

            dc.renderAll();

            this.updateToolTipsForCharts();
            this.updateXAxisForFunctionBarChart();

            // Position of "regionSelect" div
            var marginLeft = (this.functionBarChartWidth - $( "#mapChart" ).width() - $( "#globeActive" ).width()) / 2;
            $( "#regionSelect" ).css( "margin-left", marginLeft );

            // Home with selected flux
            $( "#" + jQuery.i18n.prop( "selectedFluxForHomePage" ) ).click();
        }, this ) );
    },

    /**
     * http://blog.rusty.io/2012/09/17/crossfilter-tutorial/
     * "... when you filter on a dimension, and then roll-up using said dimension, Crossfilter intentionally ignores any filter an said dimension....
     * ...The workaround is to create another dimension on the same field, and filter on that:"
     */
    createFunctions:function()
    {
        var carbonBudgets = this.data.dimension( jQuery.proxy( function ( d )
        {
            return d[this.fluxColName];
        }, this ) );

        var budgetAmountGroup = this.data.dimension( jQuery.proxy( function ( d )
        {
            return d[this.fluxColName];
        }, this ) ).filter( jQuery.proxy( function( d )
        {
            if( $.inArray( d, this.mainFlux ) != -1 )
                return d;
        }, this ) ).group().reduceSum( jQuery.proxy( function ( d )
        {
            return this.numberFormat( d[this.valueColName] );
        }, this ) );

        var bob1 = this.createFunctionBarChart( "#functionBarChart1", $( "#functionBarChart1" ).width(), this.chartHeight, carbonBudgets, budgetAmountGroup, this.mainFlux, false, this.barCharMargin );
        var marginForRightAxis = {top: this.barCharMargin.top, right: this.barCharMargin.left, bottom: this.barCharMargin.bottom, left:this.barCharMargin.right };
        var bob2 = this.createFunctionBarChart( "#functionBarChart2", $( "#functionBarChart2" ).width(), this.chartHeight, carbonBudgets, budgetAmountGroup, this.separatedFlux, true, marginForRightAxis );

//        var carbonBudgets2 = this.data.dimension( jQuery.proxy( function ( d )
//        {
//            return d[this.fluxColName];
//        }, this ) );
//        carbonBudgets2.filter( jQuery.proxy( function( d )
//        {
//            if( $.inArray( d, this.mainFlux ) != -1 )
//                return d;
//        }, this ) );
//
//        var budgetAmountGroup2 = carbonBudgets2.group().reduceSum( jQuery.proxy( function ( d )
//        {
//            return this.numberFormat( d[this.valueColName] );
//        }, this ) );
//
//        print_filter( budgetAmountGroup2 );
//        this.createFunctionBarChart( "#functionBarChart2", $( "#functionBarChart2" ).width(), this.chartHeight, carbonBudgets2, budgetAmountGroup2, this.mainFlux );

//        dc.renderAll( "#functionBarChart1" );

//        this.data.dimension( jQuery.proxy( function ( d )
//        {
//            return d[this.fluxColName];
//        }, this ) )
//                .filter( jQuery.proxy( function( d )
//        {
//            if( $.inArray( d, this.mainFlux ) != -1 )
//                return d;
//        }, this ) );
//
//        this.createFunctionBarChart( "#functionBarChart2", $( "#functionBarChart2" ).width(), this.chartHeight, carbonBudgets, budgetAmountGroup, this.mainFlux );
//        dc.renderAll( "#functionBarChart2" );

//        print_filter( carbonBudgets2 );
//        var paf = carbonBudgets2.filter( jQuery.proxy( function( d )
//        {
//            if( $.inArray( d, this.separatedFlux ) != -1 )
//            {
//                console.log( "OK " + d );
//                return d;
//            }
//        } ) ).group();
//
//        print_filter( paf);
//
//        var budgetAmountGroup2 = carbonBudgets2.group().reduceSum( jQuery.proxy( function ( d )
//        {
//            return this.numberFormat( d[this.valueColName] );
//        }, this ) );
//
////        print_filter( budgetAmountGroup2 );
//
//        // Hack because this functionality is not yet available in dc.js
////        var filteredFunctionAmountGroup = {
////            all: function ()
////            {
////                return budgetAmountGroup.top( Infinity ).filter( function ( d )
////                {
////                    return 0 !== d.value;
////                } );
////            }
////        };

//        this.createFunctionBarChart( "#functionBarChart2", $( "#functionBarChart2" ).width(), this.chartHeight, carbonBudgets2, budgetAmountGroup);
    },


    /* ******************************************************************** */
    /* ******************************* MAP ******************************** */
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
        this.geoChoroplethChart.setEmptyZoneWithNoData( "No data for this region" );
        this.geoChoroplethChart.setCallBackOnClick( jQuery.proxy( this.onClickGeoChoroplethChart, this ) );
    },

    onClickGeoChoroplethChart: function( element )
    {
        if( !this.geoChoroplethChart.getSelect() )
            $( "#functionBarChartTitle" ).html( "All regions" );
        else
        {
            $( "#functionBarChartTitle" ).html( this.geoChoroplethChart.getDisplayedRegions().join( " + " ) );
            $( "#functionBarChartTitle" ).attr( "data-original-title", this.geoChoroplethChart.getDisplayedRegions().join( " + " ) );
        }
    },


    /* ******************************************************************** */
    /* *************************** DATA TABLE ***************************** */
    /* ******************************************************************** */
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


    /* ******************************************************************** */
    /* ************************ FUNCTIONS BAR CHART ************************* */
    /* ******************************************************************** */
    createFunctionBarChart: function( chartId, width, height, dimension, group, domain, useRightYAxis, barCharMargin )
    {
        var barChart = dc.barChart( chartId )
                .height( height )
                .width( width )
                .transitionDuration( 750 )
                .margins( barCharMargin )
                .dimension( dimension )
                .group( group )
                .brushOn( false )
                .elasticY( true )
                .colors( this.color )
                .xUnits( dc.units.ordinal )
//                .x( d3.scale.ordinal() )
                .x( d3.scale.ordinal().domain( domain ) )
//                .y( d3.scale.linear().domain( [-500000, 500000] ) )
                .renderHorizontalGridLines( true );

//        console.log( domain );
        barChart.setUseRightYAxis( useRightYAxis );
        barChart.yAxis().tickFormat( d3.format( "s" ) );
        barChart.setCallBackOnClick( jQuery.proxy( this.onClickFunctionChart, this ) );

//        barChart.filter( domain );
//        barChart.x( d3.scale.ordinal().domain( domain ) );
//        this.functionChart.yAxis().tickFormat( d3.format( "s" ) );
//        this.functionChart.setCallBackOnClick( jQuery.proxy( this.onClickFunctionChart, this ) );
//        this.rowChart.setCallBackOnCompleteDisplay( jQuery.proxy( this.onCompleteDisplayRowChart, this ) );
//        dc.redrawAll();
//        dc.renderAll( chartId );
        return barChart;
    },

    updateXAxisForFunctionBarChart: function()
    {
        // Function Bar chart : rotate the x Axis labels
        d3.selectAll( "#functionBarChart g.x g text" )
                .style( "text-anchor", "end" )
                .attr( "title", function( d )
        {
            return d;
        } )
                .attr( "transform", "translate(-10,0)rotate(315)" )
                .html( jQuery.proxy( function( d )
        {
            var propertieName = this.getI18nPropertiesKeyFromValue( d );
            return 0 != jQuery.i18n.prop( propertieName + "_shortForAxis" ).indexOf( "[" ) ? jQuery.i18n.prop( propertieName + "_shortForAxis" ) : d;
        }, this ) )
                .on( 'click', jQuery.proxy( function( d )
        {
            // Warning : need to desactivate "  pointer-events: auto;" in css -> .dc-chart g.axis text
            var dynamicAreaDivId = this.getI18nPropertiesKeyFromValue( d );
            $( "#" + dynamicAreaDivId ).click();
        }, this ) );


        // Test with "foreignObject" if necessary
//        var barChartData = d3.selectAll( "#functionBarChart g.x g text" )[0];
//        d3.selectAll( "#functionBarChart g.x g text" ).remove();
//        d3.selectAll( "#functionBarChart g.x g" )
//                .data( barChartData )
//                .append( "foreignObject" )
//                .style( "text-anchor", "end" )
//                .attr( "transform", "translate(-10,0)rotate(315)" )
//                .attr( "x", 0 )
//                .attr( "y", 9 )
//                .attr( 'width', 100 )
//                .attr( 'height', 20 )
//                .append( "xhtml:body" )
//                .html( function( d )
//        {
//            return '<div class="functionBarChartText">' + d.__data__ + '</div>';
//        } )
//                .on( 'click', jQuery.proxy( function( d )
//        {
//            var dynamicAreaDivId = this.getI18nPropertiesKeyFromValue( d.__data__ );
//            $( "#" + dynamicAreaDivId ).click();
//        }, this ) );
    },

    onClickFunctionChart: function( element )
    {
        var dynamicAreaDivId = this.getI18nPropertiesKeyFromValue( element.key );
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
            this.createOrAddToBarChart( "#groupedBarChart", this.groupedBarChartWidth, this.chartHeight, fluxName );
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
        if( 0 >= $( "#groupedBarChartSvg" ).length )
            this.createGroupedBarChart( containerId, width, height );
        this.displayedVariables.push( {name : fluxValue, color: false} );
        this.updateGroupedBarChart();
        this.updateToolTipsForCharts();
    },

    /**
     * This method create the svg container for the grouped bar chart
     * @param containerId
     * @param width
     * @param height
     */
    createGroupedBarChart: function( containerId, width, height )
    {
        this.groupedBarChartWidth = width - this.barCharMargin.left - this.barCharMargin.right;
        this.groupedBarChartHeight = height - this.barCharMargin.top - this.barCharMargin.bottom;

        this.groupedBarChartx0 = d3.scale.ordinal().rangeRoundBands( [0, this.groupedBarChartWidth], 0.1 ).domain( this.regionsKeys );
        this.groupedBarChartx1 = d3.scale.ordinal();
        this.groupedBarCharty = d3.scale.linear().range( [this.groupedBarChartHeight, 0] );

        // Axes
        this.groupedBarChartxAxis = d3.svg.axis().scale( this.groupedBarChartx0 );
        this.groupedBarChartyAxis = d3.svg.axis()
                .scale( this.groupedBarCharty )
                .orient( "left" )
                .tickFormat( d3.format( ".2s" ) )
                .tickSize( -this.groupedBarChartWidth, 0 );

        $( containerId ).addClass( "dc-chart" );
        // BarChart
        this.groupedBarChartsvg = d3.select( containerId ).append( "svg" )
                .attr( "id", "groupedBarChartSvg" )
                .attr( "width", this.groupedBarChartWidth + this.barCharMargin.left + this.barCharMargin.right )
                .attr( "height", this.groupedBarChartHeight + this.barCharMargin.top + this.barCharMargin.bottom )
                .append( "g" )
                .attr( "transform", "translate(" + this.barCharMargin.left + "," + this.barCharMargin.top + ")" );

        this.groupedBarChartsvg.append( "g" )
                .attr( "class", "y axis" )
                .append( "text" )
                .attr( "transform", "rotate(-90)" )
                .attr( "y", 6 )
                .attr( "dy", ".7em" )
                .style( "text-anchor", "end" )
                .text( "" );

        this.groupedBarChartsvg.append( "g" )
                .attr( "class", "x axis" )
                .attr( "transform", "translate(0," + this.groupedBarChartHeight + ")" );

        // xAxis
        this.groupedBarChartsvg.select( '.x.axis' ).call( this.groupedBarChartxAxis );
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
        this.groupedBarCharty.domain( [d3.min( this.transposedData, function( d )
        {
            return d.negativeTotal;
        } ), d3.max( this.transposedData, function( d )
        {
            return d.positiveTotal;
        } )] );
        this.groupedBarChartx1.domain( d3.keys( this.displayedVariables ) ).rangeRoundBands( [0, this.groupedBarChartx0.rangeBand()] );
    },

    updateBarChartAxes: function()
    {
        // Update yAxis
        this.groupedBarChartsvg
                .select( '.y.axis' )
                .call( this.groupedBarChartyAxis )
                .selectAll( 'line' )
                .filter( function( d )
        {
            return !d
        } )
                .classed( 'zero', true );
    },

    updateBarChartLegend: function()
    {
        var legend = this.groupedBarChartsvg.selectAll( ".legend" )
                .data( this.displayedVariables.slice() );

        var legendsEnter = legend.enter().append( "g" )
                .attr( "class", "legend" )
                .attr( "transform",
                function( d, i )
                {
                    return "translate(0," + i * 20 + ")";
                } );

        legendsEnter.append( "rect" )
                .attr( "x", this.groupedBarChartWidth - 18 )
                .attr( "width", 18 )
                .attr( "height", 18 );

        legendsEnter.append( "text" )
                .attr( "x", this.groupedBarChartWidth - 24 )
                .attr( "y", 9 )
                .attr( "dy", ".35em" )
                .style( "text-anchor", "end" );
        legend.exit().remove();

        // When remove bar
        legend.select( "text" )
                .text( function( d )
        {
            return jQuery.i18n.prop( d.name ).replace( "[", "" ).replace( "]", "" );
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
            var dynamicAreaDivId = this.getI18nPropertiesKeyFromValue( d.name );
            $( "#" + dynamicAreaDivId ).removeClass( "selected" );
            this.removeToGroupedBarChart( d.name );
//            this.functionChart.onClick( {key: d.name} );
        }, this ) );
    },

    updateGroupedBar: function()
    {
        var groupedBar = this.groupedBarChartsvg.selectAll( ".groupedBar" )
                .data( this.transposedData );

        var groupedBarEnter = groupedBar.enter().append( "g" )
                .attr( "class", "groupedBar" )
                .attr( "transform", jQuery.proxy( function( d )
        {
            return "translate(" + this.groupedBarChartx0( d[this.fluxColName] ) + ",0)";
        }, this ) );

        var groupedBarRect = groupedBar.selectAll( "rect" )
                .data( jQuery.proxy( function( d )
        {
            return d.columnDetails;
        }, this ) );

        groupedBarRect.enter().append( "rect" )
                .attr( "width", this.groupedBarChartx1.rangeBand() )
                .attr( "x", jQuery.proxy( function( d )
        {
            return this.groupedBarChartx1( d.column );
        }, this ) )
                .attr( "y", jQuery.proxy( function( d )
        {
            return this.groupedBarCharty( d.yEnd );
        }, this ) )
                .attr( "height", jQuery.proxy( function( d )
        {
            return this.groupedBarCharty( d.yBegin ) - this.groupedBarCharty( d.yEnd );
        }, this ) );
        groupedBarRect.exit().remove();

        groupedBar
                .transition()
                .duration( 200 )
                .ease( "linear" )
                .selectAll( "rect" )
                .attr( "width", this.groupedBarChartx1.rangeBand() )
                .attr( "x", jQuery.proxy( function( d )
        {
            return this.groupedBarChartx1( d.column );
        }, this ) )
                .attr( "y", jQuery.proxy( function( d )
        {
            return this.groupedBarCharty( d.yEnd );
        }, this ) )
                .attr( "height", jQuery.proxy( function( d )
        {
            return this.groupedBarCharty( d.yBegin ) - this.groupedBarCharty( d.yEnd );
        }, this ) )
                .style( "fill", jQuery.proxy( function( d )
        {
            if( !d.color )
                d.color = this.color( d.name );
            return d.color;
        }, this ) );

        // Grouped Bar chart : rotate the x Axis labels
        d3.selectAll( "#groupedBarChartSvg g.x g text" )
                .style( "text-anchor", "end" )
                .attr( "transform", "translate(-10,0)rotate(315)" );
    },

    removeToGroupedBarChart: function( fluxName )
    {
        var index = getIndexInArray( this.displayedVariables, "name", fluxName );
        if( 0 > index )
            return;
        this.displayedVariables.splice( index, 1 );
        this.updateGroupedBarChart();
        if( 0 >= this.displayedVariables.length )
            $( "#groupedBarChartSvg" ).remove();
    },


    /* ******************************************************************** */
    /* ************************ OTHERS FOR CHARTS ************************* */
    /* ******************************************************************** */
    updateToolTipsForCharts: function()
    {
        // Tooltips
//        d3.selectAll( ".country, #functionBarChart .bar, #functionBarChart text, #groupedBarChart rect" ).call( this.toolTip );
//        d3.selectAll( ".country, #functionBarChart .bar, #functionBarChart text, #groupedBarChart rect" )
        d3.selectAll( ".country, #functionBarChart .bar, #functionBarChart text, #groupedBarChart .groupedBar rect" ).call( this.toolTip );
        d3.selectAll( ".country, #functionBarChart .bar, #functionBarChart text, #groupedBarChart .groupedBar rect" )
                .on( 'mouseover', this.toolTip.show )
                .on( 'mouseout', this.toolTip.hide );

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
                    this.chartHeight = $( "#pageWrapper" ).height() - $( "#imageFlux" ).height() - $( ".bottomBasicCell" ).css( "margin-top" ).replace( "px", "" ) - $( ".container-fluid" ).height() - 30;
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
            var div = $( '<div id="' + element.alt + '" name="' + element.alt + '" class="dynamicArea"></div>' );
            if( null != element.getAttribute( "isRed" ) )
                div.addClass( "redSynthesisText" );
            div.css( "top", coords[1] );
            div.css( "left", coords[0] );
            div.width( coords[2] - coords[0] );
            div.height( coords[3] - coords[1] );
            if( activeClick )
                div.on( "click", jQuery.proxy( function( argument )
                {
                    var fluxName = jQuery.i18n.prop( argument.currentTarget.getAttribute( "name" ) );
                    this.addOrRemoveToGroupedBarChart( argument.currentTarget, fluxName );
//                    this.functionChart.onClick( {key: fluxName} );
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
            $( "#groupedBarChart" ).empty();
            this.displayedVariables = [];

            dc.filterAll();
            dc.renderAll();
            this.updateToolTipsForCharts();

            $( "#" + jQuery.i18n.prop( "selectedFluxForHomePage" ) ).click();
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

        $( "#resetFunctionBarChart" ).on( "click", function()
        {
            alert( "work in progress" );
        } );

        // Region select button
        $( "#regionUnActive" ).on( "click", jQuery.proxy( function()
        {
            $( "#mapChart" ).addClass( "countryWithPointer" );
            this.geoChoroplethChart.setMultipleSelect( true );
            this.geoChoroplethChart.setSelect( true );
            $( "#regionUnActive" ).fadeOut();
            $( "#regionActive" ).fadeIn();
            $( "#globeActive" ).fadeOut();
            this.updateToolTipsForCharts();
        }, this ) );

        $( "#regionActive" ).on( "click", jQuery.proxy( function()
        {
            $( "#mapChart" ).removeClass( "countryWithPointer" );
            this.geoChoroplethChart.setSelect( false );
            this.onClickGeoChoroplethChart();
            $( "#regionUnActive" ).fadeOut();
            $( "#regionActive" ).fadeOut();
            $( "#globeActive" ).fadeIn();

            dc.filterAll();
            dc.renderAll();
            this.displayedVariables = [];
            $( "#dynamicAreasForImageFlux .dynamicArea" ).removeClass( "selected" );
            $( "#dynamicAreasForImageFlux .dynamicArea" ).click();
            this.updateToolTipsForCharts();
        }, this ) );

        $( "#globeActive" ).on( "click", jQuery.proxy( function()
        {
            $( "#mapChart" ).addClass( "countryWithPointer" );
            this.geoChoroplethChart.setMultipleSelect( false );
            this.geoChoroplethChart.setSelect( true );
            $( "#regionUnActive" ).fadeIn();
            $( "#regionActive" ).fadeOut();
            $( "#globeActive" ).fadeOut();
            this.updateToolTipsForCharts();
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
    },

    getI18nPropertiesKeyFromValue: function( value )
    {
        var result = false;
        $.each( jQuery.i18n.map, function( i, d )
        {
            if( jQuery.i18n.prop( i ) == value )
            {
                result = i;
                return false;
            }
        } );
        return result;
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
    console.log( filter + "(" + f.length + ") = " + JSON.stringify( f ).replace( "[", "[\n\t" ).replace( /}\,/g, "},\n\t" ).replace( "]", "\n]" ) );
}
