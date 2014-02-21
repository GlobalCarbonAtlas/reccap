/*
 ##########################################################################

 Patrick.Brockmann@lsce.ipsl.fr      for Global Carbon Atlas
 Vanessa.Maigne@ipsl.jussieu.fr      for Global Carbon Atlas

 PLEASE DO NOT COPY OR DISTRIBUTE WITHOUT PERMISSION

 ##########################################################################
 */
var RCInterface = Class.create( {

    initialize: function()
    {

        // Param
        this.containerMap = $( "#containerMap" );
        this.mapWidth = 600;
        this.mapHeight = 300;

        // Variable
        this.numberFormat = d3.format( ".2f" );
        this.continents = new Array;

        this.createDCObjects();
    },

    createDCObjects: function()
    {
        d3.csv( "data/Reccap_data_rows.csv", jQuery.proxy( function ( error, csv )
        {
            var data = crossfilter( csv );

            // Dimensions
            var continents = data.dimension( jQuery.proxy( function( d )
            {
                return d["Continents"];
            }, this ) );

            var carbonBudgets = data.dimension( function( d )
            {
                return d["Carbon budget"];
            } );

            // Groups
            var nppGroup = this.getValuesGroupByBudget( continents, "NPP" );
            var hrGroup = this.getValuesGroupByBudget( continents, "Heterotrophic Respiration" );
            var budgetAmoutGroup = carbonBudgets.group().reduceSum( function ( d )
            {
                return d["Value"];
            } );

            this.createBarChart( "#npp-chart", continents, nppGroup );
            this.createBarChart( "#hr-chart", continents, hrGroup );
            this.createFunctionChart( "#function-chart", carbonBudgets, budgetAmoutGroup );
            this.createDataTable( data, data.groupAll(), continents );
            d3.json( "data/continent-geogame-110m.json", jQuery.proxy( function( error, world )
            {
                var countries = topojson.feature( world, world.objects.countries );
                this.createChoroplethMap( countries, continents, continents.group() );
                dc.renderAll();
                this.updateCharts();
            }, this ) );
        }, this ) );
    },

    createDataTable: function( allD, allG, tableD )
    {
        dc.dataCount( "#data-count" )
                .dimension( allD )
                .group( allG );

        dc.dataTable( "#data-table" )
                .dimension( tableD )
                .group( function( d )
        {
//            if( d["Value"] )
            return d["Continents"];
        } )
                .size( 300 )
                .columns( [
                function ( d )
                {
//                    if( d["Value"] )
                    return d["Carbon budget"];
                },
                function ( d )
                {
//                    if( d["Value"] )
                    return d["Value"];
                }
        ] ).renderlet( function ( table )
        {
            table.selectAll( ".dc-table-group" ).classed( "info", true );
        } );
    },

    createFunctionChart: function( chartId, functions, functionsGroup )
    {
        var functionChart = dc.rowChart( chartId );

//        var expenseColors = ["#fee391","#fec44f","#fe9929","#fd8d3c","#e08214","#fdb863","#fdae6b","#ec7014"];
        var expenseColors = ["#fde0dd","#fa9fb5","#e7e1ef","#d4b9da","#c994c7","#fcc5c0","#df65b0","#e7298a","#ce1256", "#f768a1","#dd3497","#e78ac3","#f1b6da","#c51b7d"];
        functionChart.width( 500 )
                .height( 800 )
                .margins( {top: 20, left: 10, right: 10, bottom: 20} )
                .transitionDuration( 750 )
                .dimension( functions )
                .group( functionsGroup )
                .colors( d3.scale.category20() )
//                .colors( expenseColors )
//                .renderLabel( true )
//                .title( function ( d )
//        {
//            return "";
//        } )
//                .elasticX( true )
                .xAxis().ticks( 5 ).tickFormat( d3.format( "s" ) );
    },

    createChoroplethMap: function( countries, continentsDimension, continentsGroup )
    {
        var projection = d3.geo.equirectangular()
                .translate( [this.mapWidth / 2,  this.mapHeight / 2] )
                .scale( [90] );

        var mapChart = dc.geoChoroplethChart( "#map-chart" );
        mapChart.width( this.mapWidth )
                .height( this.mapHeight )
                .dimension( continentsDimension )
                .group( continentsGroup )
                .projection( projection )
                .overlayGeoJson( countries.features, "country", function( d )
        {
            return d.properties.continent;
        } )
                .title( function ( d )
        {
            return d.key + ", " + d.value;
        } );
    },

    createBarChart: function( chartId, dimension, group )
    {
        var barChart = dc.barChart( chartId );

        barChart.height( 400 )
                .width( 300 )
                .transitionDuration( 750 )
                .margins( {top: 20, right: 10, bottom: 80, left: 80} )
                .dimension( dimension )
                .group( group )
                .brushOn( false )
                .elasticY( true )
                .colors( ['#FF7F0E'] )
                .xUnits( dc.units.ordinal )
                .x( d3.scale.ordinal() )
                .y( d3.scale.linear() )
                .renderHorizontalGridLines( true )
                .yAxis().tickFormat( d3.format( "s" ) );
    },

    updateCharts: function()
    {
        // Tooltips for bar chart
        var barTip = d3.tip()
                .attr( 'class', 'd3-tip' )
                .offset( [-10, 0] )
                .html( jQuery.proxy( function ( d )
        {
            return "<span class='d3-tipTitle'>" + d.data.key + "</span> : " + this.numberFormat( d.y );
        }, this ) );

        d3.selectAll( ".bar" ).call( barTip );
        d3.selectAll( ".bar" )
                .on( 'mouseover', barTip.show )
                .on( 'mouseout', barTip.hide );

        // NPP : rotate the x Axis labels
        d3.selectAll( "g.x g text" )
                .attr( "class", "campusLabel" )
                .style( "text-anchor", "end" )
                .attr( "transform", "translate(-10,0)rotate(315)" );
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
    }



} );
