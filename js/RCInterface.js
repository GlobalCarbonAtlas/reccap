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
        this.numberFormat = d3.format( ".0f" );
        this.dataFilePath = jQuery.i18n.prop( "dataFilePath" );
        this.regionColName = jQuery.i18n.prop( "regionColName" );
        this.fluxColName = jQuery.i18n.prop( "fluxColName" );
        this.valueColName = jQuery.i18n.prop( "valueColName" );
        this.uncertaintyColName = jQuery.i18n.prop( "uncertaintyColName" );
        this.commentColName = jQuery.i18n.prop( "commentColName" );
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
        this.color = d3.scale.ordinal().domain( $.merge( $.merge( [], this.mainFlux ), this.separatedFlux ) ).range( JSON.parse( jQuery.i18n.prop( "mainThenSeparatedFluxColors" ) ) );
        this.selectMultipleRegion = false;
        this.displayUncertainty = false;
        this.emptyZoneWithNoData = "No data for this region";
        this.allFluxIdToSelectHomePage = "#" + jQuery.i18n.prop( "selectedFluxForHomePage" ).split( "," ).join( ", #" );

        // Areas for maps
        this.initDimensionsForImageAndCharts();
        this.createDynamicAreasForResponsiveMap( "#imageFlux", "#mapForImageFlux", "#dynamicAreasForImageFlux", this.imageWidth, true );
        this.createDynamicAreasForResponsiveMap( "#imageFluxForSynthesis", "#mapForImageFluxForSynthesis", "#dynamicAreasForImageFluxForSynthesis", 900, false );
        this.initFileValuesAndCreateDCObjects();

        this.initToolTips();
//        this.initOthers();
        this.bindActions();
    },

    initDimensionsForImageAndCharts: function()
    {
        this.marginLeftForFluxImageAndMap = 34;
        var imageHeight = $( "#imageFlux" ).height();
        var imageWidth = $( "#imageFlux" ).width();
        this.imageWidth = parseInt( $( "#regionBarChart" ).width() - 2 * this.marginLeftForFluxImageAndMap );
        var newImageHeight = parseInt( this.imageWidth * imageHeight / imageWidth );

        var heightToDisplayGraphs = parseInt( $( "body" )[0].clientHeight - $( ".bottomBasicCell" ).css( "margin-top" ).replace( "px", "" ) - $( ".container-fluid" ).height() );
        if( newImageHeight > parseInt( heightToDisplayGraphs / 2 ) )
            this.imageWidth = parseInt( (newImageHeight * imageWidth / imageHeight ) - 2 * this.marginLeftForFluxImageAndMap );
    },

    initDimensionsForCharts: function( newImageHeight )
    {
        this.imageHeight = newImageHeight;
        this.mapImageWidth = $( "#fluxBarChart" ).width() - 2 * this.marginLeftForFluxImageAndMap;
        this.mapImageHeight = this.mapImageWidth / 2;
        this.barChartHeight = $( "#pageWrapper" ).height() - this.imageHeight - $( ".basicCell" ).css( "margin-bottom" ).replace( "px", "" ) - $( ".container-fluid" ).height() - 40;
//        this.barChartHeight = 300;

        // Elements positions
        $( "#mapChartAndComment" ).css( "margin-left", this.marginLeftForFluxImageAndMap );
        $( "#imageFluxCell" ).css( "margin-left", this.marginLeftForFluxImageAndMap );
        $( "#resetFlux" ).css( "margin-right", this.marginLeftForFluxImageAndMap );
        $( "#dynamicAreasForImageFlux" ).css( "top", -this.imageHeight );

        // Position of "regionSelect" div
        $( "#regionSelect" ).css( "margin-left", $( "#globeActive" ).width() );
        $( "#regionSelect" ).css( "margin-top", this.mapImageHeight / 2 );
    },

    initToolTips: function()
    {
        // Tooltips for charts
        this.toolTip = d3.tip()
                .attr( 'class', 'd3-tip' )
                .offset( { "*":[-10,0],
                             "others": [
                                 {property:"properties.name", name:"Russia", value: [0, this.imageWidth / 5]},
                                 {property:"x", name:"Fossil fuel CO2 emissions", value: [0, 110]},
                                 {property:"x", name:"∆C", value: [0, 90]},
                                 {property:"x", name:"NEE", value: [0, 70]},
                                 {property:"x", name:"Land use change", value: [0, 50]},
                                 {property:"data.key", name:"Fossil fuel CO2 emissions", value: [0, 150]},
                                 {property:"data.key", name:"∆C", value: [0, 130]},
                                 {property:"data.key", name:"NEE", value: [0, 110]},
                                 {property:"data.key", name:"Land use change", value: [0, 90]}
                             ]} )
                .html( jQuery.proxy( function ( d )
        {
            if( d.properties )
            // Choropleth
                return  "<span class='d3-tipTitle'>" + i18n.t( "country." + d.properties.continent ) + "</span>";
            else if( d.column && d.name )
            {
                // Region bar chart axis
                var value = (0 != d.yBegin ? d.yBegin : 0 != d.yEnd ? d.yEnd : 0);
                if( this.displayUncertainty && d.uncertainty && !isNaN( d.uncertainty ) )
                    return "<center><span class='d3-tipTitle'>" + d.region + " - " + d.name + " : </span>" + this.numberFormat( value ) + "<BR/>(" + i18n.t( "label.uncertainty" ) + " : " + this.numberFormat( d.uncertainty ) + ")</center>";
                else
                    return "<span class='d3-tipTitle'>" + d.region + " - " + d.name + " : </span>" + this.numberFormat( value );
            }
            else if( d.data )
            {
                if( !d.data.key )
                    d.data = d[0][0].__data__.data;
                // Bar chart
                var result = "<center><span class='d3-tipTitle'>" + d.data.key + " : </span>" + this.numberFormat( d.data.value.value );
                if( this.displayUncertainty )
                    result += "<BR/>(" + i18n.t( "label.uncertainty" ) + " : " + this.numberFormat( d.data.value.uncertainty ) + ")";
                result += "</center><BR/>" + d.data.value.comment;
                return result;
            }
            else if( d.name )
            // Region barchart legend
                return "<span class='d3-tipTitle' style='color:" + d.color + "'>" + d.name + "</span>";
            else
                return "<span class='d3-tipTitle'>" + d + "</span>";
        }, this ) );

        // Tooltips for menu
        $( ".leftTools div, #fluxBarChartTitle" ).tooltip( {
            placement: "bottom",
            container:'body'} );

        $( "#resetFlux, #resetMap, #synthesis" ).tooltip( {
            placement: "left",
            container:'body'} );

        $( ".toolButton, #exportData .exportButton, #exportSynthesis .exportButton" ).tooltip( { //#dataPNGExport/
            placement: "right",
            container:'body'} );
    },

    initFileValuesAndCreateDCObjects:function()
    {
        // To set ',' in separator for .csv file, save first in .ods then in .csv and then fill the asked fiels
        d3.tsv( this.dataFilePath, jQuery.proxy( function ( error, csv )
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

            // Update y domains for flux bar chart
            this.initYDomainsForFluxBarChart();

            this.continents = this.data.dimension( jQuery.proxy( function( d )
            {
                return d[this.regionColName];
            }, this ) );

            // Create DC Objects
            this.createFluxBarCharts();
            this.createDataTable( "#data-count", "#data-table", this.data, this.data.groupAll(), this.continents );
            dc.renderAll();

            this.updateToolTipsForCharts();
            this.updateXAxisForFluxBarChart();
            this.updateFluxBarCharts();

            // Home with selected flux
            $( this.allFluxIdToSelectHomePage ).click();

            this.createMapAndUpdateAllAfterRender();
        }, this ) );
    },

//    initOthers: function()
//    {
//        var userAgent = getUserAgengt();
//        var isFirefox = /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent );
//        if( !isFirefox )
//            $( "#dataPNGExport" ).addClass( "disabled" );
//    },

    initYDomainsForFluxBarChart: function()
    {
        if( !this.needToAdaptDomains )
            return;

        var mainFluxDomain = 0;
        var mainFluxDomainWithUncertainty = 0;
        var mainAllFluxDomainArray = {};
        var mainAllFluxDomainWithUncertaintyArray = {};
        var separatedFluxDomain = 0;
        var separatedFluxDomainWithUncertainty = 0;
        var separatedAllFluxDomainArray = {};
        var separatedAllFluxDomainWithUncertaintyArray = {};

        $.each( this.filterRecords.top( Infinity ), jQuery.proxy( function( i, d )
        {
            if( this.mainFlux.indexOf( d[this.fluxColName] ) != -1 )
            {
                mainFluxDomain = !isNaN( d[this.valueColName] ) ? Math.max( mainFluxDomain, Math.abs( parseFloat( d[this.valueColName] ) ) ) : mainFluxDomain;
                mainFluxDomainWithUncertainty = d[this.uncertaintyColName] && !isNaN( d[this.valueColName] ) && !isNaN( d[this.uncertaintyColName] ) ? Math.max( mainFluxDomainWithUncertainty, Math.abs( parseFloat( d[this.valueColName] ) ) + Math.abs( parseFloat( d[this.uncertaintyColName] ) ) ) : mainFluxDomainWithUncertainty;
                mainAllFluxDomainArray = this.setValueInArrayMap( mainAllFluxDomainArray, d[this.fluxColName], d[this.valueColName] );
                mainAllFluxDomainWithUncertaintyArray = this.setValueInArrayMap( mainAllFluxDomainWithUncertaintyArray, d[this.fluxColName], d[this.valueColName], d[this.uncertaintyColName] );
            }
            else
            {
                separatedFluxDomain = !isNaN( d[this.valueColName] ) ? Math.max( separatedFluxDomain, Math.abs( parseFloat( d[this.valueColName] ) ) ) : separatedFluxDomain;
                separatedFluxDomainWithUncertainty = d[this.uncertaintyColName] && !isNaN( d[this.valueColName] ) && !isNaN( d[this.uncertaintyColName] ) ? Math.max( separatedFluxDomainWithUncertainty, Math.abs( parseFloat( d[this.valueColName] ) ) + Math.abs( parseFloat( d[this.uncertaintyColName] ) ) ) : separatedFluxDomainWithUncertainty;
                separatedAllFluxDomainArray = this.setValueInArrayMap( separatedAllFluxDomainArray, d[this.fluxColName], d[this.valueColName] );
                separatedAllFluxDomainWithUncertaintyArray = this.setValueInArrayMap( separatedAllFluxDomainWithUncertaintyArray, d[this.fluxColName], d[this.valueColName], d[this.uncertaintyColName] );
            }
        }, this ) );
        // Domains for mono region
        // Add 1% to see complete box and whiskers plot
        mainFluxDomainWithUncertainty += mainFluxDomainWithUncertainty * 0.01;
        separatedFluxDomainWithUncertainty += separatedFluxDomainWithUncertainty * 0.01;
        this.yDomainForMainFlux = [-mainFluxDomain, mainFluxDomain];
        this.yDomainForMainFluxWithUncertainty = [-mainFluxDomainWithUncertainty, mainFluxDomainWithUncertainty];
        this.yDomainForSeparatedFlux = [-separatedFluxDomain, separatedFluxDomain];
        this.yDomainForSeparatedFluxWithUncertainty = [-separatedFluxDomainWithUncertainty, separatedFluxDomainWithUncertainty];

        // Domains for all regions
        var mainAllFluxDomain = getMaxValueInArrayMap( mainAllFluxDomainArray );
        var mainAllFluxDomainWithUncertainty = getMaxValueInArrayMap( mainAllFluxDomainWithUncertaintyArray );
        mainAllFluxDomainWithUncertainty += mainAllFluxDomainWithUncertainty * 0.01;
        this.yDomainForAllMainFlux = [-mainAllFluxDomain, mainAllFluxDomain];
        this.yDomainForAllMainFluxWithUncertainty = [-mainAllFluxDomainWithUncertainty, mainAllFluxDomainWithUncertainty];
        var separatedAllFluxDomain = getMaxValueInArrayMap( separatedAllFluxDomainArray );
        var separatedAllFluxDomainWithUncertainty = getMaxValueInArrayMap( separatedAllFluxDomainWithUncertaintyArray );
        separatedAllFluxDomainWithUncertainty += separatedAllFluxDomainWithUncertainty * 0.01;
        this.yDomainForAllSeparatedFlux = [-separatedAllFluxDomain, separatedAllFluxDomain];
        this.yDomainForAllSeparatedFluxWithUncertainty = [-separatedAllFluxDomainWithUncertainty, separatedAllFluxDomainWithUncertainty];
    },

    setValueInArrayMap: function( arrayMap, key, value, uncertaintyValue )
    {
        if( !arrayMap[key] )
            arrayMap[key] = 0;
        if( !isNaN( value ) )
            arrayMap[key] += Math.abs( value );
        if( uncertaintyValue && !isNaN( uncertaintyValue ) )
            arrayMap[key] += Math.abs( uncertaintyValue );
        return arrayMap;
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
            this.updateFluxBarCharts();
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

        this.geoChoroplethChart = dc.customGeoChoroplethChart( chartId )
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
        this.geoChoroplethChart.setEmptyZoneWithNoData( this.emptyZoneWithNoData );
        this.geoChoroplethChart.setCallBackOnClick( jQuery.proxy( this.onClickGeoChoroplethChart, this ) );
    },

    onClickGeoChoroplethChart: function()
    {
        this.updateFluxBarCharts();
    },

    getTranslatedDisplayedRegions: function()
    {
        if( !this.geoChoroplethChart )
            return;

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
        this.geoChoroplethChart.setSelect( false );
        this.geoChoroplethChart.setMultipleSelect( false );
        $( "#resetMap" ).click();

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
    /* ************************* FLUX BAR CHART *************************** */
    /* ******************************************************************** */
    /**
     * dc.js
     * http://blog.rusty.io/2012/09/17/crossfilter-tutorial/
     * "... when you filter on a dimension, and then roll-up using said dimension, Crossfilter intentionally ignores any filter an said dimension....
     * ...The workaround is to create another dimension on the same field, and filter on that.
     * ... Dimensions are stateful, so Crossfilter knows about our filter, and will ensure that all future operations are filtered to only work on the filter field
     * except for any calculations performed directly on the said dimension..."
     * No way to try with filters !!!
     * http://stackoverflow.com/questions/10608171/using-crossfilter-to-dynamically-return-results-in-javascript/10660123#10660123
     */
    createFluxBarCharts: function()
    {
        var carbonBudgets = this.data.dimension( function ( d )
        {
            return d[this.fluxColName];
        }, this );

        // group based on carbonBudgets dimension otherwise, a click on a bar hide all others
        var budgetAmountGroup = carbonBudgets.group().reduce(
            // add
                jQuery.proxy( function( p, v )
                {
                    if( parseFloat( v[this.valueColName] ) && !isNaN( this.numberFormat( v[this.valueColName] ) ) )
                        p.value += parseFloat( this.numberFormat( v[this.valueColName] ) );
                    if( parseFloat( v[this.uncertaintyColName] ) && !isNaN( this.numberFormat( v[this.uncertaintyColName] ) ) )
                        p.uncertainty += parseFloat( this.numberFormat( v[this.uncertaintyColName] ) );
                    if( v[this.commentColName] )
                        p.comment += "<span class='d3-tipRegion'>" + v[this.regionColName] + " : </span>" + v[this.commentColName] + "<BR/>";

                    p.id = (this.getI18nPropertiesKeyFromValue( v[this.fluxColName] ) && 0 != this.getI18nPropertiesKeyFromValue( v[this.fluxColName] ).indexOf( "[" )) ? this.getI18nPropertiesKeyFromValue( v[this.fluxColName] ) : v[this.fluxColName];
                    return p;
                }, this ),
            // remove
                jQuery.proxy( function( p, v )
                {
                    if( parseFloat( v[this.valueColName] ) && !isNaN( this.numberFormat( v[this.valueColName] ) ) )
                        p.value -= parseFloat( this.numberFormat( v[this.valueColName] ) );
                    if( parseFloat( v[this.uncertaintyColName] ) && !isNaN( this.numberFormat( v[this.uncertaintyColName] ) ) )
                        p.uncertainty -= parseFloat( this.numberFormat( v[this.uncertaintyColName] ) );
                    p.comment = p.comment.replace( "<span class='d3-tipRegion'>" + v[this.regionColName] + " : </span>" + v[this.commentColName] + "<BR/>", '' );
                    return p;
                }, this ),
            // init
                jQuery.proxy( function( p, v )
                {
                    return {value: 0, uncertainty: 0, comment : "", id:""};
                }, this )
                );

        this.fluxBarChartForMainFlux = this.createFluxBarChart( "#fluxBarChartForMainFlux", $( "#fluxBarChartForMainFlux" ).width(), this.barChartHeight, carbonBudgets, budgetAmountGroup, this.mainFlux, this.yDomainForAllMainFlux, false, this.barCharMargin );
        var rightBarChartMargin = {top: this.barCharMargin.top, right: this.barCharMargin.left, bottom: this.barCharMargin.bottom, left: this.barCharMargin.right};
        this.fluxBarChartForSeparatedFlux = this.createFluxBarChart( "#fluxBarChartForSeparatedFlux", $( "#fluxBarChartForSeparatedFlux" ).width(), this.barChartHeight, carbonBudgets, budgetAmountGroup, this.separatedFlux, this.yDomainForAllSeparatedFlux, true, rightBarChartMargin );
    },

    createFluxBarChart: function( chartId, width, height, dimension, group, xDomain, yDomain, useRightYAxis, barCharMargin )
    {
        var barChart = dc.customBarChartWithUncertainty( chartId )
                .height( height )
                .width( width )
                .transitionDuration( 750 )
                .margins( barCharMargin )
                .dimension( dimension )
                .group( group, "groupLayer" )
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
        barChart.displayBoxAndWhiskersPlot( this.displayUncertainty );
        barChart.setCallBackOnClick( jQuery.proxy( this.onClickFluxChart, [this, chartId] ) );
        barChart.on( "postRedraw", jQuery.proxy( function()
        {
            this.onCompleteDisplayFluxChart()
        }, this ) );
        return barChart;
    },

    getYDomainForBarChartFlux: function( isMain )
    {
        if( (this.geoChoroplethChart.getDisplayedRegions().length == this.geoChoroplethChart.getNumberAllDisplayedRegions())
                || !(this.geoChoroplethChart.getSelect() && !this.geoChoroplethChart.getMultipleSelect()) )
        {
            if( this.displayUncertainty )
                return isMain ? this.yDomainForAllMainFluxWithUncertainty : this.yDomainForAllSeparatedFluxWithUncertainty;
            else
                return isMain ? this.yDomainForAllMainFlux : this.yDomainForAllSeparatedFlux;
        }
        else
        {
            if( this.displayUncertainty )
                return isMain ? this.yDomainForMainFluxWithUncertainty : this.yDomainForSeparatedFluxWithUncertainty;
            else
                return isMain ? this.yDomainForMainFlux : this.yDomainForSeparatedFlux;
        }
    },

    updateXAxisForFluxBarChart: function()
    {
        // Flux Bar chart : rotate the x Axis labels
        d3.selectAll( "#fluxBarChart g.x g text" )
                .style( "text-anchor", "end" )
                .attr( "title", function( d )
        {
            return d;
        } )
                .attr( "transform", "translate(-10,0)rotate(315)" )
                .text( jQuery.proxy( function( d )
        {
            var propertyName = this.getI18nPropertiesKeyFromValue( d );
            return 0 != jQuery.i18n.prop( propertyName + "_shortForAxis" ).indexOf( "[" ) ? jQuery.i18n.prop( propertyName + "_shortForAxis" ) : d;
        }, this ) )
                .on( "click", jQuery.proxy( function( d, i )
        {
            var propertyName = 0 != this.getI18nPropertiesKeyFromValue( d ).indexOf( "[" ) ? this.getI18nPropertiesKeyFromValue( d ) : d;
            d3.select( "#fluxBarChartForMainFlux #bar_" + propertyName ).call( this.toolTip.show );
        }, this ) );
    },

    updateFluxBarCharts: function()
    {
        if( !this.getTranslatedDisplayedRegions() )
            return;

        // Title
        var translatedRegions = this.getTranslatedDisplayedRegions().join( " + " );
        if( this.getTranslatedDisplayedRegions().length == this.geoChoroplethChart.getNumberAllDisplayedRegions() )
        {
            $( "#fluxBarChartTitle" ).html( i18n.t( "label.allRegions" ) );
            $( "#imageFluxForSynthesisTitle" ).html( i18n.t( "label.allRegions" ) );
        }
        else
        {
            $( "#fluxBarChartTitle" ).html( translatedRegions );
            $( "#imageFluxForSynthesisTitle" ).html( translatedRegions );
        }
        $( "#fluxBarChartTitle" ).attr( "data-original-title", translatedRegions );

        // Domains
        var yDomainForMainFlux = this.getYDomainForBarChartFlux( true );
        var yDomainForSeparatedFlux = this.getYDomainForBarChartFlux( false );
        this.fluxBarChartForMainFlux.y( d3.scale.linear().domain( yDomainForMainFlux ) );
        this.fluxBarChartForSeparatedFlux.y( d3.scale.linear().domain( yDomainForSeparatedFlux ) );

        d3.selectAll( "#fluxBarChart .grid-line.horizontal line" ).classed( 'zero', false );
        this.fluxBarChartForMainFlux.redraw();
        this.fluxBarChartForSeparatedFlux.redraw();
    },

    onClickFluxChart: function( element )
    {
        var context = this[0];
        var chartId = this[1];
        var dynamicAreaDivId = context.getI18nPropertiesKeyFromValue( element.key );
        context.addOrRemoveToRegionBarChart( $( "#" + dynamicAreaDivId ), element.key );
    },

    onCompleteDisplayFluxChart: function()
    {
        // Update zero axis
        d3.selectAll( "#fluxBarChart .grid-line.horizontal line" )
                .filter( function( d )
        {
            return !d
        } )
                .classed( 'zero', true );

        // Update synthesis values
        $.each( d3.selectAll( "#fluxBarChart .layer0 .bar" )[0], jQuery.proxy( function( i, d )
        {
            if( !d.__data__ || !d.__data__.data )
                return;
            var divId = this.getI18nPropertiesKeyFromValue( d.__data__.data.key );
            $( "#" + divId + "Value" ).html( d.__data__.data.value.value );
        }, this ) );
    },


    /* ******************************************************************** */
    /* ************************ REGION BAR CHART ************************** */
    /* ******************************************************************** */
    /**
     * d3.js
     * http://tenxer.github.io/xcharts/examples/
     */
    addOrRemoveToRegionBarChart: function( dynamicAreaDiv, fluxName )
    {
        this.displayedVariables = this.displayedVariables ? this.displayedVariables : [];
        var isAlreadyAChart = (0 <= getIndexInArray( this.displayedVariables, "name", fluxName ));
        isAlreadyAChart ? $( dynamicAreaDiv ).removeClass( "selected" ) : $( dynamicAreaDiv ).addClass( "selected" );
        if( isAlreadyAChart )
            this.removeToRegionBarChart( fluxName );
        else
            this.createOrAddToBarChart( fluxName );
    },

    /**
     * This method create and/or add flux's bars in the regions bar chart
     * http://bl.ocks.org/mbostock/3887051
     * http://bl.ocks.org/gencay/4629518
     * http://cmaurer.github.io/angularjs-nvd3-directives/multi.bar.chart.html
     * @param fluxValue
     */
    createOrAddToBarChart: function( fluxValue )
    {
        if( 0 >= $( "#regionBarChart div svg" ).length )
        {
            var regionBarChartHeight = this.barChartHeight - this.barCharMargin.top - this.barCharMargin.bottom;

            this.regionBarChartForMainFlux = this.createRegionBarChart( "#regionBarChartForMainFlux", $( "#regionBarChartForMainFlux" ).width() - this.barCharMargin.left, regionBarChartHeight, false, true );
            this.regionBarChartForSeparatedFlux = this.createRegionBarChart( "#regionBarChartForSeparatedFlux", $( "#regionBarChartForSeparatedFlux" ).width() - this.barCharMargin.left, regionBarChartHeight, true, false );
        }
        this.displayedVariables.push( {name : fluxValue, color: false} );
        this.updateDisplayedVariablesAndRegionBarCharts( fluxValue );
        this.updateToolTipsForCharts();
    },

    /**
     * This method create the svg container for the regions bar chart
     * @param containerId
     * @param width
     * @param height
     */
    createRegionBarChart: function( containerId, width, height, useRightYAxis, isForMainFlux )
    {
        var regionsNames = new Array();
        $.each( this.regionsKeys, function( i, d )
        {
            isForMainFlux ? regionsNames.push( (i + 1) + "." + d ) : regionsNames.push( i + 1 );
        } );
        var regionBarChartx0 = d3.scale.ordinal().rangeRoundBands( [0, width], 0.1 ).domain( this.regionsKeys );
        var regionBarChartx1 = d3.scale.ordinal();
        var regionBarCharty = d3.scale.linear().range( [height, 0] );

        // Axes
        var regionBarChartxAxis = d3.svg.axis().scale( regionBarChartx0 );
        var regionBarChartyAxis = d3.svg.axis()
                .scale( regionBarCharty )
                .orient( useRightYAxis ? "right" : "left" )
                .tickFormat( d3.format( ".2s" ) )
                .tickSize( -width, 0 );

        $( containerId ).addClass( "dc-chart" );
        // BarChart
        var regionBarChartsvg = d3.select( containerId ).append( "svg" )
                .attr( "width", width + this.barCharMargin.left + this.barCharMargin.right )
                .attr( "height", height + this.barCharMargin.top + this.barCharMargin.bottom )
                .append( "g" )
                .attr( "transform", "translate(" + (useRightYAxis ? 0 : this.barCharMargin.left) + "," + this.barCharMargin.top + ")" );

        var regionBarChartsvgG = regionBarChartsvg.append( "g" )
                .attr( "class", "y axis" );
        if( useRightYAxis )
            regionBarChartsvgG.attr( "transform", "translate(" + width + ",0)" );

        regionBarChartsvgG.append( "text" )
                .attr( "transform", "rotate(-90)" )
                .attr( "y", 6 )
                .attr( "dy", ".7em" )
                .style( "text-anchor", "end" )
                .text( "" );

        regionBarChartsvg.append( "g" )
                .attr( "class", "x axis" )
                .attr( "transform", "translate(0," + height + ")" );

        // xAxis
        regionBarChartsvg.select( '.x.axis' ).call( regionBarChartxAxis );

        var regionBarChartObject = new Object();
        regionBarChartObject.width = width;
        regionBarChartObject.x0 = regionBarChartx0;
        regionBarChartObject.x1 = regionBarChartx1;
        regionBarChartObject.y = regionBarCharty;
        regionBarChartObject.xAxis = regionBarChartxAxis;
        regionBarChartObject.yAxis = regionBarChartyAxis;
        regionBarChartObject.svg = regionBarChartsvg;
        regionBarChartObject.useRightYAxis = useRightYAxis;
        regionBarChartObject.isForMainFlux = isForMainFlux;

        this.updateRegionBarChartAxes( regionBarChartObject );
        return regionBarChartObject;
    },

    setColumnDetailsAndTotals: function( transposedData )
    {
        transposedData.forEach( jQuery.proxy( function( d )
        {
            var index = 0;
            d.columnDetails = this.displayedVariables.map( jQuery.proxy( function( element, i )
            {
                if( d[element.name] )
                {
                    var result = {name: element.name, column: index.toString(), yBegin: (0 > d[element.name].value ? d[element.name].value : 0), yEnd: (0 < d[element.name].value ? d[element.name].value : 0), uncertainty: d[element.name].uncertainty, color:false, region:d.Name};
                    index++;
                    return result;
                }
            }, this ) );

            d.columnDetails = d.columnDetails.filter( function( n )
            {
                return n != undefined
            } );

            d.negativeTotal = d3.min( d.columnDetails, jQuery.proxy( function( d )
            {
                if( this.displayUncertainty && d.uncertainty && !isNaN( parseFloat( d.uncertainty ) ) )
                    return d ? parseFloat( d.yBegin ) + parseFloat( d.uncertainty ) : 0;
                else
                    return d ? parseFloat( d.yBegin ) : 0;
            }, this ) );

            d.positiveTotal = d3.max( d.columnDetails, jQuery.proxy( function( d )
            {
                if( this.displayUncertainty && d.uncertainty && !isNaN( parseFloat( d.uncertainty ) ) )
                    return d ? parseFloat( d.yEnd ) + parseFloat( d.uncertainty ) : 0;
                else
                    return d ? parseFloat( d.yEnd ) : 0;
            }, this ) );
        }, this ) );
    },

    /**
     * This method update the actual bar chart after an add or a remove of a flux value
     */
    updateDisplayedVariablesAndRegionBarCharts: function( fluxValue )
    {
        // Create details for each column
        this.setColumnDetailsAndTotals( this.transposedDataForMainFlux );
        this.setColumnDetailsAndTotals( this.transposedDataForSeparatedFlux );
        this.regionBarChartForMainFlux.transposedData = this.transposedDataForMainFlux;
        this.regionBarChartForSeparatedFlux.transposedData = this.transposedDataForSeparatedFlux;

//        if( 0 == this.regionBarChartForSeparatedFlux.transposedData[0].columnDetails.length )
//            this.changeSvgWidth(this.regionBarChartForSeparatedFlux,"#regionBarChartForSeparatedFlux svg",0, this.regionBarChartForMainFlux, "#regionBarChartForMainFlux svg", this.barChartWidth);
//        else if( 0 == this.regionBarChartForMainFlux.transposedData[0].columnDetails.length )
//            this.changeSvgWidth(this.regionBarChartForMainFlux, "#regionBarChartForMainFlux svg",0, this.regionBarChartForSeparatedFlux, "#regionBarChartForSeparatedFlux svg", this.barChartWidth);
//        else if( -1 != this.mainFlux.indexOf( fluxValue ) )
//            this.changeSvgWidth(this.regionBarChartForSeparatedFlux,"#regionBarChartForSeparatedFlux svg",$("#regionBarChartForSeparatedFlux").width(), this.regionBarChartForMainFlux, "#regionBarChartForMainFlux svg", $("#regionBarChartForMainFlux").width());
//        else
//            this.changeSvgWidth(this.regionBarChartForMainFlux,"#regionBarChartForMainFlux svg",$("#regionBarChartForMainFlux").width(), this.regionBarChartForSeparatedFlux, "#regionBarChartForSeparatedFlux svg", $("#regionBarChartForSeparatedFlux").width());

        // Update region barcharts
        if( -1 != this.mainFlux.indexOf( fluxValue ) )
            this.updateRegionBarChart( this.regionBarChartForMainFlux );
        else if( -1 != this.separatedFlux.indexOf( fluxValue ) )
            this.updateRegionBarChart( this.regionBarChartForSeparatedFlux );
        else
        {
            this.updateRegionBarChart( this.regionBarChartForMainFlux );
            this.updateRegionBarChart( this.regionBarChartForSeparatedFlux );
        }
    },

//    changeSvgWidth: function(regionBarChartObject1, svg1, width1, regionBarChartObject2, svg2, width2)
//    {
//        console.log(svg1+", "+width1+" !! "+svg2+", "+width2);
//        d3.select( svg1 )
//            .transition()
//            .duration( 1000 )
//            .ease( "linear" )
//            .attr( "width", width1 )
//            .each("end", jQuery.proxy(function()
//        {
//            d3.select(svg2)
//                .transition()
//                .duration( 1000 )
//                .ease( "linear" )
//                .attr( "width", width2 + this.barCharMargin.left + this.barCharMargin.right );
//
//            this.changeSvgContent(regionBarChartObject1, width1);
//            this.changeSvgContent(regionBarChartObject2, width2);
//        }, this));
//    },

//    changeSvgContent: function(regionBarChartObject, width)
//    {
//        width -= this.barCharMargin.left;
//        regionBarChartObject.width = width;
//        regionBarChartObject.x0 = d3.scale.ordinal().rangeRoundBands( [0, width], 0.1 ).domain( this.regionsKeys );
//        regionBarChartObject.yAxis.tickSize( -width, 0 );
//        regionBarChartObject.xAxis.scale( regionBarChartObject.x0 );
//        regionBarChartObject.svg.select( '.x.axis' )
//            .transition()
//            .duration( 1000 )
//            .ease( "linear" )
//            .call( regionBarChartObject.xAxis );
//        this.updateRegionBarChart(regionBarChartObject );
//    },

    updateRegionBarChart: function( regionBarChart )
    {
        this.updateRegionBarChartDomains( regionBarChart );
        this.updateRegionBarChartAxes( regionBarChart );
        this.updateRegionBarChartBar( regionBarChart );
        this.updateRegionBarChartUncertainty( regionBarChart );
        this.updateRegionBarChartLegend( regionBarChart );
    },

    updateRegionBarChartDomains: function( regionBarChartObject )
    {
        regionBarChartObject.y.domain( [d3.min( regionBarChartObject.transposedData, function( d )
        {
            return d.negativeTotal;
        } ), d3.max( regionBarChartObject.transposedData, function( d )
        {
            return d.positiveTotal;
        } )] );
        var displayedVariablesByBarChart = new Array();
        $.each( this.displayedVariables, jQuery.proxy( function( i, d )
        {
            if( (regionBarChartObject.isForMainFlux && (-1 != this.mainFlux.indexOf( d.name ) ))
                    || (!regionBarChartObject.isForMainFlux && (-1 != this.separatedFlux.indexOf( d.name ) )) )
                displayedVariablesByBarChart.push( d );
        }, this ) );

        regionBarChartObject.x1.domain( d3.keys( displayedVariablesByBarChart ) ).rangeRoundBands( [0, regionBarChartObject.x0.rangeBand()] );
    },

    updateRegionBarChartAxes: function( regionBarChartObject )
    {
        // Update yAxis
        regionBarChartObject.svg
                .select( '.y.axis' )
                .call( regionBarChartObject.yAxis )
                .selectAll( 'line' )
                .filter( function( d )
        {
            return !d
        } )
                .classed( 'zero', true );

        // Rotate the x Axis labels
        if( !regionBarChartObject.useRightYAxis )
            regionBarChartObject.svg.selectAll( "g.x g text" )
                    .style( "text-anchor", "end" )
                    .attr( "transform", "translate(-10,0)rotate(315)" )
                    .text( function( d, i )
            {
                return (i + 1) + "." + d.replace( "North", "Nth" ).replace( "SouthEast", "SE" ).replace( "South", "Sth" );
            } );
        else
            regionBarChartObject.svg.selectAll( "g.x g text" )
                    .text( function( d, i )
            {
                return i + 1;
            } );
    },

    updateRegionBarChartLegend: function( regionBarChartObject )
    {
        var legend = regionBarChartObject.svg.selectAll( ".legend" )
                .data( jQuery.proxy( function()
        {
            this.displayedVariables.slice();
            var result = new Array();
            $.each( this.displayedVariables, jQuery.proxy( function( i, d )
            {
                if( (regionBarChartObject.isForMainFlux && (-1 != this.mainFlux.indexOf( d.name ) ))
                        || (!regionBarChartObject.isForMainFlux && (-1 != this.separatedFlux.indexOf( d.name ) )) )
                    result.push( d );
            }, this ) );
            return result;
        }, this ) );

        var legendsEnter = legend.enter().append( "g" )
                .attr( "class", "legend" );

        legendsEnter.append( "rect" )
                .attr( "id", function( d, i )
        {
            return "regionBarChartSvg_legendRect_" + i;
        } )
                .attr( "x", regionBarChartObject.width - 18 )
                .attr( "width", 10 )
                .attr( "height", 10 );

        legendsEnter.append( "text" )
                .attr( "x", regionBarChartObject.width - 24 )
                .attr( "y", 9 )
                .attr( "dy", 0 )
                .style( "text-anchor", "end" );
        legend.exit().remove();

        // When remove bar
        legend.select( "text" )
                .text( jQuery.proxy( function( d )
        {
            var propertyName = this.getI18nPropertiesKeyFromValue( d.name );
            return (0 != jQuery.i18n.prop( propertyName + "_shortForAxis" ).indexOf( "[" )
                    && -1 != jQuery.i18n.prop( "separatedFlux" ).indexOf( d.name )) ? jQuery.i18n.prop( propertyName + "_shortForAxis" ) : d.name;
        }, this ) );

        legend.select( "rect" )
                .style( "fill", jQuery.proxy( function( d )
        {
            if( !d.color )
                d.color = this.color( d.name );
            return d.color;
        }, this ) )
                .style( "stroke", "#2C3537" )
                .attr( "x", regionBarChartObject.width - 18 )
                .on( "click", jQuery.proxy( function( d )
        {
            this.onClickRegionBarChart( d );
        }, this ) );

        legend.select( "text" ).transition().duration( 1000 ).ease( "linear" )
                .attr( "x", regionBarChartObject.width - 24 );

        legend.attr( "transform",
                jQuery.proxy( function( d, i )
                {
                    var zeroLineTranslateValue = d3.select( "#regionBarChartForSeparatedFlux g.y.axis g line.zero" )[0][0];
                    if( !regionBarChartObject.isForMainFlux && zeroLineTranslateValue && zeroLineTranslateValue.parentNode.attributes.transform.value && -1 != zeroLineTranslateValue.parentNode.attributes.transform.value.indexOf( "0,0" ) )
                        return "translate(0," + (this.barChartHeight - this.barCharMargin.bottom - this.barCharMargin.top * 3 + i * 15) + ")";
                    else
                        return "translate(0," + i * 15 + ")";
                }, this ) );
    },

    updateRegionBarChartBar: function( regionBarChartObject )
    {
        var regionBar = regionBarChartObject.svg.selectAll( ".groupedBar" )
                .data( regionBarChartObject.transposedData );

        var regionBarEnter = regionBar.enter().append( "g" )
                .attr( "class", "groupedBar" )
                .attr( "transform", jQuery.proxy( function( d )
        {
            return "translate(" + regionBarChartObject.x0( d[this.fluxColName] ) + ",0)";
        }, this ) );

        var regionBarRect = regionBar.selectAll( "rect" )
                .data( jQuery.proxy( function( d )
        {
            return d.columnDetails;
        }, this ) );

        regionBarRect.enter().append( "rect" )
                .on( "click", jQuery.proxy( function( d )
        {
            this.onClickRegionBarChart( d );
        }, this ) );

        regionBarRect.exit().remove();

        regionBar.transition()
                .duration( 500 )
                .ease( "linear" )
                .selectAll( "rect" )
                .attr( "width", regionBarChartObject.x1.rangeBand() )
                .attr( "x", jQuery.proxy( function( d )
        {
            return regionBarChartObject.x1( d.column );
        }, this ) )
                .attr( "y", jQuery.proxy( function( d )
        {
            return regionBarChartObject.y( d.yEnd );
        }, this ) )
                .attr( "height", jQuery.proxy( function( d )
        {
            return regionBarChartObject.y( d.yBegin ) - regionBarChartObject.y( d.yEnd );
        }, this ) )
                .style( "fill", jQuery.proxy( function( d )
        {
            if( !d.color )
                d.color = this.color( d.name );
            return d.color;
        }, this ) );
    },

    updateRegionBarChartUncertainty: function( regionBarChartObject )
    {
        var regionBar = regionBarChartObject.svg.selectAll( ".groupedBar" )
                .data( regionBarChartObject.transposedData );

        var regionBarPath = regionBar.selectAll( "path" )
                .data( jQuery.proxy( function( d )
        {
            return d.columnDetails;
        }, this ) );

        regionBarPath.enter().append( "path" );
        regionBarPath.exit().remove();

        regionBar.transition()
                .duration( 500 )
                .ease( "linear" )
                .selectAll( "path" )
                .attr( "d", jQuery.proxy( function( d )
        {
            var xCenter = regionBarChartObject.x1( d.column ) + regionBarChartObject.x1.rangeBand() / 2;
            var lineWidth = regionBarChartObject.x1.rangeBand() / 5;
            var yTop = regionBarChartObject.y( parseFloat( d.yEnd ) + parseFloat( d.uncertainty ) );
            var yBottom = regionBarChartObject.y( parseFloat( d.yEnd ) - parseFloat( d.uncertainty ) );
            if( 0 > d.yBegin )
            {
                yTop = regionBarChartObject.y( parseFloat( d.yBegin ) + parseFloat( d.uncertainty ) );
                yBottom = regionBarChartObject.y( parseFloat( d.yBegin ) - parseFloat( d.uncertainty ) );
            }

            if( this.displayUncertainty && d.uncertainty )
                return "M" + (xCenter - lineWidth) + "," + yBottom + "L" + (xCenter + lineWidth) + "," + yBottom + "M" + xCenter + "," + yBottom +
                        "L" + xCenter + "," + yTop + "M" + (xCenter - lineWidth) + "," + yTop + "L" + (xCenter + lineWidth) + "," + yTop;
            else
                return false;
        }, this ) )
                .attr( "stroke", jQuery.proxy( function( d )
        {
            if( !d.color )
                d.color = this.color( d.name );
            return ColorLuminance( d.color, -0.3 );
        }, this ) )
                .attr( "stroke-width", jQuery.proxy( function( d )
        {
            if( -1 != this.separatedFlux.indexOf( d.name ) || (-1 != this.mainFlux.indexOf( d.name ) && 4 > this.regionBarChartForMainFlux.transposedData[0].columnDetails.length) )
                return "2";
            else return "1";
        }, this ) );
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
        this.updateDisplayedVariablesAndRegionBarCharts( fluxName );
    },


    /* ******************************************************************** */
    /* ************************ OTHERS FOR CHARTS ************************* */
    /* ******************************************************************** */
    updateToolTipsForCharts: function()
    {
        d3.selectAll( ".country, #fluxBarChart .bar, #fluxBarChart text, #regionBarChart .groupedBar rect, #regionBarChartForSeparatedFlux .x.axis text, #regionBarChartForMainFlux .x.axis text, #regionBarChartForSeparatedFlux .legend rect" ).call( this.toolTip );
        d3.selectAll( ".country, #fluxBarChart .bar, #fluxBarChart text, #regionBarChart .groupedBar rect, #regionBarChartForSeparatedFlux .x.axis text, #regionBarChartForMainFlux .x.axis text, #regionBarChartForSeparatedFlux .legend rect" )
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
                    return parseInt( width ) == parseInt( $( imageId ).width() );
                },
                jQuery.proxy( function()
                {
                    this.createAreas( mapId, activeClick, dynamicAreasId );
                    if( activeClick )
                    {
                        this.initDimensionsForCharts( $( imageId ).height() );
                        var topPosition = -2 * this.imageHeight / 3;// + (this.imageHeight / 2 + $( "#synthesis" ).height()) / 2 - 10;
                        $( "#synthesis" ).css( "margin-top", topPosition );
                        var right = ($( "#regionBarChart" ).width() - $( imageId ).width() < $( "#synthesisComment" ).width()) ? 20 : ($( "#regionBarChart" ).width() - $( imageId ).width() - $( "#synthesisComment" ).width()) / 2;
                        $( "#synthesis" ).css( "margin-right", right );
                        $( "#mapChartAndRegionSelect" ).height( $( "#imageFluxCell" ).height() );
                        $( "#dynamicAreasForImageFlux .dynamicArea" ).tooltip( {
                            placement: "bottom",
                            container:'body'} );
//                        this.initFileValuesAndCreateDCObjects();
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
            var div = $( '<div id="' + element.alt + '" name="' + element.alt + '" class="dynamicArea" title="' + i18n.t( "tooltip.flux" ) + '"></div>' );
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

    bindActions: function()
    {
        // Reset button
        $( "#reset" ).on( "click", jQuery.proxy( function()
        {
            $( "#dynamicAreasForImageFlux .dynamicArea" ).removeClass( "selected" );
            this.displayedVariables = [];
            this.displayUncertainty = false;
            this.fluxBarChartForMainFlux.displayBoxAndWhiskersPlot( this.displayUncertainty );
            this.fluxBarChartForSeparatedFlux.displayBoxAndWhiskersPlot( this.displayUncertainty );

            dc.filterAll();
            dc.renderAll();
            this.loadRegionOneSelection();
            this.updateToolTipsForCharts();
            this.updateFluxBarCharts();
            this.updateXAxisForFluxBarChart();
            this.updateDisplayedVariablesAndRegionBarCharts();

            $( this.allFluxIdToSelectHomePage ).click();
        }, this ) );

        // Help button
        $( "#help" ).on( "click", jQuery.proxy( function()
        {
            this.createHelp();
        }, this ) );

        $( "#uncertaintyDiv" ).on( "click", jQuery.proxy( function()
        {
            this.displayUncertainty = !this.displayUncertainty;
            if( !this.displayUncertainty )
            {
                $( "#uncertaintyText" ).html( i18n.t( "button.uncertaintyDisplay" ) );
                $( "#fluxBarChart" ).removeClass( "uncertainty" );
            }
            else
            {
                $( "#uncertaintyText" ).html( i18n.t( "button.uncertaintyHide" ) );
                $( "#fluxBarChart" ).addClass( "uncertainty" );
            }
            this.fluxBarChartForMainFlux.displayBoxAndWhiskersPlot( this.displayUncertainty );
            this.fluxBarChartForSeparatedFlux.displayBoxAndWhiskersPlot( this.displayUncertainty );
            this.updateFluxBarCharts();
            this.updateDisplayedVariablesAndRegionBarCharts();
        }, this ) );

        // Reset filters
        $( "#resetMap" ).on( "click", jQuery.proxy( function()
        {
            this.geoChoroplethChart.filterAll();
            this.geoChoroplethChart.redraw();
            this.updateFluxBarCharts();
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
    },

    addElementIntoArrayContinent: function( d, arrayByContinents )
    {
        if( arrayByContinents[d[this.regionColName]] == undefined )
            arrayByContinents[d[this.regionColName]] = new Object();
        var object = new Object();
        object.value = d[this.valueColName];
        object.uncertainty = d[this.uncertaintyColName];
        arrayByContinents[d[this.regionColName]][d[this.fluxColName]] = object;
    },

    transposeDataFromFile: function( csv )
    {
        var arrayByContinents = new Array();
        var arrayByContinentsForMainFlux = new Array();
        var arrayByContinentsForSeparatedFlux = new Array();
        // First we group all values by continents
        $.each( csv, jQuery.proxy( function( i, d )
        {
            if( -1 != this.mainFlux.indexOf( d[this.fluxColName] ) )
                this.addElementIntoArrayContinent( d, arrayByContinentsForMainFlux );
            else
                this.addElementIntoArrayContinent( d, arrayByContinentsForSeparatedFlux );
            this.addElementIntoArrayContinent( d, arrayByContinents );
        }, this ) );

        // Then we create a more simple array (no associative) to avoid tu use array's functions
        this.regionsKeys = d3.keys( arrayByContinentsForMainFlux ).filter( function( key )
        {
            return key;
        } );
        // Put Globe region in head
        this.regionsKeys.sort().reverse();
        this.regionsKeys.splice( $.inArray( this.globeRegion, this.regionsKeys ), 1 );
        this.regionsKeys.push( this.globeRegion );
        this.regionsKeys.reverse();

        this.transposedData = new Array();
        this.transposedDataForMainFlux = new Array();
        this.transposedDataForSeparatedFlux = new Array();
        $.each( this.regionsKeys, jQuery.proxy( function( i, key )
        {
            var object = arrayByContinentsForMainFlux[key];
            object[this.fluxColName] = key;
            this.transposedDataForMainFlux.push( object );
            object = arrayByContinentsForSeparatedFlux[key];
            object[this.fluxColName] = key;
            this.transposedDataForSeparatedFlux.push( object );
            object = arrayByContinents[key];
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
        $.each( d3.selectAll( "#fluxBarChartForMainFlux rect" )[0], function( i, d )
        {
            $( d ).attr( "id", "fluxBarChartForMainFlux_rect_" + i );
        } );

        var parameters = new Object();

        var barRectHeight = $( "#fluxBarChartForMainFlux_rect_0" )[0].attributes.height ? parseFloat( $( "#fluxBarChartForMainFlux_rect_0" )[0].attributes.height.value ) : 0;
        var barRectWidth = $( "#fluxBarChartForMainFlux_rect_0" )[0].attributes.width ? parseFloat( $( "#fluxBarChartForMainFlux_rect_0" )[0].attributes.width.value ) : 0;

        parameters.helpArray = [
            {linkType:"right", divToHelpId:"reset", text:i18n.t( "help.reset" ), marginTop:31, marginLeft:15, stage: 4},
            {linkType:"right", divToHelpId:"export", text:i18n.t( "help.export" ), marginTop:31, marginLeft:12, textLengthByLine: 70, stage: 2},
            {linkType:"right", divToHelpId:"data", text:i18n.t( "help.data" ), marginTop:37, marginLeft: 12, stage: 1},
            {linkType:"simple", divToHelpId:"uncertaintyDiv", text:i18n.t( "help.uncertainty" ), marginTop:7, marginLeft: -6},
            {linkType:"middle", divToHelpId:"mapChart", text:i18n.t( "label.clickRegion" ), marginTop:$( "#mapChart" ).height() / 2, marginLeft: $( "#mapChart" ).width() / 2},
            {linkType:"right", divToHelpId:"resetMap", text:i18n.t( "help.resetMap" ), marginTop:15, marginLeft: 8, stage:1},
            {linkType:"left", divToHelpId:"synthesis", text:i18n.t( "help.synthesis" ), marginTop:60, marginLeft: 45, textLengthByLine: 45, stage:1},
            {linkType:"simpleLeft", divToHelpId:"resetFlux", text:i18n.t( "help.resetFlux" ), marginTop:4, marginLeft: 28, stage:1},
            {linkType:"middle", divToHelpId:"LUC", text:i18n.t( "label.clickFlux" ), marginTop:25, marginLeft: 30},

            {linkType:"simple", divToHelpId:"fluxBarChartForMainFlux_rect_0", text:i18n.t( "help.clickBar" ), marginTop:barRectHeight / 2, marginLeft:5 + barRectWidth / 2},
            {linkType:"left", divToHelpId:"regionBarChartSvg_legendRect_0", text:i18n.t( "help.clickLegend" ), marginTop:5, marginLeft: 14, stage:1}
        ];

        if( "none" != $( "#globeActive" ).css( "display" ) )
            parameters.helpArray.push( {linkType:"right", divToHelpId:"globeActive", text:i18n.t( "help.regionSelect" ), marginTop:14, marginLeft: 12, stage:2} );
        else if( "none" != $( "#regionUnActive" ).css( "display" ) )
            parameters.helpArray.push( {linkType:"right", divToHelpId:"regionUnActive", text:i18n.t( "help.regionSelect" ), marginTop:14, marginLeft: 12, stage:2} );
        else
            parameters.helpArray.push( {linkType:"right", divToHelpId:"regionActive", text:i18n.t( "help.regionSelect" ), marginTop:14, marginLeft: 12, stage:2} );

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
function exportAll( fileType )
{
    $( "#sourceWrapper" ).fadeOut( 1000 );

    // File name with date
    var exportDate = $.datepicker.formatDate( 'yy_mm_dd', new Date() );
    var fileName = "GCAExportImage_" + exportDate;

    // Export
    $( '#pageWrapper' ).exportAll( {
        targetExportContainerId: "exportDiv",
        callbackBeforeCanvg:{name: callbackForExportAllBeforeCanvg, arguments: "pageWrapper"},
        callbackOnRendered: {name: callbackForExportAllOnRendered, arguments: "pageWrapper"},
        fileName: fileName,
        fileType: fileType,
        windowTitle: i18n.t( "label.exportAllTitle" ),
        listStyleToGet:["fill", "stroke", "opacity", "fill-opacity", "shape-rendering", "stroke-opacity",
            "font", "font-size", "font-weight", "font-family", "color",
            "float", "height", "width"]
    } );
}

function callbackForExportAllBeforeCanvg( exportDivId, targetExportDivId )
{
    $( "#" + targetExportDivId + " .leftTools, #" + targetExportDivId + " .comment, #" + targetExportDivId + " #regionSelect, #" + targetExportDivId + " #resetFlux" ).remove();
    $( "#" + targetExportDivId + " #resetMap, #" + targetExportDivId + " #synthesis, #" + targetExportDivId + " #imageFlux" ).remove();
    $( "#" + targetExportDivId + " #hiddenDiv, #" + targetExportDivId + " #dataDiv, #" + targetExportDivId + " .synthesisDiv" ).remove();

    // Add GCA logo
    $( "#" + targetExportDivId ).append( "<div class='exportLogo'><img src='img/GCA_logo_white.png' width='150px'></div>" );
}

function callbackForExportAllOnRendered( exportDivId, targetExportDivId )
{
    $( "#sourceWrapper" ).fadeIn();
}

<!-- ********** EXPORT SYNTHESIS ************ -->
function exportSynthesis( fileType )
{
    // File name with date
    var exportDate = $.datepicker.formatDate( 'yy_mm_dd', new Date() );
    var fileName = "GCAExportImage_" + exportDate;

    // Export
    $( '#synthesisDivData' ).exportAll( {
        targetExportContainerId: "exportDiv",
        callbackBeforeCanvg:{name: callbackForExportSynthesisBeforeCanvg},
        fileName: fileName,
        fileType: fileType,
        windowTitle: i18n.t( "label.exportSynthesisTitle" )
    } );
}

function callbackForExportSynthesisBeforeCanvg( targetExportDivId )
{
    $( "#" + targetExportDivId + " #imageFluxForSynthesis" ).remove();

    // Add GCA logo
    $( "#" + targetExportDivId ).append( "<div class='exportLogo'><img src='img/GCA_logo_white.png' width='130px'></div>" );
}
