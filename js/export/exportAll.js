(function($){
    $.fn.extend({
        exportAll: function(options) {
            var defaults = {
                consoleLog:'false'
            };

            options = $.extend(defaults, options);
            var element = this;

//            var styles = css($(".imageFluxDiv"));
//            var styles = $("#mapChart").getStyleObject();
//            $("#exportDiv #mapChart").copyCSS("#mapChart");

//            loadCss($("#exportDiv #mapChart"), $("#sourceWrapper #mapChart"));

            copySelectedCss($("#sourceWrapper #functionBarChartForMainFlux"), $("#exportDiv #functionBarChartForMainFlux"), options.listStyleToGet);


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
    function copySelectedCss(sourceDiv, targetDivId, listStyleToGet)
    {
        var targetChildren = targetDivId.children();
        $.each(sourceDiv.children(), function(i,d)
        {
            var styles = $(d).getStyleObject(listStyleToGet);
            $(targetChildren[i]).css(styles);
            copySelectedCss($(d), $(targetChildren[i]), listStyleToGet);
        });
    }
})(jQuery);