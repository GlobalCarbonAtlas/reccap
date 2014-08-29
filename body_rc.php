<div id="sourceWrapper">
    <div id="pageWrapper">

        <!-- ********************* MENU & TITLE ********************* -->
        <div id="containerTools" class="container-fluid">
            <div class="leftTools btn-group">
                <div id="reset" class="labelI18n" data-i18n="[title]tooltip.resetAll">
                    <img src="img/reset.png" width="27px"/>

                    <div class="labelI18n" data-i18n="button.resetAll"></div>
                </div>
                <div id="export" class="labelI18n" data-toggle="dropdown" data-i18n="[title]tooltip.export">
                    <img src="img/export_small.png"/>

                    <div class="labelI18n" data-i18n="button.export"></div>
                </div>
                <ul class="dropdown-menu leftToolsExportMenu">
                    <li><a href="#" onClick="javascript:exportAll('exportDiv', 'png');">&nbsp;&nbsp;<img src='js/htmltable_export/icons/png.png' width='24px'> PNG</a></li>
                    <li><a href="#" onClick="javascript:exportAll('exportDiv', 'jpg');">&nbsp;<img src='js/htmltable_export/icons/jpg.png' width='24px'> JPG</a></li>
                    <li><a href="#" onClick="javascript:exportAll('exportDiv', 'gif');"><img src='js/htmltable_export/icons/gif.png' width='24px'> GIF</a></li>
                </ul>
                <div id="help" type="button" class="labelI18n" data-i18n="[title]tooltip.help">
                    <img src="img/help.png" width="27px"/>

                    <div class="labelI18n" data-i18n="button.help"></div>
                </div>
                <div id="data" type="button" class="labelI18n" data-i18n="[title]tooltip.data">
                    <img src="img/Data.png" width="27px"/>

                    <div class="labelI18n" data-i18n="button.data"></div>
                </div>
            </div>

            <div class="titleDiv">
                <div class="title">
                    <span class="bigTitle">RE</span>gional <span class="bigTitle">C</span>arbon <span class="bigTitle">C</span>ycle <span class="bigTitle">A</span>ssessment
                    and <span
                        class="bigTitle">P</span>rocesses
                </div>
            </div>
        </div>

        <div id="containerCharts" class="container-fluid">
            <!-- ********************* LEFT COL : MAP & FUNCTION ********************* -->
            <div id="leftCol">
                <div class="basicCell">
                    <div id="mapChartAndComment">
                        <div id="mapChart"></div>
                        <div id="regionSelect">
                            <div id="globeActive" class="toolButton labelI18n" data-i18n="[title]tooltip.regionAll"><img src="img/Globe_Connected.png" width="35px"/></div>
                            <div id="regionUnActive" class="toolButton labelI18n" data-i18n="[title]tooltip.regionOne"><img src="img/Globe_Disconnected.png" width="35px"/></div>
                            <div id="regionActive" class="toolButton labelI18n" data-i18n="[title]tooltip.regionMultiple"><img src="img/Globe_RegionConnected.png" width="35px"/>
                            </div>
                            <div id="regionSelectComment" class="labelI18n" data-i18n="button.region"></div>
                        </div>

                        <div class="comment labelI18n" data-i18n="label.clickRegion"></div>
                        <div id="resetMap" class="labelI18n" data-i18n="[title]tooltip.resetMap;button.reset"></div>
                    </div>
                </div>

                <div class="bottomBasicCell">
                    <div id="fluxBarChartUnit" class="labelI18n" data-i18n="label.unit"></div>
                    <div id="fluxBarChartTitle" class="labelI18n" data-i18n="[title]tooltip.allRegions;label.allRegions"></div>
                    <div id="fluxBarChart">
                        <div id="fluxBarChartForMainFlux"></div>
                        <div id="fluxBarChartForSeparatedFlux"></div>
                    </div>
                    <div id="uncertaintyDiv">
                        <div id="uncertaintyDisable" class="toolButton labelI18n" data-i18n="[title]tooltip.uncertaintyHide"><img src="img/uncertainty_disable2.png" width="40px"/>
                        </div>
                        <div id="uncertainty" class="toolButton labelI18n" data-i18n="[title]tooltip.uncertaintyDisplay"><img src="img/uncertainty2.png" width="40px"/></div>
                    </div>
                </div>
            </div>

            <!-- ********************* RIGHT COL : FLUX & BARCHART ********************* -->
            <div id="rightCol">
                <div class="basicCell imageFluxCell">
                    <img id="imageFlux" src="img/FluxWhite3.png" usemap="#mapForImageFlux" alt="Image for flux"/>
                    <map id="mapForImageFlux" name="mapForImageFlux">
                        <area shape="rect" alt="FFE" coords="-5,46,102,117" href="" target=""/>
                        <area shape="rect" alt="WPD" coords="124,46,200,117" href="" target=""/>
                        <area shape="rect" alt="CPC" coords="202,46,311,117" href="" target=""/>
                        <area shape="rect" alt="LUC" coords="316,46,401,117" href="" target=""/>
                        <area shape="rect" alt="Fires" coords="428,46,487,74" href="" target=""/>
                        <area shape="rect" alt="NPP" coords="512,46,568,75" href="" target=""/>
                        <area shape="rect" alt="HR" coords="581,46,709,98" href="" target=""/>
                        <area shape="rect" alt="FO" coords="785,46,896,98" href="" target=""/>
                        <area shape="rect" alt="SCE" coords="672,374,742,421" href="" target=""/>
                        <area shape="rect" alt="ETO" coords="893,334,967,405" href="" target=""/>
                        <!-- Created by Online Image Map Editor (http://www.maschek.hu/imagemap/imgmap) -->
                    </map>

                    <div id="dynamicAreasForImageFlux"></div>
                    <div id="synthesis" class="toolButton labelI18n" data-i18n="[title]tooltip.synthesis"><img src="img/FluxEmptyWB_small.png" width="30px"/></div>
                    <div class="comment labelI18n" data-i18n="label.clickFlux"></div>
                    <div id="resetFlux" class="labelI18n" data-i18n="[title]tooltip.resetFlux;button.reset"></div>
                </div>

                <div class="bottomBasicCell">
                    <div id="regionBarChart"></div>
                </div>

            </div>

        </div>

        <div id="hiddenDiv"></div>

        <!-- ****************** DATA TABLE AND EXPORT ****************** -->
        <div id="dataDiv">
            <div class="row dataTitleAndExport">
                <div class="dataTitle">
                    <div id="dataTitle" class="labelI18n" data-i18n="title.carbonBudgets"></div>
                </div>
                <div id="exportData" class="toolButton">
                    <button class="exportButton btn-link labelI18n" data-toggle="dropdown" data-i18n="[title]tooltip.exportData"><img src="img/export_small.png"/></button>
                    <ul class="exportMenu dropdown-menu">
                        <li><a href="#" onClick="$('#data-table').tableExport({type:'pdf',pdfFontSize:'10',escape:'false'});"> <img src='js/htmltable_export/icons/pdf.png'
                                                                                                                                    width='24px'> PDF</a></li>
                        <li><a onClick="$('#data-table').tableExport({type:'csv',escape:'false', element:this});"> <img src='js/htmltable_export/icons/csv.png' width='24px'>
                            CSV</a></li>
                        <li><a onClick="$('#data-table').tableExport({type:'txt',escape:'false', element:this});"> <img src='js/htmltable_export/icons/txt.png' width='24px'>
                            TXT</a></li>
                        <!--                        <li id="dataPNGExport" class="labelI18n" data-i18n="[title]tooltip.exportDataPNG"><a href="#" onClick="$('#data-table').tableExport({type:'png',escape:'true'});"> <img src='js/htmltable_export/icons/png.png' width='24px'> PNG</a></li>-->
                    </ul>
                </div>
            </div>

            <div class="row dataTableDiv">
                <div id="data-count" class="dc-data-count dc-chart">
                    <span class="filter-count"></span><span class="labelI18n" data-i18n="label.dataNumber"></span><span class="total-count"></span><span class="labelI18n"
                                                                                                                                                         data-i18n="label.dataRecords"></span>
                </div>

                <table id="data-table" class="table table-hover dc-data-table dc-chart">
                    <thead>
                    <tr class="header">
                        <th><span class="labelI18n" data-i18n="label.carbonBudget"></span></th>
                        <th><span class="labelI18n" data-i18n="label.value"></span></th>
                    </tr>
                    </thead>
                </table>
            </div>
        </div>

        <!-- ****************** SYNTHESIS IMAGE AND EXPORT ****************** -->
        <div class="synthesisDiv">
            <div id="synthesisDiv">
                <div class="row synthesisTitleAndExport">
                    <div class="synthesisTitle">
                        <div id="synthesisTitle" class="labelI18n" data-i18n="title.synthesis"></div>
                    </div>
                    <div id="exportSynthesis" class="toolButton">
                        <button class="exportButton btn-link labelI18n" data-toggle="dropdown" data-i18n="[title]tooltip.export"><img src="img/export_small.png"/></button>
                        <ul class="exportMenu dropdown-menu">
                            <li><a href="#" onClick="javascript:exportSynthesis('synthesisDivData', 'png');"><img src='js/htmltable_export/icons/png.png' width='24px'> PNG</a></li>
                            <li><a href="#" onClick="javascript:exportSynthesis('synthesisDivData', 'jpg');"><img src='js/htmltable_export/icons/jpg.png' width='24px'> JPG</a></li>
                            <li><a href="#" onClick="javascript:exportSynthesis('synthesisDivData', 'gif');"><img src='js/htmltable_export/icons/gif.png' width='24px'> GIF</a></li>
                        </ul>
                    </div>
                </div>

                <div id="synthesisDivData" class="row imageFluxForSynthesis">
                    <div id="imageFluxForSynthesisTitle" class="labelI18n" data-i18n="label.allRegions"></div>
                    <img id="imageFluxForSynthesis" src="img/FluxWhite3.png" usemap="#mapForImageFluxForSynthesis" alt="Synthesis for flux"/>
                    <map id="mapForImageFluxForSynthesis" name="mapForImageFluxForSynthesis">
                        <area shape="rect" alt="FFEValue" coords="43,170,103,195" href="" target="" isRed/>
                        <area shape="rect" alt="WPDValue" coords="165,170,225,195" href="" target="" isRed/>
                        <area shape="rect" alt="CPCValue" coords="265,170,325,195" href="" target="" isRed/>
                        <area shape="rect" alt="LUCValue" coords="390,155,450,180" href="" target="" isRed/>
                        <area shape="rect" alt="FiresValue" coords="463,135,523,160" href="" target="" isRed/>
                        <area shape="rect" alt="NPPValue" coords="530,187,590,212" href="" target=""/>
                        <area shape="rect" alt="HRValue" coords="610,135,670,160" href="" target=""/>
                        <area shape="rect" alt="FOValue" coords="850,187,910,212" href="" target=""/>
                        <area shape="rect" alt="SCEValue" coords="675,420,735,445" href="" target=""/>
                        <area shape="rect" alt="ETOValue" coords="900,420,960,445" href="" target=""/>
                        <!-- Created by Online Image Map Editor (http://www.maschek.hu/imagemap/imgmap) -->
                    </map>

                    <div id="dynamicAreasForImageFluxForSynthesis"></div>
                </div>
            </div>
        </div>

    </div>

</div>

<div id="exportDiv"></div>

<script type="text/javascript">
    $( document ).ready( function ()
    {
        // Load properties file
        jQuery.i18n.properties( {
            name:'reccap',
            path:'',
            language:null,
            mode:'both'
        } );

        testBrowser();

        // Load translations : lang=en
        // http://i18next.com/pages/doc_init.html
        i18n.init( {
//            lng: 'en',
            resGetPath: 'locales/__ns__-__lng__.json',
            detectLngQS: 'lang',
            fallbackLng: ['en'],
            debug: true,
            lng:"en"
        }, function()
        {
            $( ".labelI18n" ).i18n();

            var myrequest = new ajaxRequest();
            myrequest.onreadystatechange = function()
            {
                if( myrequest.readyState == 4 )
                { //if request has completed
                    if( myrequest.status == 200 || window.location.href.indexOf( "http" ) == -1 )
                    {
                        var cssLink = $( "<link rel='stylesheet' type='text/css' href='css/RCInterface_white_" + i18n.options.lng + ".css'>" );
                        $( "head" ).append( cssLink );
                    }
                    else
                        alert( "not ok" ); // FOUND!

                }
            };

//            myrequest.open( 'GET', "css/RCInterface_white_" + i18n.options.lng + ".css", true );
            myrequest.open( 'GET', "http://localhost/reccap/css/RCInterface_white.css", true );


//            $.ajax( {
//                url:"css/RCInterface_white_" + i18n.options.lng + ".css",
//                type:'GET',
//                error: function()
//                {
//                    console.log( "no" );
//                    //file not exists
//                },
//                success: function()
//                {
//                    console.log( "ok" );
//                    //file exists
//                }
//            } );
            // Load css for each languages if exist
//            $.get( "css/RCInterface_white_" + i18n.options.lng + ".css" )
//                    .done(
//                    function()
//                    {
//                        console.log( "Css file loaded : RCInterface_white_" + i18n.options.lng + ".css" );
//                        var cssLink = $( "<link rel='stylesheet' type='text/css' href='css/RCInterface_white_" + i18n.options.lng + ".css'>" );
//                        $( "head" ).append( cssLink );
//                    } ).fail( function()
//            {
//                console.log( "No found css file : RCInterface_white_" + i18n.options.lng + ".css" );
//            } );

            new RCInterface();
        } );

    } );

    function ajaxRequest()
    {
        var activexmodes = ["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
        //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
        if( window.ActiveXObject )
        {
            for( var i = 0; i < activexmodes.length; i++ )
            {
                try
                {
                    return new ActiveXObject( activexmodes[i] )
                }
                catch( e )
                {
                    //suppress error
                }
            }
        }
        else if( window.XMLHttpRequest ) // if Mozilla, Safari etc
            return new XMLHttpRequest();
        else
            return false
    }
</script>
