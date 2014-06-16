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

        this.initFileValuesAndCreateDCObjects();
        this.bindActions();
    },

    initFileValuesAndCreateDCObjects:function()
    {
        d3.csv( "data/Reccap_data_rows.csv", jQuery.proxy( function ( error, csv )
        {
            this.data = crossfilter( csv );

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

            this.continents = this.data.dimension( function( d )
            {
                return d["Continents"];
            } );

            // Create DC Objects
            this.createMap();
            this.createFunctions();
            this.createDataTable( "#data-count", "#data-table", this.data, this.data.groupAll(), this.continents );

            dc.renderAll();
        }, this ) );
    },

    /* ******************************************************************** */
    /* ******************************** DC ******************************** */
    /* ******************************************************************** */
    createMap: function()
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

    createSimpleDCObject: function( dimensionValue, groupValue, DCObjectValue, chartId, width, height )
    {
        var dimension = this.data.dimension( function( d )
        {
            return d[dimensionValue];
        } );

        var group = this.getValuesGroupByBudget( dimension, groupValue );

        switch( DCObjectValue )
        {
            case "bar" :
                this.createBarChart( chartId, width, height, dimension, group );
                break;
            case "flux" : this.createFluxChart( chartId, width, height, dimension, group );
                break;
            case "row" : this.createRowChart( chartId, width, height, dimension, group );
                break;
        }
//        dc.renderAll();
//        this.updateCharts();
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
    /* ****************************** OTHERS ****************************** */
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

        d3.selectAll( ".country, g.row" ).call( toolTip );
//        d3.selectAll( ".country, .bar, .pie-slice, .row" )
        d3.selectAll( ".country, g.row" )
                .on( 'mouseover', toolTip.show )
                .on( 'mouseout', toolTip.hide );


        // Bar chart : rotate the x Axis labels
        d3.selectAll( "g.x g text" )
                .attr( "class", "campusLabel" )
                .style( "text-anchor", "end" )
                .attr( "transform", "translate(-10,0)rotate(315)" );
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

    addBarChart: function( chartId, width, height, dimensionValue, groupValue )
    {
        var childrenNumber = $( chartId ).children().length;
        $( chartId ).append( '<div id="bar-chart' + childrenNumber + '"></div>' );
        this.createSimpleDCObject( dimensionValue, groupValue, "bar", "#bar-chart" + childrenNumber, width, height );
    },

    bindActions: function()
    {
        // Reset button
        $( "#reset" ).on( "click", jQuery.proxy( function()
        {
            dc.filterAll();
            dc.renderAll();
            this.updateCharts();
        }, this ) );

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
            $( "#dataDiv" ).fadeToggle();
        }, this ) );

        $( "#hiddenDiv" ).on( "click", jQuery.proxy( function()
        {
            $( "#dataDiv" ).fadeOut();
            $( "#synthesisDiv" ).fadeOut();
            $( "#hiddenDiv" ).fadeToggle();
        }, this ) );

        // Synthesis button
        $( "#synthesis" ).on( "click", jQuery.proxy( function()
        {
            $( "#hiddenDiv" ).fadeToggle();
            $( "#synthesisDiv" ).fadeToggle();
        }, this ) );


        // Image flux
        $( "#flux-img" ).on( "click", jQuery.proxy( function()
        {
            var arrayGroup = ["Heterotrophic Respiration", "Land use change", "NPP", "GPP"];
            this.addBarChart( "#bar-chart", 300, 200, "Continents", arrayGroup[Math.floor( Math.random() * arrayGroup.length )] );
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