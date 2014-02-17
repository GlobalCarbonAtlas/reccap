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
        this.mapWidth = 960;
        this.mapHeight = 480;

        this.createMap();
    },

    createMap: function()
    {
        var projection = d3.geo.equirectangular()
                .translate( [this.mapWidth / 2,  this.mapHeight / 2] )
                .scale( [100] );

        var path = d3.geo.path()
                .projection( projection );

        var svg3 = d3.select( "#containerMap" ).append( "svg" )
                .attr( "width", this.mapWidth )
                .attr( "height", this.mapWidth / 2 );

        var g = svg3.append( "g" ).attr( "id", "innerg" );


        d3.json( "data/continent-geogame-110m.json", function( error, world )
//d3.json( "data/bob.json", function( error, world )
        {
            var countries = topojson.feature( world, world.objects.countries );
            var asia = {type: "FeatureCollection", name: "Asia", color: "#ffbb78", id:1, features: countries.features.filter( function( d )
            {
                return "Asia" == d.properties.continent;
            } )};
            var africa = {type: "FeatureCollection", name: "Africa", color: "#f4d362", id:2, features: countries.features.filter( function( d )
            {
                return "Africa" == d.properties.continent;
            } )};
            var europe = {type: "FeatureCollection", name: "Europe", color: "#f4e8c3", id:3, features: countries.features.filter( function( d )
            {
                return "Europe" == d.properties.continent;
            } )};
            var na = {type: "FeatureCollection", name: "North America", color: "#97cc31", id:4, features: countries.features.filter( function( d )
            {
                return "North America" == d.properties.continent;
            } )};
            var sa = {type: "FeatureCollection", name: "South America", color: "#cc9866", id:5, features: countries.features.filter( function( d )
            {
                return "South America" == d.properties.continent;
            } )};
            var antarctica = {type: "FeatureCollection", name: "Antarctica", color: "#d3ecfc", id:6, features: countries.features.filter( function( d )
            {
                return "Antarctica" == d.properties.continent;
            } )};
            var oceania = {type: "FeatureCollection", name: "Oceania", color: "#aec7e8", id:7, features: countries.features.filter( function( d )
            {
                return "Oceania" == d.properties.continent;
            } )};
//skipped: Seven seas (open ocean) - only applies to French Southern and Antarctic Lands
            var continents = [asia,africa,europe,na,sa,antarctica,oceania];
            var continent = g.selectAll( ".continent" ).data( continents );
            continent.enter().insert( "path" )
                    .attr( "class", "continent" )
                    .attr( "d", path )
                    .attr( "id", function( d, i )
            {
                return d.id;
            } )
                    .attr( "title", function( d, i )
            {
                return d.name;
            } )
                    .style( "fill", function( d, i )
            {
                return d.color;
            } );
            continent.on( "mousemove", function( d, i )
            {
                var mouse = d3.mouse( svg3.node() ).map( function( d )
                {
                    return parseInt( d );
                } );
            } );
        } );

    }




} );
