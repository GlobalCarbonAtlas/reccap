/**
 The entire dc_lsce.js library is scoped under **dc_lsce** name space and fully depends on dc.js library.
 It's just an add for a specific chart.
 Test
 **/

dc_lsce = (function()
{
    'use strict';
//
    var dc_lsce = {
//        version: "2.0.0-dev",
//        constants: {
//            CHART_CLASS: "dc-chart",
//            DEBUG_GROUP_CLASS: "debug",
//            STACK_CLASS: "stack",
//            DESELECTED_CLASS: "deselected",
//            SELECTED_CLASS: "selected",
//            NODE_INDEX_NAME: "__index__",
//            GROUP_INDEX_NAME: "__group_index__",
//            DEFAULT_CHART_GROUP: "__default_chart_group__",
//            EVENT_DELAY: 40,
//            NEGLIGIBLE_NUMBER: 1e-10
//        },
//        _renderlet: null
    };

    /**
     ## Flux Chart

     Includes: [Stack Mixin](#stack Mixin), [Coordinate Grid Mixin](#coordinate-grid-mixin)

     Concrete bar chart/histogram implementation.

     Examples:

     * [Nasdaq 100 Index](http://nickqizhu.github.com/dc.js/)
     * [Canadian City Crime Stats](http://nickqizhu.github.com/dc.js/crime/index.html)

     #### dc.fluxChart(parent[, chartGroup])
     Create a flux chart instance and attach it to the given parent element.

     Parameters:
     * parent : string|compositeChart - any valid d3 single selector representing typically a dom block element such
     as a div, or if this bar chart is a sub-chart in a [Composite Chart](#composite-chart) then pass in the parent composite chart instance.
     * chartGroup : string (optional) - name of the chart group this chart instance should be placed in. Once a chart is placed
     in a certain chart group then any interaction with such instance will only trigger events and redraw within the same
     chart group.

     Return:
     A newly created flux chart instance

     **/

    dc_lsce.fluxChart = function ( parent, chartGroup )
    {
        var fluxData = [
            {id:0, name:"Atmosphere", text:"Atmosphere text", color:"#1f77b4", width:"400px", height:50, transformX:10, transformY:0},
            {id:1, name:"Biosphere", text:"Biosphere text", color:"#98df8a", width:"150px", height:150, transformX:120, transformY:100},
            {id:2, name:"Fossil Fuels", text:"FF text", color:"grey", width:"100px", height:100, transformX:300, transformY:110},
            {id:3, name:"Crops", text:"qmlkqsmdklqsd", color:"#CCCCCC", width:"50px", height:30, transformX:20, transformY:120},
            {id:4, name:"Livestock", text:"qmlkqsmdklqsd", color:"#CCCCCC", width:"80px", height:30, transformX:20, transformY:170},
        ];

        var _g;
        var _arrowHeight = 100;
        var _arrowWidth = 50;

        var _labelOffsetX = 10;
        var _labelOffsetY = 15;
        var _titleLabelOffsetX = 2;

        var _gap = 5;

        var _elementCssClass = "row";
        var _titleElementCssClass = "titlerow";
//        var _renderTitleLabel = false;

        var _chart = dc.capMixin( dc.marginMixin( dc.colorMixin( dc.baseMixin( {} ) ) ) );

        var _x;

        var _elasticX;

        var _xAxis = d3.svg.axis().orient( "bottom" );

        var _elementData;

        _chart.elementsCap = _chart.cap;

        /* **** CALL **** */
        _chart._doRender = function ()
        {
            _chart.resetSvg();

            _g = _chart.svg()
                    .append( "g" )
                    .attr( "transform", "translate(" + _chart.margins().left + "," + _chart.margins().top + ")" );

            drawChart();
            return _chart;
        };

        _chart.title( function ( d )
        {
            return _chart.cappedKeyAccessor( d ) + ": " + _chart.cappedValueAccessor( d );
        } );

        _chart.label( function( d )
        {
            return _chart.cappedKeyAccessor( d )
        });

        _chart.x = function( x )
        {
            if( !arguments.length ) return _x;
            _x = x;
            return _chart;
        };

        /* **** CHART **** */
        function drawChart()
        {
            _elementData = _chart.data();
            var elements = _g.selectAll( "g." + _elementCssClass ).data( fluxData );

            createElements( elements );
            removeElements( elements );
            updateElements( elements );
        }

        /* **** ELEMENTS **** */
        function createElements( elements )
        {
            var elementEnter = elements.enter()
                    .append( "g" )
                    .attr( "class", function ( d, i )
            {
                return _elementCssClass + " _" + i;
            } );

            elementEnter.append( "rect" )
                    .attr( "width", function( d )
            {
                return d.width ? d.width : 100;
            } )
                    .attr( "height", function( d )
            {
                return d.height ? d.height : 50;
            } )
                    .attr( "color", function( d )
            {
                return d.color;
            } );

            createLabels( elementEnter );
//            updateLabels( elements );
        }

        function removeElements( elements )
        {
            elements.exit().remove();
        }

        function updateElements( elements )
        {
//            var n = _elementData.length;

            var rect = elements.attr( "transform",
                    function ( d )
                    {
                        return "translate(" + (d.transformX ? d.transformX : 0) + "," + (d.transformY ? d.transformY : 0) + ")";
                    } )
                    .select( "rect" )
                    .attr( "fill", function( d )
            {
                return d.color;
            } )
                    .on( "click", onClick )
                    .classed( "deselected", function ( d )
            {
                return (_chart.hasFilter()) ? !isSelectedElement( d ) : false;
            } )
                    .classed( "selected", function ( d )
            {
                return (_chart.hasFilter()) ? isSelectedElement( d ) : false;
            } );

            dc.transition( rect, _chart.transitionDuration() )
                    .attr( "width", function ( d )
            {
                return d.width ? d.width : 100;
//                var start = _x( 0 ) == -Infinity ? _x( 1 ) : _x( 0 );
//                return Math.abs( start - _x( _chart.valueAccessor()( d ) ) );
            } )
                    .attr( "height", function( d )
            {
                return d.height ? d.height : 50;
            } )

                    .attr( "transform", translateX );


            updateLabels( elements );
//            createTitles( elements );
        }

        /* **** LABELS & TITLES **** */
        function createLabels( elementEnter )
        {
            if( _chart.renderLabel() )
            {
                elementEnter.append( "text" )
                        .on( "click", onClick );
            }
//            if( _chart.renderTitleLabel() )
//            {
//                elementEnter.append( "text" )
//                        .attr( "class", _titleElementCssClass )
//                        .on( "click", onClick );
//            }
        }

        function updateLabels( elements )
        {
            if( _chart.renderLabel() )
            {
                var lab = elements.select( "text" )
                        .attr( "x", _labelOffsetX )
                        .attr( "y", _labelOffsetY )
                        .on( "click", onClick )
                        .attr( "class", function ( d, i )
                {
                    return _elementCssClass + " _" + i;
                } )
                        .text( function ( d )
                {
                    return _chart.label()( d );
                } );
                dc.transition( lab, _chart.transitionDuration() )
                        .attr( "transform", translateX );
            }
//            if( _chart.renderTitleLabel() )
//            {
//                var titlelab = elements.select( "." + _titleElementCssClass )
//                        .attr( "x", _chart.effectiveWidth() - _titleLabelOffsetX )
//                        .attr( "y", _labelOffsetY )
//                        .attr( "text-anchor", "end" )
//                        .on( "click", onClick )
//                        .attr( "class", function ( d, i )
//                {
//                    return _titleElementCssClass + " _" + i;
//                } )
//                        .text( function ( d )
//                {
//                    return _chart.title()( d );
//                } );
//                dc.transition( titlelab, _chart.transitionDuration() )
//                        .attr( "transform", translateX );
//            }
        }

        function createTitles( elements )
        {
            if( _chart.renderTitle() )
            {
                elements.selectAll( "title" ).remove();
                elements.append( "title" ).text( _chart.title() );
            }
        }


        /* **** OTHERS **** */
        /**
         #### .renderTitleLabel(boolean)
         Turn on/off Title label rendering (values) using SVG style of text-anchor 'end'

         **/
//        _chart.renderTitleLabel = function ( _ )
//        {
//            if( !arguments.length ) return _renderTitleLabel;
//            _renderTitleLabel = _;
//            return _chart;
//        };

        function onClick( d )
        {
            _chart.onClick( d );
        }

        function translateX( d )
        {
//            var x = _x( _chart.cappedValueAccessor( d ) ),
//                    x0 = _x( 0 ),
//                    s = x > x0 ? x0 : x;
//            return "translate(" + s + ",0)";
            return "translate(0,0)";
        }

        _chart._doRedraw = function ()
        {
            drawChart();
            return _chart;
        };

        _chart.xAxis = function ()
        {
            return _xAxis;
        };

        /**
         #### .gap([gap])
         Get or set the vertical gap space between elements on a particular element chart instance. Default gap is 5px;

         **/
        _chart.gap = function ( g )
        {
            if( !arguments.length ) return _gap;
            _gap = g;
            return _chart;
        };

        /**
         #### .elasticX([boolean])
         Get or set the elasticity on x axis. If this attribute is set to true, then the x axis will rescle to auto-fit the data
         range when filtered.

         **/
        _chart.elasticX = function ( _ )
        {
            if( !arguments.length ) return _elasticX;
            _elasticX = _;
            return _chart;
        };

        /**
         #### .labelOffsetX([x])
         Get or set the x offset (horizontal space to the top left corner of a element) for labels on a particular element chart. Default x offset is 10px;

         **/
        _chart.labelOffsetX = function ( o )
        {
            if( !arguments.length ) return _labelOffsetX;
            _labelOffsetX = o;
            return _chart;
        };

        /**
         #### .labelOffsetY([y])
         Get or set the y offset (vertical space to the top left corner of a element) for labels on a particular element chart. Default y offset is 15px;

         **/
        _chart.labelOffsetY = function ( o )
        {
            if( !arguments.length ) return _labelOffsetY;
            _labelOffsetY = o;
            return _chart;
        };

        /**
         #### .titleLabelOffsetx([x])
         Get of set the x offset (horizontal space between right edge of element and right edge or text.   Default x offset is 2px;

         **/
        _chart.titleLabelOffsetX = function ( o )
        {
            if( !arguments.length ) return _titleLabelOffsetX;
            _titleLabelOffsetX = o;
            return _chart;
        };

        function isSelectedElement( d )
        {
            return _chart.hasFilter( _chart.cappedKeyAccessor( d ) );
        }

        return _chart.anchor( parent, chartGroup );


        function calculateAxisScale()
        {
            if( !_x || _elasticX )
            {
                var extent = d3.extent( _elementData, _chart.cappedValueAccessor );
                if( extent[0] > 0 ) extent[0] = 0;
                _x = d3.scale.linear().domain( extent )
                        .range( [0, _chart.effectiveWidth()] );
            }
            _xAxis.scale( _x );
        }

        function drawAxis()
        {
            var axisG = _g.select( "g.axis" );

            calculateAxisScale();

            if( axisG.empty() )
                axisG = _g.append( "g" ).attr( "class", "axis" )
                        .attr( "transform", "translate(0, " + _chart.effectiveHeight() + ")" );

            dc.transition( axisG, _chart.transitionDuration() )
                    .call( _xAxis );
        }

        function drawGridLines()
        {
            _g.selectAll( "g.tick" )
                    .select( "line.grid-line" )
                    .remove();

            _g.selectAll( "g.tick" )
                    .append( "line" )
                    .attr( "class", "grid-line" )
                    .attr( "x1", 0 )
                    .attr( "y1", 0 )
                    .attr( "x2", 0 )
                    .attr( "y2", function ()
            {
                return -_chart.effectiveHeight();
            } );
        }


    };
    return dc_lsce;
})
        ();
