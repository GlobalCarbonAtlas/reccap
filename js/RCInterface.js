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
        this.initMapWidth = 600;
        this.initMapScale = 90;
        this.functionChartHeight = 550;
        this.color = d3.scale.category20c();

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
            else
            // Row chart
                return "<span class='d3-tipTitle'>" + d.key + " : </span>" + this.numberFormat( d.value );
        }, this ) );


        this.createDynamicAreasForResponsiveMap( "#imageFlux", "#mapForImageFlux", "#dynamicAreasForImageFlux", $( "#bar-chart" ).width(), true );
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
            this.createChoroplethMap( "#map-chart", $( "#map-chart" ).width(), $( "#map-chart" ).width() / 2, countries, this.continents, this.continents.group() );
            dc.renderAll();
            this.updateCharts();

            $( "#Fire" ).click();
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

        this.createRowChart( "#function-chart", $( "#function-chart" ).width(), this.functionChartHeight, carbonBudgets, budgetAmountGroup );
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
        this.rowChart = dc.rowChart( chartId )
                .width( width )
                .height( height )
                .margins( {top: 20, left: 10, right: 10, bottom: 20} )
                .transitionDuration( 750 )
                .dimension( functions )
                .group( functionsGroup )
                .colors( this.color )
                .title( function ( d )
        {
            return "";
        } )
                .elasticX( true );

        this.rowChart.xAxis().tickFormat( d3.format( "s" ) );
        this.rowChart.setCallBackOnClick( jQuery.proxy( this.onClickRowChart, this ) );

//        legendsEnter.append( 'foreignObject' )
//                .attr( 'x', 10 )
//                .attr( 'y', -11 )
//                .attr( 'width', this.legendSvgWidth - 40 )
//                .attr( 'height', 20 )
//                .append( "xhtml:body" )
//                .html( '<div class="legendText"></div>' )
//
//        // Update width, text and title when remove legend & two columns
//        legends.select( '.legendText' )
//                .attr( 'style', jQuery.proxy( function()
//        {
//            var widthValue = this.isTwoColumns ? this.legendSvgWidth / 2 - 50 : this.legendSvgWidth - 40;
//            return "width:" + widthValue;
//        }, this ) )
//                .attr( "title", jQuery.proxy( function( d, i )
//        {
//            var textWidth = getTextWidth( this.graphContainerId, d.label );
//            var legendWidth = this.isTwoColumns ? this.legendSvgWidth / 2 - 10 : this.legendSvgWidth;
//            return textWidth + 31 > legendWidth ? d.label : "";
//        }, this ) )
//                .html( jQuery.proxy( function( d, i )
//        {
//            return d.label;
//        }, this ) );

    },

    onClickRowChart: function( element )
    {
        var dynamicAreaDivId = element.key.replace( / /g, "_" );
        this.addOrRemoveToGroupedBarChart( $( "#" + dynamicAreaDivId ), element.key );
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
            var barChartHeight = this.functionChartHeight - 50;
            this.createOrAddToBarChart( "#bar-chart", $( "#bar-chart" ).width(), barChartHeight, fluxName );
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

        this.barChartx0 = d3.scale.ordinal().rangeRoundBands( [0, this.barChartWidth], 0.1 ).domain( this.continentsKeys );
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
            return d;
        } );
        legend.exit().remove();

        // When remove bar
        legend.select( "text" )
                .style( "fill", "#2C3537" )
//                .style( "fill", jQuery.proxy( function( d )
//        {
//            if( !d.color )
//                d.color = this.color( d.name );
//            return d.color;
//        }, this ) )
                .text( function( d )
        {
            return d.name;
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
            this.rowChart.onClick( {key: d.name} );
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
            return "translate(" + this.barChartx0( d["Carbon budget"] ) + ",0)";
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
                                this.rowChart.onClick( {key: argument.currentTarget.getAttribute( "name" )} );
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
        this.continentsKeys.sort();

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
