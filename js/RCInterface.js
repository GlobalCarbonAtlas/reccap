/*
 ##########################################################################

 Vanessa.Maigne@ipsl.jussieu.fr      for Global Carbon Atlas
 Patrick.Brockmann@lsce.ipsl.fr      for Global Carbon Atlas

 PLEASE DO NOT COPY OR DISTRIBUTE WITHOUT PERMISSION

 ##########################################################################
 * WARNING : image Flux must have width = 2 * height, as the map !
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
        this.initMapScale = 95;
        this.barCharMargin = {top: 10, right: 0, bottom: 75, left: 35};
        var colors = d3.scale.category20c().range();
        colors[2] = "#555555";
        this.color = d3.scale.ordinal().range( colors );
        this.selectMultipleRegion = false;
        this.displayUncertainty = false;

        // Areas for maps
        this.initDimensionsForImageAndCharts();
        this.createDynamicAreasForResponsiveMap( "#imageFlux", "#mapForImageFlux", "#dynamicAreasForImageFlux", this.imageWidth, true );
        this.createDynamicAreasForResponsiveMap( "#imageFluxForSynthesis", "#mapForImageFluxForSynthesis", "#dynamicAreasForImageFluxForSynthesis", 900, false );

        this.initToolTips();
        this.initOthers();
        this.bindActions();
    },

    initDimensionsForImageAndCharts: function()
    {
        this.marginLeftForFluxImageAndMap = 34;
        this.barChartWidth = $( "#regionBarChart" ).width();
        this.imageWidth = this.barChartWidth - this.marginLeftForFluxImageAndMap;
        this.imageHeight = this.imageWidth / 2;

        var heightToDisplayGraphs = $( "body" )[0].clientHeight - $( ".bottomBasicCell" ).css( "margin-top" ).replace( "px", "" ) - $( ".container-fluid" ).height();
        if( this.imageHeight > (heightToDisplayGraphs / 2) )
        {
            this.imageHeight = heightToDisplayGraphs / 2;
            this.imageWidth = heightToDisplayGraphs;
            this.barChartWidth = this.imageWidth + this.marginLeftForFluxImageAndMap;
            $( "#rightCol" ).width( this.barChartWidth );
            $( "#leftCol" ).width( this.barChartWidth );
        }
    },

    initDimensionsForCharts: function( newImageHeight )
    {
        this.imageHeight = newImageHeight;
        this.mapImageWidth = this.imageWidth - this.marginLeftForFluxImageAndMap;// - $( "#fluxBarChartForSeparatedFlux" ).css( "margin-left" ).replace( "px", "" );
        this.mapImageHeight = this.imageHeight;
        this.barChartHeight = $( "#pageWrapper" ).height() - this.imageHeight - $( ".basicCell" ).css( "margin-bottom" ).replace( "px", "" ) - $( ".container-fluid" ).height() - 30;

        // Elements positions
        $( "#mapChartAndComment" ).css( "margin-left", this.marginLeftForFluxImageAndMap );
        $( ".imageFluxCell" ).css( "margin-left", this.marginLeftForFluxImageAndMap );
        $( "#dynamicAreasForImageFlux" ).css( "top", -this.imageHeight );
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
                return  "<span class='d3-tipTitle'>" + i18n.t( "country." + d.properties.continent ) + "</span>";
            else if( d.column && d.name )
            {
                var value = (0 != d.yBegin ? d.yBegin : 0 != d.yEnd ? d.yEnd : 0);
                return "<span class='d3-tipTitle'>" + d.name + " : </span>" + this.numberFormat( value );
            }
            else if( d.data )
            // Bar chart
                if( "UncertaintyLayer" == d.layer )
                    if( this.displayUncertainty )
                        return "<span class='d3-tipTitle'>" + d.data.key + " : </span>" + this.numberFormat( d.y0 ) + " (" + i18n.t( "label.uncertainty" ) + " : " + this.numberFormat( d.y0 - d.data.value ) + ")";
                    else
                        return "<span class='d3-tipTitle'>" + d.data.key + " : </span>" + this.numberFormat( d.y0 );
                else
                    return "<span class='d3-tipTitle'>" + d.data.key + " : </span>" + this.numberFormat( d.data.value );
            else
            // Function bar chart axis
                return "<span class='d3-tipTitle'>" + d + "</span>";
        }, this ) );

        // Tooltips for menu
        $( ".leftTools .leftToolsButton, #fluxBarChartTitle" ).tooltip( {
            placement: "bottom",
            container:'body'} );

//        $( ".rightTools .toolButton, #resetFlux" ).tooltip( {
        $( "#resetFlux" ).tooltip( {
            placement: "left",
            container:'body'} );

        $( "#regionSelect .toolButton, #resetMap, #exportData .exportButton, #dataPNGExport, #exportSynthesis .exportButton" ).tooltip( {
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
            this.initYDomainsForFluxBarChart();

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

    initOthers: function()
    {
        var userAgent = getUserAgengt();
        var isFirefox = /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent );
        if( !isFirefox )
            $( "#dataPNGExport" ).addClass( "disabled" );
    },

    initYDomainsForFluxBarChart: function()
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
            this.createChoroplethMap( "#mapChart", this.mapImageWidth, this.mapImageHeight, countries, this.continents, this.continents.group() );
            $( "#mapChart" ).addClass( "countryWithPointer" );
            dc.renderAll();

            this.updateToolTipsForCharts();
            this.updateXAxisForFluxBarChart();

            // Position of "regionSelect" div
            $( "#regionSelect" ).css( "margin-left", $( "#globeActive" ).width() );
            $( "#regionSelect" ).css( "margin-top", $( "#mapChart" ).height() / 2 );

            // Home with selected flux
            $( "#" + jQuery.i18n.prop( "selectedFluxForHomePage" ) ).click();
//            this.createHelp();
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
//        if( !this.geoChoroplethChart.getSelect() )
//        {
//            $( "#fluxBarChartTitle" ).html( i18n.t("label.allRegions") );
//            $( "#imageFluxForSynthesisTitle" ).html( i18n.t("label.allRegions") );
//        }
//        else
//        {
        var translatedRegions = this.getDisplayedRegions().join( " + " );
        $( "#fluxBarChartTitle" ).html( translatedRegions );
        $( "#fluxBarChartTitle" ).attr( "data-original-title", translatedRegions );
        $( "#imageFluxForSynthesisTitle" ).html( translatedRegions );
//        }

        if( this.geoChoroplethChart.getSelect() && !this.geoChoroplethChart.getMultipleSelect() )
        {
            this.fluxBarChartForMainFlux.y( d3.scale.linear().domain( this.yDomainForMainFlux ) );
            this.fluxBarChartForSeparatedFlux.y( d3.scale.linear().domain( this.yDomainForSeparatedFlux ) );
        }
        else
        {
            this.fluxBarChartForMainFlux.y( d3.scale.linear().domain( this.yDomainForAllMainFlux ) );
            this.fluxBarChartForSeparatedFlux.y( d3.scale.linear().domain( this.yDomainForAllSeparatedFlux ) );
        }

        d3.selectAll( "#fluxBarChart .grid-line.horizontal line" ).classed( 'zero', false );
        this.fluxBarChartForMainFlux.redraw();
        this.fluxBarChartForSeparatedFlux.redraw();
    },

    getDisplayedRegions: function()
    {
        var result = [];
        $.each( this.geoChoroplethChart.getDisplayedRegions(), function( i, d )
        {
            result.push( i18n.t( "country." + d ) );
        } );
        return result;
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

        $( "#fluxBarChartTitle" ).html( i18n.t( "label.allRegions" ) );
        $( "#imageFluxForSynthesisTitle" ).html( i18n.t( "label.allRegions" ) );

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

        this.fluxBarChartForMainFlux = this.createFluxBarChart( "#fluxBarChartForMainFlux", $( "#fluxBarChartForMainFlux" ).width(), this.barChartHeight, carbonBudgets, budgetAmountGroup, budgetUncertGroup, this.mainFlux, this.yDomainForAllMainFlux, false, this.barCharMargin );
        var rightBarChartMargin = {top: this.barCharMargin.top, right: this.barCharMargin.left, bottom: this.barCharMargin.bottom, left: this.barCharMargin.right};
        this.fluxBarChartForSeparatedFlux = this.createFluxBarChart( "#fluxBarChartForSeparatedFlux", $( "#fluxBarChartForSeparatedFlux" ).width(), this.barChartHeight, carbonBudgets, budgetAmountGroup, budgetUncertGroup, this.separatedFlux, this.yDomainForAllSeparatedFlux, true, rightBarChartMargin );
    },

    createFluxBarChart: function( chartId, width, height, dimension, group, uncertaintyGroup, xDomain, yDomain, useRightYAxis, barCharMargin )
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
        barChart.setCallBackOnClick( jQuery.proxy( this.onClickFunctionChart, [this, chartId] ) );
        barChart.on( "postRedraw", jQuery.proxy( function( chart )
        {
            this.onCompleteDisplayFunctionChart()
        }, this ) );
        return barChart;
    },

    updateXAxisForFluxBarChart: function()
    {
        // Function Bar chart : rotate the x Axis labels
        d3.selectAll( "#fluxBarChart g.x g text" )
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
        var context = this[0];
        var chartId = this[1];
        var dynamicAreaDivId = context.getI18nPropertiesKeyFromValue( element.key );
        context.addOrRemoveToRegionBarChart( $( "#" + dynamicAreaDivId ), element.key );
        if( chartId == "#fluxBarChartForMainFlux" )
            context.fluxBarChartForSeparatedFlux.onClick( {key: element.key} );
        else
            context.fluxBarChartForMainFlux.onClick( {key: element.key} );
    },

    onCompleteDisplayFunctionChart: function()
    {
        // Update zero axis
        d3.selectAll( "#fluxBarChart .grid-line.horizontal line" )
                .filter( function( d )
        {
            return !d
        } )
                .classed( 'zero', true );

        // Update synthesis values
        $.each( d3.selectAll( "#fluxBarChart .bar" )[0], jQuery.proxy( function( i, d )
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
    addOrRemoveToRegionBarChart: function( dynamicAreaDiv, fluxName )
    {
        this.displayedVariables = this.displayedVariables ? this.displayedVariables : [];
        var isAlreadyAChart = (0 <= getIndexInArray( this.displayedVariables, "name", fluxName ));
        isAlreadyAChart ? $( dynamicAreaDiv ).removeClass( "selected" ) : $( dynamicAreaDiv ).addClass( "selected" );
        if( isAlreadyAChart )
            this.removeToRegionBarChart( fluxName );
        else
            this.createOrAddToBarChart( "#regionBarChart", this.barChartWidth, this.barChartHeight, fluxName );
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
        if( 0 >= $( "#regionBarChartSvg" ).length )
            this.createRegionBarChart( containerId, width, height );
        this.displayedVariables.push( {name : fluxValue, color: false} );
        this.updateRegionBarChart();
        this.updateToolTipsForCharts();
    },

    /**
     * This method create the svg container for the grouped bar chart
     * @param containerId
     * @param width
     * @param height
     */
    createRegionBarChart: function( containerId, width, height )
    {
        this.barChartWidth = width - this.barCharMargin.left - this.barCharMargin.right;
        this.regionBarChartHeight = height - this.barCharMargin.top - this.barCharMargin.bottom;

        this.regionBarChartx0 = d3.scale.ordinal().rangeRoundBands( [0, this.barChartWidth], 0.1 ).domain( this.regionsKeys );
        this.regionBarChartx1 = d3.scale.ordinal();
        this.regionBarCharty = d3.scale.linear().range( [this.regionBarChartHeight, 0] );

        // Axes
        this.regionBarChartxAxis = d3.svg.axis().scale( this.regionBarChartx0 );
        this.regionBarChartyAxis = d3.svg.axis()
                .scale( this.regionBarCharty )
                .orient( "left" )
                .tickFormat( d3.format( ".2s" ) )
                .tickSize( -this.barChartWidth, 0 );

        $( containerId ).addClass( "dc-chart" );
        // BarChart
        this.regionBarChartsvg = d3.select( containerId ).append( "svg" )
                .attr( "id", "regionBarChartSvg" )
                .attr( "width", this.barChartWidth + this.barCharMargin.left + this.barCharMargin.right )
                .attr( "height", this.regionBarChartHeight + this.barCharMargin.top + this.barCharMargin.bottom )
                .append( "g" )
                .attr( "transform", "translate(" + this.barCharMargin.left + "," + this.barCharMargin.top + ")" );

        this.regionBarChartsvg.append( "g" )
                .attr( "class", "y axis" )
                .append( "text" )
                .attr( "transform", "rotate(-90)" )
                .attr( "y", 6 )
                .attr( "dy", ".7em" )
                .style( "text-anchor", "end" )
                .text( "" );

        this.regionBarChartsvg.append( "g" )
                .attr( "class", "x axis" )
                .attr( "transform", "translate(0," + this.regionBarChartHeight + ")" );

        // xAxis
        this.regionBarChartsvg.select( '.x.axis' ).call( this.regionBarChartxAxis );
    },

    /**
     * This method update the actual bar chart after an add or a remove of a flux value
     */
    updateRegionBarChart: function()
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
        this.regionBarCharty.domain( [d3.min( this.transposedData, function( d )
        {
            return d.negativeTotal;
        } ), d3.max( this.transposedData, function( d )
        {
            return d.positiveTotal;
        } )] );
        this.regionBarChartx1.domain( d3.keys( this.displayedVariables ) ).rangeRoundBands( [0, this.regionBarChartx0.rangeBand()] );
    },

    updateBarChartAxes: function()
    {
        // Update yAxis
        this.regionBarChartsvg
                .select( '.y.axis' )
                .call( this.regionBarChartyAxis )
                .selectAll( 'line' )
                .filter( function( d )
        {
            return !d
        } )
                .classed( 'zero', true );
    },

    updateBarChartLegend: function()
    {
        var legend = this.regionBarChartsvg.selectAll( ".legend" )
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
            this.onClickRegionBarChart( d );
        }, this ) );
    },

    updateGroupedBar: function()
    {
        var regionBar = this.regionBarChartsvg.selectAll( ".groupedBar" )
                .data( this.transposedData );

        var regionBarEnter = regionBar.enter().append( "g" )
                .attr( "class", "groupedBar" )
                .attr( "transform", jQuery.proxy( function( d )
        {
            return "translate(" + this.regionBarChartx0( d[this.fluxColName] ) + ",0)";
        }, this ) );

        var regionBarRect = regionBar.selectAll( "rect" )
                .data( jQuery.proxy( function( d )
        {
            return d.columnDetails;
        }, this ) );

        regionBarRect.enter().append( "rect" )
                .attr( "width", this.regionBarChartx1.rangeBand() )
                .attr( "x", jQuery.proxy( function( d )
        {
            return this.regionBarChartx1( d.column );
        }, this ) )
                .attr( "y", jQuery.proxy( function( d )
        {
            return this.regionBarCharty( d.yEnd );
        }, this ) )
                .attr( "height", jQuery.proxy( function( d )
        {
            return this.regionBarCharty( d.yBegin ) - this.regionBarCharty( d.yEnd );
        }, this ) )
                .on( "click", jQuery.proxy( function( d )
        {
            this.onClickRegionBarChart( d );
        }, this ) );

        regionBarRect.exit().remove();

        regionBar.transition()
                .duration( 200 )
                .ease( "linear" )
                .selectAll( "rect" )
                .attr( "width", this.regionBarChartx1.rangeBand() )
                .attr( "x", jQuery.proxy( function( d )
        {
            return this.regionBarChartx1( d.column );
        }, this ) )
                .attr( "y", jQuery.proxy( function( d )
        {
            return this.regionBarCharty( d.yEnd );
        }, this ) )
                .attr( "height", jQuery.proxy( function( d )
        {
            return this.regionBarCharty( d.yBegin ) - this.regionBarCharty( d.yEnd );
        }, this ) )
                .style( "fill", jQuery.proxy( function( d )
        {
            if( !d.color )
                d.color = this.color( d.name );
            return d.color;
        }, this ) );

        // Grouped Bar chart : rotate the x Axis labels
        d3.selectAll( "#regionBarChartSvg g.x g text" )
                .style( "text-anchor", "end" )
                .attr( "transform", "translate(-10,0)rotate(315)" );
    },

    onClickRegionBarChart: function( element )
    {
        var dynamicAreaDivId = this.getI18nPropertiesKeyFromValue( element.name );
        $( "#" + dynamicAreaDivId ).removeClass( "selected" );
        this.removeToRegionBarChart( element.name );
        this.fluxBarChartForMainFlux.onClick( {key: element.name} );
        this.fluxBarChartForSeparatedFlux.onClick( {key: element.name} );
    },

    removeToRegionBarChart: function( fluxName )
    {
        var index = getIndexInArray( this.displayedVariables, "name", fluxName );
        if( 0 > index )
            return;
        this.displayedVariables.splice( index, 1 );
        this.updateRegionBarChart();
    },


    /* ******************************************************************** */
    /* ************************ OTHERS FOR CHARTS ************************* */
    /* ******************************************************************** */
    updateToolTipsForCharts: function()
    {
        d3.selectAll( ".country, #fluxBarChart .bar, #fluxBarChart text, #regionBarChart .groupedBar rect" ).call( this.toolTip );
        d3.selectAll( ".country, #fluxBarChart .bar, #fluxBarChart text, #regionBarChart .groupedBar rect" )
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
                    if( activeClick )
                    {
                        this.initDimensionsForCharts( $( imageId ).height() );
                        this.initFileValuesAndCreateDCObjects();
                    }
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
                    this.addOrRemoveToRegionBarChart( argument.currentTarget, fluxName );
                    this.fluxBarChartForMainFlux.onClick( {key: fluxName} );
                    this.fluxBarChartForSeparatedFlux.onClick( {key: fluxName} );
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
            $( "#fluxBarChartTitle" ).html( i18n.t( "label.allRegions" ) );
            $( "#imageFluxForSynthesisTitle" ).html( i18n.t( "label.allRegions" ) );
            this.displayedVariables = [];
            this.fluxBarChartForMainFlux.y( d3.scale.linear().domain( this.yDomainForAllMainFlux ) );
            this.fluxBarChartForSeparatedFlux.y( d3.scale.linear().domain( this.yDomainForAllSeparatedFlux ) );

            dc.filterAll();
            dc.renderAll();
            this.loadRegionOneSelection();
            this.updateToolTipsForCharts();
            this.updateXAxisForFluxBarChart();

            $( "#" + jQuery.i18n.prop( "selectedFluxForHomePage" ) ).click();
        }, this ) );

        // Help button
        $( "#help" ).on( "click", jQuery.proxy( function()
        {
            alert( "Work in progress" );
//            this.createHelp();
        }, this ) );

        // Reset filters
        $( "#resetMap" ).on( "click", jQuery.proxy( function()
        {
            this.geoChoroplethChart.filterAll();
            $( "#fluxBarChartTitle" ).html( i18n.t( "label.allRegions" ) );
            $( "#imageFluxForSynthesisTitle" ).html( i18n.t( "label.allRegions" ) );
            this.fluxBarChartForMainFlux.y( d3.scale.linear().domain( this.yDomainForAllMainFlux ) );
            this.fluxBarChartForSeparatedFlux.y( d3.scale.linear().domain( this.yDomainForAllSeparatedFlux ) );
            d3.selectAll( "#fluxBarChart .grid-line.horizontal line" ).classed( 'zero', false );
            dc.redrawAll();
        }, this ) );

        $( "#resetFlux" ).on( "click", jQuery.proxy( function()
        {
            $( "#dynamicAreasForImageFlux .dynamicArea.selected" ).click();
            dc.redrawAll();
        }, this ) );

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

        $( "#hiddenDiv, #dataDiv .dataTableDiv, #synthesisDiv .imageFluxForSynthesis" ).on( "click", function()
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
            $( "#fluxBarChart" ).removeClass( "uncertainty" );
        }, this ) );

        $( "#uncertaintyDisable" ).on( "click", jQuery.proxy( function()
        {
            this.displayUncertainty = true;
            $( "#uncertaintyDisable" ).fadeToggle();
            $( "#uncertainty" ).fadeToggle();
            $( "#fluxBarChart" ).addClass( "uncertainty" );
        }, this ) );
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
    },


    /* ******************************************************* */
    /* ************************ HELP ************************* */
    /* ******************************************************* */
    createHelp: function()
    {
        var parameters = new Object();

        parameters.helpArray = [
            {linkType:"simple", divToHelpId:"export", text:i18n.t( "help.export" ), marginTop:8, marginLeft:10, textLengthByLine: 70},
            {linkType:"right", divToHelpId:"reset", text:i18n.t( "help.reset" ), marginTop:31, marginLeft:20, stage: 1},


            {linkType:"simpleLeft", divToHelpId:"data", text:"Remove all lines", marginTop:10, marginLeft: 33},
            {linkType:"left", divToHelpId:"synthesis", text:"Remove all lines", marginTop:38, marginLeft: 26, stage:1},


            {linkType:"simple", divToHelpId:"globeActive", text:"Remove all lines", marginTop:10, marginLeft: 12},
            {linkType:"right", divToHelpId:"resetMap", text:"Remove all lines", marginTop:0, marginLeft: 0, stage:1},
            {linkType:"simple", divToHelpId:"uncertaintyDisable", text:"Remove all lines", marginTop:0, marginLeft: 0, stage:1},
            {linkType:"middle", divToHelpId:"mapChart", text:i18n.t( "label.clickRegion" ), marginTop:$( "#mapChart" ).height() / 2, marginLeft: $( "#mapChart" ).width() / 2},


//            {linkType:"simple", divToHelpId:"submitAddToGraph", text:"Display the data corresponded to the selected fields in the graph", textLengthByLine:35, marginTop:11, marginLeft:20},
//            {linkType:"simple", divToHelpId:"regionSelect", text:"Select a region in the given list. A map helps you by showing the differents regions", textLengthByLine:35, marginTop:8, marginLeft:-40},
//            {linkType:"simple", divToHelpId:"periodSelect", text:"Choose your period", textLengthByLine:35, marginTop:8, marginLeft:-40},
//            {linkType:"simple", divToHelpId:"resourceSelect", text:"Select one or several resources in the given list", textLengthByLine:30, marginTop:10, marginLeft:-40},
//            {linkType:"simple", divToHelpId:"variableSelect", text:"Union of the variables available for each selected resources", textLengthByLine:65, marginTop:6, marginLeft:-60},
//
//            {linkType:"left", divToHelpId:"WPlineIcon", text:"Remove all lines", marginTop:36, marginLeft: 20, stage:9},
//            {linkType:"left", divToHelpId:"WPexportIcon", text:"Export your graph",  linkedHelp: ["WPExport"], marginTop:36, marginLeft: 20, stage:8},
//            {linkType:"left", divToHelpId:"WPpointIcon", text:"Hide or display data points. Move your mouse over a point to get data value", textLengthByLine:40, marginTop:36, marginLeft: 20, stage:7},
//            {linkType:"left", divToHelpId:"WPXaxisImage", text:"Block the pan and zoom on the X axis", marginTop:36, marginLeft: 20, stage:6},
//            {linkType:"left", divToHelpId:"WPYaxisImage", text:"Block the pan and zoom on the Y axis", marginTop:36, marginLeft: 20, stage:5},
//            {linkType:"left", divToHelpId:"WPaxisIcon", text:"Change your bounds", linkedHelp: ["WPaxis"], marginTop:36, marginLeft: 20, stage:4},
//            {linkType:"left", divToHelpId:"WPinterpolationIcon", text:"Change your graph interpolation", linkedHelp: ["WPinterpolationTree"], marginTop:36, marginLeft: 20, stage:3},
//            {linkType:"left", divToHelpId:"WPzoomIcon", text:"Initialize your graph with the best zoom and pan you can get", textLengthByLine:30, marginTop:36, marginLeft: 20, stage:1},
//
//            {linkType:"right", divToHelpId:"WPLegendImage" + lastIdForLegend, text:"You can remove a line by clicking on this icon", marginTop:25, marginLeft:5, stage:1},
//            {linkType:"right", divToHelpId:"WPLegendCircle" + lastIdForLegend, text:"You can change the color of a line by clicking on this icon or directly on the line in the graph. Then use the color picker", linkedHelp: ["WPcolor"], textLengthByLine:72, marginTop:19, stage:3},
//
//            {linkType:"middle", divToHelpId:"WPcolor", text:"You can change the color of a line by clicking on the circle to select a new color palette. Then use the square to pick a specific gradation", textLengthByLine:25, marginTop:$( "#WPcolor" ).height() - 15, marginLeft:$( "#WPcolor" ).width() / 2, stage:1},
//            {linkType:"right", divToHelpId:"WPinterpolationTree", text:"Select a new interpolation. It will automatically update your graph", textLengthByLine:36, marginTop:$( "#WPinterpolationTree" ).height() - 15, marginLeft:$( "#WPinterpolationTree" ).width() / 2, stage:2},
//            {linkType:"simple", divToHelpId:"WPaxis", text:"Put the axis bounds you want. This will block zoom and pan at the same time. You can undo these blocks by clicking on the related icons", linkedHelp: ["WPYaxisImage", "WPXaxisImage"], textLengthByLine:38, marginTop:$( "#WPaxis" ).height() / 2 - 50},
//            {linkType:"simple", divToHelpId:"WPExport", text:"Choose svg or png to export your graph in a new tab", textLengthByLine:20, marginTop:$( "#WPExport" ).height() / 2}
        ];

        parameters.parentContainerId = "#pageWrapper";
        //parameters.globalMarginTop = -110;
        //parameters.globalMarginLeft = -110;		// TODO: do not handle width resizing

        this.help = new Help( parameters );
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


<!-- ******************************************** -->
<!-- ****************** EXPORT ****************** -->
<!-- ******************************************** -->

<!-- ********** EXPORT ALL ************ -->
function exportAll( exportDivId, fileType )
{
    $( "#" + exportDivId ).empty();
    $( "#sourceWrapper" ).fadeOut( 1000 );

    $( "#" + exportDivId ).append( $( "#sourceWrapper #pageWrapper" ).clone() );
    $( "#" + exportDivId + " #mapChartAndComment" ).width( $( "#" + exportDivId + " #mapChart" ).width() );

    // File name with date
    var exportDate = $.datepicker.formatDate( 'yy_mm_dd', new Date() );
    var fileName = "GCAExportImage_" + exportDate;

    // Export
    $( '#' + exportDivId ).exportAll( {
        sourceDivId:"sourceWrapper",
        callbackBeforeCanvg:{name: callbackForExportAllBeforeCanvg, arguments: exportDivId},
        callbackOnRendered: {name: callbackForExportAllOnRendered, arguments: exportDivId},
        fileName: fileName,
        fileType: fileType,
        windowTitle: i18n.t( "label.exportAllTitle" ),
        listStyleToGet:["fill", "stroke", "opacity", "fill-opacity", "shape-rendering", "stroke-opacity",
            "font", "font-size", "font-weight", "font-family", "color",
            "float", "height", "width"]
    } );
}

function callbackForExportAllBeforeCanvg( exportDivId )
{
    $( "#" + exportDivId + " #containerTools, #" + exportDivId + " .comment, #" + exportDivId + " #regionSelect, #" + exportDivId + " #resetFlux" ).remove();
    $( "#" + exportDivId + " #hiddenDiv, #" + exportDivId + " #dataDiv, #" + exportDivId + " .synthesisDiv" ).remove();

    // Add GCA logo
    $( "#" + exportDivId ).append( "<div class='exportLogo'><img src='img/GCA_logo_white.png' width='150px'></div>" );
}

function callbackForExportAllOnRendered( exportDivId )
{
    $( "#" + exportDivId ).empty();
    $( "#sourceWrapper" ).fadeIn();
}

<!-- ********** EXPORT SYNTHESIS ************ -->
function exportSynthesis( exportDivId, fileType )
{
    // File name with date
    var exportDate = $.datepicker.formatDate( 'yy_mm_dd', new Date() );
    var fileName = "GCAExportImage_" + exportDate;

    // Export
    $( '#' + exportDivId ).exportAll( {
        callbackBeforeCanvg:{name: callbackForExportSynthesisBeforeCanvg, arguments:true},
        callbackOnRendered: {name: callbackForExportSynthesisBeforeCanvg, arguments: false},
        fileName: fileName,
        fileType: fileType,
        windowTitle: i18n.t( "label.exportSynthesisTitle" )
    } );
}

function callbackForExportSynthesisBeforeCanvg( isToAdd )
{
    // Add GCA logo
    if( isToAdd )
    {
        var height = $( "#synthesisDivData" ).height() - 75;
        $( "#dynamicAreasForImageFluxForSynthesis" ).append( "<div class='exportLogo' style='margin-top:" + height + "px'><img src='img/GCA_logo.png' width='150px'></div>" );
    }
    else
        $( "#dynamicAreasForImageFluxForSynthesis .exportLogo" ).remove();
}
