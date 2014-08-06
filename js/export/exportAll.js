/**
 * @optional sourceDivId : source div used to get the styles (sourceDiv and targetDiv MUST HAVE the same childrens)
 * @optional listStyleToGet : list of styles to keep in the export elements
 * @optional callbackBeforeCanvg : function to call before the transformation of all svg elements to canvas
 * @optional callbackOnRendered : function to call before the window.open
 */
(function($){
    $.fn.extend({
        exportAll: function(options) {
            var defaults = {
                consoleLog:'false'
            };

            options = $.extend(defaults, options);
            var element = this;

            // Copy styles from source to export
            if(options.sourceDivId)
                copySelectedCss($("#"+options.sourceDivId), element, options.listStyleToGet);

            if(options.callbackBeforeCanvg)
                options.callbackBeforeCanvg.name(options.callbackBeforeCanvg.arguments);

            // Transform all svg into canvas
            canvg(null, null, null, element[0].id);

            html2canvas($(element), {
                onrendered: function(canvas) {
//                    document.body.appendChild(canvas);
//                    var base64data = "base64," + $.base64.encode(tdData);
//                    $( defaults.element ).attr( "href", "data:application/"+defaults.type+";" + base64data );
//                    $( defaults.element ).attr( "download", "exportData." + defaults.type );

                    if(options.callbackOnRendered)
                        options.callbackOnRendered.name(options.callbackOnRendered.arguments);

                    var img = canvas.toDataURL("image/png");
                    window.open(img);
                }
            });
        }
    });

    /**
     * This method copy some wanted styles from one div to another one
     * @param @mandatory sourceDiv : the source div
     * @param @mandatory targetDivId : the target div to copy the styles
     * @param listStyleToGet : array of wanted styles
     */
    function copySelectedCss(sourceDiv, targetDiv, listStyleToGet)
    {
        var sourceChildren = sourceDiv.children();
        $.each(targetDiv.children(), function(i,d)
        {
            var styles = $(sourceChildren[i]).getStyleObject(listStyleToGet);
            if(styles)
                $(d).css(styles);
            copySelectedCss($(sourceChildren[i]), $(d), listStyleToGet);
        });
    }
})(jQuery);