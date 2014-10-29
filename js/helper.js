// http://thoai-nguyen.blogspot.fr/2011/02/jquery-execute-callback-base-on.html
$.waitUntil = function ( delegate, action, timeOutObj )
{
    function _waitUntil( params )
    {
        $.waitUntil( params.condition, params.action, params.timeOutObj );
    }

    if( delegate.apply() )
        action.apply();
    else
    {
        if( null != timeOutObj )
            clearTimeout( timeOutObj );
        var param = { condition: delegate, action: action };
        param.timeOutObj = setTimeout( _waitUntil, 100, param );
    }
};


/**
 * This method find the value "valueToFind" in the object's array "array" with the parameter "parameter" and returns its index.
 * @param array
 * @param parameter
 * @param valueToFind
 */
function getIndexInArray( array, parameter, valueToFind )
{
    var result = -1;
    $.each( array, function( i, d )
    {
        if( d[parameter] == valueToFind )
        {
            result = i;
            return false;
        }
    } );
    return result;
}


// **************************************************************
// ************************* BROWSER ****************************
// **************************************************************
function getUserAgengt()
{
    return navigator.userAgent.toLowerCase();
}

function testBrowser()
{
    var userAgent = getUserAgengt();
    var isChrome = /chrome/.test( userAgent );
    var isFirefox = /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent );
    var isSafari = /safari/.test( userAgent );
    if( !isChrome && !isFirefox && !isSafari )
        alert( "This application was created for Google Chrome, Mozilla Firefox and Safari. If you use another browser some operations may not be working !" );
}


// **************************************************************
// ************************ TEXT WIDTH **************************
// **************************************************************
/**
 * This function returns the width in pixel of a text (different to the text's length), in the given css style
 * @param text : mandatory
 * @param cssStyle : mandatory
 * @param cssFile : optional
 */
function getTextWidth( text, cssStyle, cssFile )
{
    var timeForId = new Date().getTime();
    var divTextToGetWidthId = "divToGetWidth_" + timeForId;
    $( "#" + divTextToGetWidthId ).remove();
    var fontSize = getStyleSheetsPropertyValue( cssStyle, "fontSize", cssFile );
    var fontWeight = getStyleSheetsPropertyValue( cssStyle, "fontWeight", cssFile );
    var fontFamily = getStyleSheetsPropertyValue( cssStyle, "fontFamily", cssFile );
    var divTextToGetWidth = $( "<span id='" + divTextToGetWidthId + "' style='visibility:hidden; font-size:" + fontSize + ";font-weight:" + fontWeight + ";font-family:" + fontFamily + "'>" + text + "</span>" );
    $( "body" ).append( divTextToGetWidth );
    var textWidth = divTextToGetWidth.width();
    $( "#" + divTextToGetWidthId ).remove();
    return textWidth;
}

/**
 * This method looks for the css file only in the css file (if given), otherwise in all loaded css files
 * @param selectorText
 * @param propertyName
 */
function getStyleSheetsPropertyValue( selectorText, propertyName, cssFile )
{
    var defaultStyle = false;
    var realStyle = false;
    // search backwards because the last match is more likely the right one
    $.each( document.styleSheets, function( i, styleSheet )
    {
        if( !styleSheet || !styleSheet.href || (cssFile && styleSheet.href.indexOf( cssFile ) == -1) )
            return;

        var cssRules = styleSheet.cssRules || styleSheet.rules || []; // IE support

        $.each( cssRules, function( ii, cssRule )
        {
            if( "body" == cssRule.selectorText )
                defaultStyle = cssRule.style[propertyName];
            if( cssRule.selectorText === selectorText )
            {
                realStyle = cssRule.style[propertyName];
                return false;
            }
        } );
    } );
    return realStyle ? realStyle : defaultStyle;
}


// **************************************************************
// ************************* EXPORT *****************************
// **************************************************************
//http://stackoverflow.com/questions/754607/can-jquery-get-all-css-styles-associated-with-an-element
/*
 * getStyleObject Plugin for jQuery JavaScript Library
 * From: http://upshots.org/?p=112
 */
(function( $ )
{
    $.fn.getStyleObject = function( listStyleToGet )
    {
        var dom = this.get( 0 );
        if( !dom )
            return;
        var style;
        var returns = {};
        if( window.getComputedStyle )
        {
            var camelize = function( a, b )
            {
                return b.toUpperCase();
            };
            style = window.getComputedStyle( dom, null );
            for( var i = 0, l = style.length; i < l; i++ )
            {
                var prop = style[i];
                if( !listStyleToGet || listStyleToGet.indexOf( prop ) != -1 )
                {
                    var camel = prop.replace( /\-([a-z])/g, camelize );
                    returns[camel] = style.getPropertyValue( prop );
                }
            }
            ;
            return returns;
        }
        ;
        if( style = dom.currentStyle )
        {
            for( var prop in style )
            {
                returns[prop] = style[prop];
            }
            ;
            return returns;
        }
        ;
        return this.css();
    }
})( jQuery );


// **************************************************************
// ************************* COLOR ******************************
// **************************************************************
/**
 * http://www.sitepoint.com/javascript-generate-lighter-darker-color/
 * Warning : colors must be in hexadecimal, color's names are not working !
 */
function ColorLuminance( hex, lum )
{

    // validate hex string
    hex = String( hex ).replace( /[^0-9a-f]/gi, '' );
    if( hex.length < 6 )
    {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    var rgb = "#", c, i;
    for( i = 0; i < 3; i++ )
    {
        c = parseInt( hex.substr( i * 2, 2 ), 16 );
        c = Math.round( Math.min( Math.max( 0, c + (c * lum) ), 255 ) ).toString( 16 );
        rgb += ("00" + c).substr( c.length );
    }

    return rgb;
}

// **************************************************************
// ********************** MAP / ARRAY ***************************
// **************************************************************
function getMaxValueInArrayMap( arrayMap )
{
    var values = $.map( arrayMap, function( value, key )
    {
        return value;
    } );
    return Math.max.apply( Math, values );

}
