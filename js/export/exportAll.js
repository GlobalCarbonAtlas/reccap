(function($){
    $.fn.extend({
        exportAll: function(options) {
            var defaults = {
                consoleLog:'false'
            };

            options = $.extend(defaults, options);
            var element = this;

//            var sourceChildren = $("#"+options.sourceDivId).children();
//            $.each($("#"+options.targetDivId).children(), function(i,d)
//            {
//                copySelectedCss($(d), $("#exportDiv #functionBarChartForMainFlux"), options.listStyleToGet);
//            });

//            copySelectedCss($("#sourceWrapper"), $("#exportDiv"), options.listStyleToGet);

            copySelectedCss($("#sourceWrapper #functionBarChartForMainFlux"), $("#exportDiv #functionBarChartForMainFlux"), options.listStyleToGet);
            copySelectedCss($("#sourceWrapper #mapChart"), $("#exportDiv #mapChart"), options.listStyleToGet);
//

            // TODO : update dynamically css
//            $("#exportDiv #functionBarChart rect.deselected").css("fill","#CCCCCC");
//            $("#exportDiv path").css("fill","none");
//            $("#exportDiv path").css("stroke","black");
//            $("#exportDiv line").css("opacity","0.5").css("stroke","#CCCCCC");
//            $("#exportDiv .grid-line line").css("opacity","0.5").css("stroke","#CCCCCC");


            // Transform all svg into canvas
            canvg(null, null, null, "exportDiv");

//            html2canvas($(element), {
//                onrendered: function(canvas) {
//                    document.body.appendChild(canvas);
//                    var img = canvas.toDataURL("image/png");
//                    window.open(img);
//                }
//            });
//            html2canvas($(element), {
//                onrendered: function(canvas) {
//                    var img = canvas.toDataURL("image/png");
//                    window.open(img);
//                }
//            });

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
            $(d).css(styles);
            copySelectedCss($(sourceChildren[i]), $(d), listStyleToGet);
        });
    }
})(jQuery);