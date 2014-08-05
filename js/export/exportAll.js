/**
 * @optional sourceDivId : source div used to get the styles
 * @optional listStyleToGet : list of styles to keep in the export elements
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

            // Transform all svg into canvas
            canvg(null, null, null, element[0].id);

            html2canvas($(element), {
                onrendered: function(canvas) {
//                    document.body.appendChild(canvas);
//                    var img = canvas.toDataURL("image/png");
//                    window.open(img);
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