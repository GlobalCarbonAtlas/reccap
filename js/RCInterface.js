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
        d3.csv( "data/Reccap_data_transpose.csv", jQuery.proxy( function ( error, csv )
        {
            var data = crossfilter( csv );

            // Continents
            var continentsDimension = data.dimension( jQuery.proxy( function ( d )
            {
                this.continents.push( d["Carbon budget"] );
                return d["Carbon budget"];
            }, this ) );
            // Empty group, just to use the choropleth function
            var continentsGroup = continentsDimension.group();

            var bob = continentsDimension.filter( function( d )
            {
                return d;
            } );
            // NPP
            var nppGroup = continentsDimension.group().reduce(
                    function( p, v )
                    {
                        return v["NPP"];
                    },
                    function( p, v )
                    {
                    },
                    function( p, v )
                    {
                        return 0;
                    }
                    );


            d3.json( "data/continent-geogame-110m.json", jQuery.proxy( function( error, world )
            {
                var countries = topojson.feature( world, world.objects.countries );
                this.createChoroplethMap( countries, continentsDimension, continentsGroup );
                this.createNppChart( continentsDimension, nppGroup );
                dc.renderAll();
                this.updateCharts();
            }, this ) );
        }, this ) );
    },

    createChoroplethMap: function( countries, continentsDimension, continentsGroup )
    {
        var projection = d3.geo.equirectangular()
                .translate( [this.mapWidth / 2,  this.mapHeight / 2] )
                .scale( [90] );

        var mapChart = dc.geoChoroplethChart( "#map-chart" );
        mapChart.width( 800 )
                .height( 400 )
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

    createNppChart: function( continentsDimension, nppGroup )
    {
        var nppChart = dc.barChart( "#npp-chart" );

        nppChart.height( 400 )
                .width( 300 )
                .transitionDuration( 750 )
                .margins( {top: 20, right: 10, bottom: 80, left: 80} )
                .dimension( continentsDimension )
                .group( nppGroup )
                .brushOn( false )
                .title( function ( d )
        {
            return d.value;
        } )
                .gap( 1 )
                .elasticY( true )
                .colors( ['#FF7F0E'] )
                .xUnits( dc.units.ordinal )
                .x( d3.scale.ordinal().domain( this.continents ) )
                .y( d3.scale.linear().domain( [0, 5500000] ) )
                .renderHorizontalGridLines( true )
                .yAxis().tickFormat( d3.format( "s" ) );
        nppChart.xAxis();
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
    }

} );
