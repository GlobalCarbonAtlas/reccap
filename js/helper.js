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

