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
        this.dataFilePath = jQuery.i18n.prop( "dataFilePath" );
        this.regionColName = jQuery.i18n.prop( "regionColName" );
        this.fluxColName = jQuery.i18n.prop( "fluxColName" );
        this.valueColName = jQuery.i18n.prop( "valueColName" );
        this.uncertaintyColName = jQuery.i18n.prop( "uncertaintyColName" );
        this.mainFlux = JSON.parse( jQuery.i18n.prop( "mainFlux" ) );
        this.yDomainForMainFlux = JSON.parse( jQuery.i18n.prop( "yDomainForMainFlux" ) );
        this.yDomainForAllMainFlux = JSON.parse( jQuery.i18n.prop( "yDomainForAllMainFlux" ) );
        this.separatedFlux = JSON.parse( jQuery.i18n.prop( "separatedFlux" ) );
        this.yDomainForSeparatedFlux = JSON.parse( jQuery.i18n.prop( "yDomainForSeparatedFlux" ) );
        this.yDomainForAllSeparatedFlux = JSON.parse( jQuery.i18n.prop( "yDomainForAllSeparatedFlux" ) );
        this.needToAdaptDomains = JSON.parse( jQuery.i18n.prop( "needToAdaptDomains" ) );
        this.regionFilePath = jQuery.i18n.prop( "regionFilePath" );
        this.globeRegion = jQuery.i18n.prop( "globeRegion" );

        // Variables
        this.initMapWidth = 600;
        this.initMapScale = 90;
        this.chartHeight = 0;
        this.groupedBarChartWidth = $( "#groupedBarChart" ).width();
        this.functionBarChartWidth = $( "#functionBarChart" ).width();
        this.imageHeight = 0;
        this.barCharMargin = {top: 10, right: 20, bottom: 75, left: 35};
        var colors = d3.scale.category20c().range();
        colors[2] = "#555555";
        this.color = d3.scale.ordinal().range( colors );
        this.selectMultipleRegion = false;
        this.displayUncertainty = false;

        // Areas for maps
        this.createDynamicAreasForResponsiveMap( "#imageFlux", "#mapForImageFlux", "#dynamicAreasForImageFlux", this.groupedBarChartWidth, true );
        this.createDynamicAreasForResponsiveMap( "#imageFluxForSynthesis", "#mapForImageFluxForSynthesis", "#dynamicAreasForImageFluxForSynthesis", 900, false );

        this.initToolTips();
        this.bindActions();
        $( "#synthesis" ).click();
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
                return "<span class='d3-tipTitle'>" + d.name + " : </span>" + this.numberFormat( value );
            }
            else if( d.data )
            // Bar chart
                if( "UncertaintyLayer" == d.layer && this.displayUncertainty )
                    return "<span class='d3-tipTitle'>" + d.data.key + " : </span>" + this.numberFormat( d.y0 ) + " (uncertainty : " + this.numberFormat( d.y0 - d.data.value ) + ")";
                else
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

        $( "#regionAndUncertaintySelect .toolButton img" ).tooltip( {
            placement: "right",
            container:'body'} );
    },

    initFileValuesAndCreateDCObjects:function()
    {
        // To set ',' in separator for .csv file, save first in .ods then in .csv and then fill the asked fiels
        d3.csv( this.dataFilePath, jQuery.proxy( function ( error, csv )
        {
            // Init this.transposedData & this.regionsKeys
            this.transposeDataFromFile( csv );

            this.data = crossfilter( csv );
            // Filter on Globe region
            this.filterRecords = this.data.dimension(
                    jQuery.proxy( function( d )
                    {
                        return d[this.regionColName];
                    }, this ) ).filter(
                    jQuery.proxy( function( d )
                    {
                        if( this.globeRegion != d )
                            return d;
                    }, this ) );

            // Update y domains for function bar chart
            this.initYDomainsForFunctionBarChart();

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

    initYDomainsForFunctionBarChart: function()
    {
        if( !this.needToAdaptDomains )
            return;

        var mainFluxDomain = 0;
        var separatedFluxDomain = 0;

        // Domains for mono region
        $.each( this.filterRecords.top( Infinity ), jQuery.proxy( function( i, d )
        {
            if( this.mainFlux.indexOf( d[this.fluxColName] ) != -1 )
                mainFluxDomain = Math.max( mainFluxDomain, Math.abs( d[this.valueColName] ) );
            else
                separatedFluxDomain = Math.max( separatedFluxDomain, Math.abs( d[this.valueColName] ) );
        }, this ) );
        this.yDomainForMainFlux = [-mainFluxDomain, mainFluxDomain];
        this.yDomainForSeparatedFlux = [-separatedFluxDomain, separatedFluxDomain];

        // Domains for all regions
        mainFluxDomain = 0;
        separatedFluxDomain = 0;
        var globeData = this.transposedData[this.regionsKeys.indexOf( this.globeRegion )];
        $.each( globeData, jQuery.proxy( function( i, d )
        {
            if( this.mainFlux.indexOf( i ) != -1 )
                mainFluxDomain = Math.max( mainFluxDomain, Math.abs( d ) );
            else
            if( this.separatedFlux.indexOf( i ) != -1 )
                separatedFluxDomain = Math.max( separatedFluxDomain, Math.abs( d ) );
        }, this ) );
        this.yDomainForAllMainFlux = [-mainFluxDomain, mainFluxDomain];
        this.yDomainForAllSeparatedFlux = [-separatedFluxDomain, separatedFluxDomain];
    },


    /* ******************************************************************** */
    /* ******************************** DC ******************************** */
    /* ******************************************************************** */
    createMapAndUpdateAllAfterRender:function()
    {
        d3.json( this.regionFilePath, jQuery.proxy( function( error, world )
        {
            var countries = topojson.feature( world, world.objects.countries );
            var mapWidth = Math.min( this.imageHeight * 2, this.functionBarChartWidth );
            this.createChoroplethMap( "#mapChart", mapWidth, mapWidth / 2, countries, this.continents, this.continents.group() );
            $( "#mapChart" ).addClass( "countryWithPointer" );
            dc.renderAll();

            this.updateToolTipsForCharts();
            this.updateXAxisForFunctionBarChart();

            // Position of "regionAndUncertaintySelect" div
            var marginLeft = (this.functionBarChartWidth - $( "#mapChart" ).width() - $( "#globeActive" ).width()) / 2;
            $( "#regionAndUncertaintySelect" ).css( "margin-left", marginLeft );
            $( "#regionAndUncertaintySelect" ).height( $( "#mapChart" ).height() );

            // Home with selected flux
            $( "#" + jQuery.i18n.prop( "selectedFluxForHomePage" ) ).click();
        }, this ) );
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

    onClickGeoChoroplethChart: function()
    {
        if( !this.geoChoroplethChart.getSelect() )
            $( "#functionBarChartTitle" ).html( "All regions" );
        else
        {
            $( "#functionBarChartTitle" ).html( this.geoChoroplethChart.getDisplayedRegions().join( " + " ) );
            $( "#functionBarChartTitle" ).attr( "data-original-title", this.geoChoroplethChart.getDisplayedRegions().join( " + " ) );
        }

        if( this.geoChoroplethChart.getSelect() && !this.geoChoroplethChart.getMultipleSelect() )
        {
            this.functionBarChartForMainFlux.y( d3.scale.linear().domain( this.yDomainForMainFlux ) );
            this.functionBarChartForSeparatedFlux.y( d3.scale.linear().domain( this.yDomainForSeparatedFlux ) );
        }
        else
        {
            this.functionBarChartForMainFlux.y( d3.scale.linear().domain( this.yDomainForAllMainFlux ) );
            this.functionBarChartForSeparatedFlux.y( d3.scale.linear().domain( this.yDomainForAllSeparatedFlux ) );
        }

        d3.selectAll( "#functionBarChart .grid-line.horizontal line" ).classed( 'zero', false );
        this.functionBarChartForMainFlux.redraw();
        this.functionBarChartForSeparatedFlux.redraw();
    },

    loadRegionOneSelection: function()
    {
        this.geoChoroplethChart.setSelect( true );
        this.geoChoroplethChart.setMultipleSelect( false );

        $( "#mapChart" ).addClass( "countryWithPointer" );
        $( "#regionUnActive" ).fadeIn();
        $( "#regionActive" ).fadeOut();
        $( "#globeActive" ).fadeOut();
    },

    loadRegionMultipleSelection: function()
    {
        this.geoChoroplethChart.setSelect( true );
        this.geoChoroplethChart.setMultipleSelect( true );

        $( "#mapChart" ).addClass( "countryWithPointer" );
        $( "#regionUnActive" ).fadeOut();
        $( "#regionActive" ).fadeIn();
        $( "#globeActive" ).fadeOut();
    },

    loadRegionAllSelection: function()
    {
        this.geoChoroplethChart.setDisplayedRegions( [] );
        this.geoChoroplethChart.selectAllRegion( this.regionsKeys );

        this.geoChoroplethChart.setSelect( false );
        this.geoChoroplethChart.setMultipleSelect( false );

        $( "#functionBarChartTitle" ).html( "All regions" );
        $( "#mapChart" ).removeClass( "countryWithPointer" );
        $( "#regionUnActive" ).fadeOut();
        $( "#regionActive" ).fadeOut();
        $( "#globeActive" ).fadeIn();
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
    /**
     * http://blog.rusty.io/2012/09/17/crossfilter-tutorial/
     * "... when you filter on a dimension, and then roll-up using said dimension, Crossfilter intentionally ignores any filter an said dimension....
     * ...The workaround is to create another dimension on the same field, and filter on that.
     * ... Dimensions are stateful, so Crossfilter knows about our filter, and will ensure that all future operations are filtered to only work on the filter field
     * except for any calculations performed directly on the said dimension..."
     * No way to try with filters !!!
     * http://stackoverflow.com/questions/10608171/using-crossfilter-to-dynamically-return-results-in-javascript/10660123#10660123
     */
    createFunctions: function()
    {
        var carbonBudgets = this.data.dimension( function ( d )
        {
            return d[this.fluxColName];
        }, this );

        // group based on carbonBudgets dimension otherwise, a click on a bar hide all others
        var budgetAmountGroup = carbonBudgets.group().reduceSum( jQuery.proxy( function ( d )
        {
            return this.numberFormat( d[this.valueColName] );
        }, this ) );

        var budgetUncertGroup = carbonBudgets.group().reduceSum( jQuery.proxy( function ( d )
        {
            return this.numberFormat( d[this.valueColName] - d[this.uncertaintyColName] );
        }, this ) );

        this.functionBarChartForMainFlux = this.createFunctionBarChart( "#functionBarChartForMainFlux", $( "#functionBarChartForMainFlux" ).width(), this.chartHeight, carbonBudgets, budgetAmountGroup, budgetUncertGroup, this.mainFlux, this.yDomainForAllMainFlux, false, this.barCharMargin );
        var rightBarChartMargin = {top: this.barCharMargin.top, right: this.barCharMargin.left, bottom: this.barCharMargin.bottom, left: this.barCharMargin.right};
        this.functionBarChartForSeparatedFlux = this.createFunctionBarChart( "#functionBarChartForSeparatedFlux", $( "#functionBarChartForSeparatedFlux" ).width(), this.chartHeight, carbonBudgets, budgetAmountGroup, budgetUncertGroup, this.separatedFlux, this.yDomainForAllSeparatedFlux, true, rightBarChartMargin );
    },

    createFunctionBarChart: function( chartId, width, height, dimension, group, uncertaintyGroup, xDomain, yDomain, useRightYAxis, barCharMargin )
    {
        var barChart = dc.barChart( chartId )
                .height( height )
                .width( width )
                .transitionDuration( 750 )
                .margins( barCharMargin )
                .dimension( dimension )
                .group( group, "groupLayer" )
                .stack( uncertaintyGroup, "UncertaintyLayer" )
                .brushOn( false )
                .gap( 0 )
                .elasticY( false )
                .elasticYInDomain( true )
                .colors( this.color )
                .xUnits( dc.units.ordinal )
                .x( d3.scale.ordinal().domain( xDomain ) )
                .y( d3.scale.linear().domain( yDomain ) )
                .renderHorizontalGridLines( true );

        barChart.setUseRightYAxis( useRightYAxis );
        barChart.yAxis().tickFormat( d3.format( "s" ) );
        barChart.setCallBackOnClick( jQuery.proxy( this.onClickFunctionChart, this ) );
        barChart.on( "postRedraw", jQuery.proxy( function( chart )
        {
            this.onCompleteDisplayFunctionChart()
        }, this ) );
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
        }, this ) );
    },

    onClickFunctionChart: function( element )
    {
        var dynamicAreaDivId = this.getI18nPropertiesKeyFromValue( element.key );
        this.addOrRemoveToGroupedBarChart( $( "#" + dynamicAreaDivId ), element.key );
    },

    onCompleteDisplayFunctionChart: function()
    {
        // Update zero axis
        d3.selectAll( "#functionBarChart .grid-line.horizontal line" )
                .filter( function( d )
        {
            return !d
        } )
                .classed( 'zero', true );

        // Update synthesis values
        $.each( d3.selectAll( "#functionBarChart .bar" )[0], jQuery.proxy( function( i, d )
        {
            if( !d.__data__ || !d.__data__.data )
                return;
            var divId = this.getI18nPropertiesKeyFromValue( d.__data__.data.key );
            $( "#" + divId + "Value" ).html( d.__data__.data.value );
        }, this ) );
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
            this.onClickGroupedBarChart( d );
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
        }, this ) )
                .on( "click", jQuery.proxy( function( d )
        {
            this.onClickGroupedBarChart( d );
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

    onClickGroupedBarChart: function( element )
    {
        var dynamicAreaDivId = this.getI18nPropertiesKeyFromValue( element.name );
        $( "#" + dynamicAreaDivId ).removeClass( "selected" );
        this.removeToGroupedBarChart( element.name );
        this.functionBarChartForMainFlux.onClick( {key: element.name} );
        this.functionBarChartForSeparatedFlux.onClick( {key: element.name} );
    },

    removeToGroupedBarChart: function( fluxName )
    {
        var index = getIndexInArray( this.displayedVariables, "name", fluxName );
        if( 0 > index )
            return;
        this.displayedVariables.splice( index, 1 );
        this.updateGroupedBarChart();
    },


    /* ******************************************************************** */
    /* ************************ OTHERS FOR CHARTS ************************* */
    /* ******************************************************************** */
    updateToolTipsForCharts: function()
    {
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
                    this.functionBarChartForMainFlux.onClick( {key: fluxName} );
                    this.functionBarChartForSeparatedFlux.onClick( {key: fluxName} );
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
            this.displayedVariables = [];
            this.functionBarChartForMainFlux.y( d3.scale.linear().domain( this.yDomainForAllMainFlux ) );
            this.functionBarChartForSeparatedFlux.y( d3.scale.linear().domain( this.yDomainForAllSeparatedFlux ) );

            dc.filterAll();
            dc.renderAll();
            this.loadRegionOneSelection();
            this.updateToolTipsForCharts();
            this.updateXAxisForFunctionBarChart();

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
            this.loadRegionMultipleSelection();
        }, this ) );

        $( "#regionActive" ).on( "click", jQuery.proxy( function()
        {
            this.loadRegionAllSelection();
        }, this ) );

        $( "#globeActive" ).on( "click", jQuery.proxy( function()
        {
            this.loadRegionOneSelection();
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

        $( "#uncertainty" ).on( "click", jQuery.proxy( function()
        {
            this.displayUncertainty = false;
            $( "#uncertaintyDisable" ).fadeToggle();
            $( "#uncertainty" ).fadeToggle();
            $( "#functionBarChart" ).removeClass( "uncertainty" );
        }, this ) );

        $( "#uncertaintyDisable" ).on( "click", jQuery.proxy( function()
        {
            this.displayUncertainty = true;
            $( "#uncertaintyDisable" ).fadeToggle();
            $( "#uncertainty" ).fadeToggle();
            $( "#functionBarChart" ).addClass( "uncertainty" );
        }, this ) );

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
