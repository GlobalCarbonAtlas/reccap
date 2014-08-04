(function($){
    $.fn.extend({
        exportAll: function(options) {
            var defaults = {
                separator: ',',
                ignoreColumn: [],
                tableName:'yourTableName',
                type:'csv',
                pdfFontSize:14,
                pdfLeftMargin:20,
                escape:'true',
                htmlContent:'false',
                consoleLog:'false'
            };

//            var options = $.extend(defaults, options);
            var element = this;

            // Transform all svg into canvas
            canvg(null, null, null, "exportDiv");

            html2canvas($(element), {
                onrendered: function(canvas) {
                    document.body.appendChild(canvas);
//                    var img = canvas.toDataURL("image/png");
//                    window.open(img);
                }
            });
//            html2canvas($(element), {
//                onrendered: function(canvas) {
//                    var img = canvas.toDataURL("image/png");
//                    window.open(img);
//                }
//            });

        }
    });
})(jQuery);