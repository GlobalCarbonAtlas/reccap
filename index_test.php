<HTML>

<!--
 ##########################################################################

 Vanessa.Maigne@lsce.ipsl.fr    for Global Carbon Atlas

 PLEASE DO NOT COPY OR DISTRIBUTE WITHOUT PERMISSION

 ##########################################################################
-->

<HEAD>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>GCA Reccap</title>
    <link rel="icon" href="img/globe.png" type="image/png">

    <!--    <link rel="stylesheet" type="text/css" href="js/dc.js-master/web/css/bootstrap.min.css">-->
    <link rel="stylesheet" type="text/css" href="css/bootstrap-3.1.1-dist/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="js/dc.js-master/web/css/dc.css">
    <!--    <link rel="stylesheet" type="text/css" href="css/globalCarbonAtlas.css">-->
    <link rel="stylesheet" type="text/css" href="css/RCInterface_white.css">

    <script type="text/javascript" src="js/library/jquery-1.9.1.js"></script>
    <script type="text/javascript" src="js/dc.js-master/web/js/d3.js"></script>
    <script type="text/javascript" src="js/dc.js-master/web/js/crossfilter.js"></script>
    <script type="text/javascript" src="js/dc.js-master/web/js/dc.js"></script>
    <script type="text/javascript" src="js/dc_lsce.js"></script>
    <script type="text/javascript" src="js/library/topojson.v1.min.js"></script>
    <script type="text/javascript" src="js/library/d3.tip.min.js"></script>
    <script type="text/javascript" src="js/library/jquery.class.js"></script>

</HEAD>
<BODY>

<div id="pageWrapper">
    <center><h1>REgional Carbon Cycle Assessment and Processes</h1></center>

    <div class="rowWrapper">
        <div class="DCObject">
            <h2>Net Primary Production</h2>

            <div id="npp-gpp-chart"></div>
        </div>

        <div class="DCObject">
            <div class="">
                <h2>Choropleth Map</h2>

                <div id="map-chart"></div>
            </div>
            <div id="reset">Reset All</div>
        </div>

        <div class="DCObject">
            <h2>Heterotrophic Respiration</h2>

            <div id="hr-chart"></div>
        </div>

        <div class="DCObject functionsPie">
            <h2>Functions</h2>

            <div id="function-pie-chart"></div>
        </div>

    </div>

    <div class="rowWrapper">
<!--        <div class="DCObject">-->
<!--            <h2>Flux</h2>-->
<!---->
<!--<!--            <img src="img/CarbonBudget_maquette.jpg" width="800px"/>-->-->
<!--            <!--            <div id="flux-chart"></div>-->-->
<!--        </div>-->

        <div class="DCObject">
            <h2>GPP / NPP</h2>

            <div id="bubble-chart"></div>
        </div>

    </div>

    <div class="rowWrapper">
        <BR/> <BR/>

        <div class="DCObject">
            <h2>Data</h2>

            <div id="data-count" class="dc-data-count dc-chart">
                <span class="filter-count"></span> selected out of <span class="total-count"></span> records
            </div>
            <BR/><BR/>

            <table id="data-table" class="table table-hover dc-data-table dc-chart">
                <thead>
                <tr class="header">
                    <th>Carbon budget</th>
                    <th>Value</th>
                </tr>
                </thead>
            </table>
        </div>

        <div class="DCObject">
            <div class="smallBar">
                <h2>Land use change</h2>

                <div id="landUse-chart"></div>
            </div>

            <div class="smallBar">
                <h2>River export to ocean</h2>

                <div id="riverExport-chart"></div>
            </div>

            <div class="smallBar">
                <h2>Logging</h2>

                <div id="logging-chart"></div>
            </div>
        </div>

        <div class="DCObject functionsRow">
            <h2>Functions</h2>

            <div id="function-chart"></div>
        </div>
    </div>
</div>

<script type="text/javascript">
var RCInterface = Class.create( {

    initialize: function()
    {
        // Variable
        this.numberFormat = d3.format( ".2f" );

        this.createDCObjects();
        this.bindActions();
    },


    /* ******************************************************************** */
    /* ******************************** DC ******************************** */
    /* ******************************************************************** */
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
            this.continents = data.dimension( function( d )
            {
                return d["Continents"];
            } );

            var carbonBudgets = data.dimension( function( d )
            {
                return d["Carbon budget"];
            } );

            // Groups
            var nppGroup = this.getValuesGroupByBudget( this.continents, "NPP" );
            var gppGroup = this.getValuesGroupByBudget( this.continents, "GPP" );
            var hrGroup = this.getValuesGroupByBudget( this.continents, "Heterotrophic Respiration" );
            var landUseGroup = this.getValuesGroupByBudget( this.continents, "Land use change" );
            var riverExportGroup = this.getValuesGroupByBudget( this.continents, "River export to ocean" );
            var loggingGroup = this.getValuesGroupByBudget( this.continents, "Logging" );
            var budgetAmountGroup = carbonBudgets.group().reduceSum( function ( d )
            {
                return d3.format( ".2f" )( d["Value"] );
//                return d3.format( "s" )( d["Value"] );
            } );
            print_filter( budgetAmountGroup );

            var bob = budgetAmountGroup.top( Infinity ).filter( function ( d )
            {
                return 0 !== d.value;
            } );
            var dataBob = crossfilter( bob );
            var carbonBudgetsBob = dataBob.dimension( function( d )
            {
                return d["Carbon budget"];
            } );
            print_filter( carbonBudgetsBob );

            // Hack because this functionality is not yet available in dc.js
            var filteredFunctionAmountGroup = {
                all: function ()
                {
                    return budgetAmountGroup.top( Infinity ).filter( function ( d )
                    {
                        return d.value !== 0;
                    } );
                }
            };

            var nppGppGroup = this.continents.group().reduce(
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
            this.createDoubleBarChart( "#npp-gpp-chart", 300, 400, this.continents, nppGppGroup, "gpp", "GPP", "npp", "NPP" );
            this.createBarChart( "#hr-chart", 300, 200, this.continents, hrGroup );
            this.createBarChart( "#landUse-chart", 300, 250, this.continents, landUseGroup );
            this.createBarChart( "#riverExport-chart", 300, 250, this.continents, riverExportGroup );
            this.createBarChart( "#logging-chart", 300, 250, this.continents, loggingGroup );
            this.createFluxChart( "#flux-chart", 500, 800, carbonBudgets, filteredFunctionAmountGroup );
            this.createPieChart( "#function-pie-chart", carbonBudgets, budgetAmountGroup );
            this.createRowChart( "#function-chart", 500, 800, carbonBudgets, filteredFunctionAmountGroup );
            this.createBubbleChart( "#bubble-chart", 400, 500, this.continents, nppGppGroup );
            this.createDataTable( "#data-count", "#data-table", data, data.groupAll(), this.continents );
            d3.json( "data/continent-geogame-110m.json", jQuery.proxy( function( error, world )
            {
                var countries = topojson.feature( world, world.objects.countries );
                this.createChoroplethMap( "#map-chart", 600, 300, countries, this.continents, this.continents.group() );
                dc.renderAll();
                this.updateCharts();
            }, this ) );
            dc.renderAll();

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
            return "";
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

    // TODO : check the stack calcul
    createDoubleBarChart: function( chartId, width, height, dimension, group, groupValue1, titleGroup1, groupValue2, titleGroup2 )
    {
        dc.barChart( chartId )
                .width( width )
                .height( height )
                .margins( {top: 20, right: 10, bottom: 80, left: 80} )
                .dimension( dimension )
                .xUnits( dc.units.ordinal )
                .x( d3.scale.ordinal() )
                .group( group, titleGroup2 )
                .valueAccessor( function( d )
        {
            return d.value[groupValue2] ? parseFloat( d.value[groupValue2] ) : 0;
        } )
                .stack( group, titleGroup1, function( d )
        {
            return d.value[groupValue1] && d.value[groupValue2] ? parseFloat( d.value[groupValue1] ) - parseFloat( d.value[groupValue2] ) : 0;
        } )
                .legend( dc.legend().x( 250 ).y( 280 ) )
                .elasticY( true )
                .renderHorizontalGridLines( true )
                .title( function( d )
        {
            return "";
        } )
                .yAxis().tickFormat( d3.format( "s" ) );
    },

    createFluxChart: function( chartId, width, height, functions, functionsGroup )
    {
        dc_lsce.fluxChart( chartId )
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
            return d.name;
        } )
                .elasticX( true )
                .xAxis().tickFormat( d3.format( "s" ) );
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
                .title( function ( d )
        {
            return "";
        } )
                .group( group )
                .colors( d3.scale.category20() );
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

    createBubbleChart: function( chartId, width, height, functions, functionsGroup )
    {
        var bubbleChart = dc.bubbleChart( chartId )
                .width( width )
                .height( height )
                .margins( {top: 0, right: 0, bottom: 70, left: 90} )
                .dimension( functions )
                .group( functionsGroup )
                .colors( d3.scale.category20() )
                .keyAccessor( function ( p )
        {
            return p.value["npp"] ? Math.abs( p.value["npp"] ) : 1;
        } )
                .valueAccessor( function( p )
        {
            return p.value["gpp"] ? Math.abs( p.value["gpp"] ) : 1;
        } )
                .radiusValueAccessor( function ( p )
        {
            return p.value["npp"] ? Math.abs( p.value["npp"] ) : 1;
        } )
                .x( d3.scale.linear().domain( [0, 20000] ) )
                .r( d3.scale.linear().domain( [0, 50000] ) )
//                .minRadiusWithLabel( 15 )
                .elasticY( false )
                .yAxisPadding( 100 )
                .elasticX( false )
                .xAxisPadding( 100 )
//                .maxBubbleRelativeSize( 0.07 )
                .renderHorizontalGridLines( true )
                .renderVerticalGridLines( true )
//                .renderLabel( true )
//                .renderTitle( true )
                .title( function ( p )
        {
            return p.key
                    + "\n"
                    + "GPP: " + p.value["gpp"] + "\n"
                    + "NPP: " + p.value["npp"];
        } );

        bubbleChart.yAxis().tickFormat( function ( s )
        {
            return s + " gpp";
        } );
        bubbleChart.xAxis().tickFormat( function ( s )
        {
            return s + " npp";
        } );
    },


    /* ******************************************************************** */
    /* ****************************** OTHERS ****************************** */
    /* ******************************************************************** */
    updateCharts: function()
    {
        // Tooltips for bar chart
        var toolTip = d3.tip()
                .attr( 'class', 'd3-tip' )
                .offset( [-10, 0] )
                .html( jQuery.proxy( function ( d )
        {
            if( d.properties )
            // Choropleth
                return  "<span class='d3-tipTitle'>" + d.properties.continent + "</span>";
            if( d.data )
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

        console.log( d3.selectAll( ".country" )[0].length + ", " + d3.selectAll( ".country" )[0][0].__data__.properties.name );
        d3.selectAll( ".row" ).call( toolTip );
//        d3.selectAll( ".country, .bar, .pie-slice, .row" ).call( toolTip );
        d3.selectAll( ".country, .bar, .pie-slice, .row" )
                .on( 'mouseover', toolTip.show )
                .on( 'mouseout', toolTip.hide );

        // bar chart : rotate the x Axis labels
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

    bindActions: function()
    {
        // Reset button
        $( "#reset" ).on( "click", jQuery.proxy( function()
        {
            dc.filterAll();
            dc.renderAll();
            this.updateCharts();
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
$( document ).ready( function ()
{
    new RCInterface();
} );

</script>

</BODY>
</HTML>


