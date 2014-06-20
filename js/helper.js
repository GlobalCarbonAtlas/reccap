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