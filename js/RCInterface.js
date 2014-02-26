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
        // Variable
        this.numberFormat = d3.format( ".2f" );

        this.createDCObjects();
        this.bindActions();
    },

    createDCObjects: function()
    {
        d3.csv( "data/Reccap_data_rows.csv", jQuery.proxy( function ( error, csv )
        {
            var data = crossfilter( csv );

            // TODO : see why it applies to ALL data
            data.dimension(
                function( d )
                {
                    return d["Value"];
                } ).filter(
                function( d )
                {
                    if( 0 < Math.abs( d ) )
                        return d;
                } );

            // Dimensions
            var continents = data.dimension( function( d )
            {
                return d["Continents"];
            } );

            var carbonBudgets = data.dimension( function( d )
            {
                return d["Carbon budget"];
            } );


            // Groups
            var nppGroup = this.getValuesGroupByBudget( continents, "NPP" );
            var gppGroup = this.getValuesGroupByBudget( continents, "GPP" );
            var hrGroup = this.getValuesGroupByBudget( continents, "Heterotrophic Respiration" );
            var budgetAmountGroup = carbonBudgets.group().reduceSum( function ( d )
            {
                return d3.format( ".2f" )( d["Value"] );
            } );

            // Hack because this functionality is not yet available in dc.js
            var filteredFunctionAmountGroup = {
                all: function () {
                    return budgetAmountGroup.top(Infinity).filter( function (d) { return d.value !== 0; } );
                }
            };

            var nppGppGroup = continents.group().reduce(
                function ( p, v )
                {
                    if( "NPP" == v["Carbon budget"] )
                        p.npp += v["Value"];
                    if( "GPP" == v["Carbon budget"] )
                        p.gpp += v["Value"];
                    return p;
                },
                function ( p, v )
                {
                    if( "NPP" == v["Carbon budget"] )
                        p.npp -= v["Value"];
                    if( "GPP" == v["Carbon budget"] )
                        p.gpp -= v["Value"];
                    return p;
                },
                function ()
                {
                    return {npp: "", gpp: ""};
                } );

            // Create objects
            this.createDoubleBarChart( "#npp-gpp-chart", 300, 400, continents, nppGppGroup, "gpp", "GPP", "npp", "NPP" );
            this.createBarChart( "#hr-chart", 300, 200, continents, hrGroup );
            this.createPieChart( "#function-pie-chart", carbonBudgets, budgetAmountGroup );
            this.createFunctionChart( "#function-chart", 500, 800, carbonBudgets, filteredFunctionAmountGroup );
            this.createDataTable( "#data-count", "#data-table", data, data.groupAll(), continents );
            d3.json( "data/continent-geogame-110m.json", jQuery.proxy( function( error, world )
            {
                var countries = topojson.feature( world, world.objects.countries );
                this.createChoroplethMap( "#map-chart", 600, 300, countries, continents, continents.group() );
                dc.renderAll();
                this.updateCharts();
            }, this ) );
        }, this ) );
    },

    /* ******************************************************************** */
    /* ****************************** CHARTS ****************************** */
    /* ******************************************************************** */
    createChoroplethMap: function( chartId, width, height, countries, continentsDimension, continentsGroup )
    {
        var projection = d3.geo.equirectangular()
            .translate( [width / 2,  height / 2] )
            .scale( [90] );

        dc.geoChoroplethChart( chartId )
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
                return d.key + ", " + d.value;
            } );
    },

    createBarChart: function( chartId, width, height, dimension, group )
    {
        dc.barChart( chartId )
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

    createDoubleBarChart: function( chartId, width, height, dimension, group, groupValue1, titleGroup1, groupValue2, titleGroup2 )
    {
        dc.barChart( chartId )
            .width( width )
            .height( height )
            .margins( {top: 20, right: 10, bottom: 80, left: 80} )
            .dimension( dimension )
            .xUnits( dc.units.ordinal )
            .x( d3.scale.ordinal() )
            .group( group, titleGroup1 )
            .valueAccessor( function( d )
            {
                return d.value[groupValue1];
            } )
            .stack( group, titleGroup2, function( d )
            {
                return d.value[groupValue2];
            } )
            .legend( dc.legend().x( 250 ).y( 280 ) )
            .elasticY( true )
            .renderHorizontalGridLines( true )
            .title( function( d )
            {
                return d.key + "\n" + titleGroup1 + ": " + d.value.gpp + "\n" + titleGroup2 + ": " + d.value.npp;
            } )
            .yAxis().tickFormat( d3.format( "s" ) );
    },

    createPieChart: function( chartId, dimension, group )
    {
        var expenseColors = ["#fde0dd","#fa9fb5","#e7e1ef","#d4b9da","#c994c7","#fcc5c0","#df65b0","#e7298a","#ce1256", "#f768a1","#dd3497","#e78ac3","#f1b6da","#c51b7d"];

        dc.pieChart( chartId )
            .width( 100 )
            .height( 200 )
            .transitionDuration( 750 )
            .radius( 50 )
            .innerRadius( 30 )
            .dimension( dimension )
//                .title( function ( d )
//        {
//            return "";
//        } )
            .group( group )
            .colors( d3.scale.category20() );
//                .renderLabel( false );
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
            .size( 300 )
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

    createFunctionChart: function( chartId, width, height, functions, functionsGroup )
    {
//        var expenseColors = ["#fee391","#fec44f","#fe9929","#fd8d3c","#e08214","#fdb863","#fdae6b","#ec7014"];
        var expenseColors = ["#fde0dd","#fa9fb5","#e7e1ef","#d4b9da","#c994c7","#fcc5c0","#df65b0","#e7298a","#ce1256", "#f768a1","#dd3497","#e78ac3","#f1b6da","#c51b7d"];

        var functionChart = dc.rowChart( chartId )
            .width( width )
            .height( height )
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
            .elasticX( true )
            .xAxis().tickFormat( d3.format( "s" ) );
    },


    /* ******************************************************************** */
    /* ****************************** OTHERS ****************************** */
    /* ******************************************************************** */
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
    },

    bindActions: function()
    {
        $("#reset").on("click", jQuery.proxy(function()
        {
            dc.filterAll();
            dc.renderAll();
            this.updateCharts();
        }, this));
    }



} );


function print_filter( filter )
{
    var f = eval( filter );
    if( typeof(f.length) != "undefined" )
    {
    }
    else
    {
    }
    if( typeof(f.top) != "undefined" )
    {
        f = f.top( Infinity );
    }
    else
    {
    }
    if( typeof(f.dimension) != "undefined" )
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