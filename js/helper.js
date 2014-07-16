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
        if( cssFile && !styleSheet.href.contains( cssFile ) )
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

