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
        <div id="uncertaintyDiv" type="button" class="labelI18n" data-i18n="[title]tooltip.uncertainty">
            <img src="img/uncertainty3.png" width="27px"/>

            <div id="uncertaintyText" class="labelI18n" data-i18n="button.uncertaintyDisplay"></div>
        </div>
    </div>

    <div class="titleDiv">
        <div class="title">
            <span class="bigTitle">RE</span>gional <span class="bigTitle">C</span>arbon <span class="bigTitle">C</span>ycle <span class="bigTitle">A</span>ssessment
            and <span class="bigTitle">P</span>rocesses
        </div>
    </div>
</div>

<div id="containerCharts" class="container-fluid">
    <!-- ********************* LEFT COL : MAP & FUNCTION ********************* -->
    <div id="leftCol">
        <div class="basicCell">
            <div id="mapChartAndComment">
                <div id="mapChartAndRegionSelect">
                    <div id="mapChart"></div>
                    <div id="regionSelect">
                        <div id="globeActive" class="toolButton labelI18n" data-i18n="[title]tooltip.regionAll"><img src="img/Globe_Connected.png" width="35px"/></div>
                        <div id="regionUnActive" class="toolButton labelI18n" data-i18n="[title]tooltip.regionOne"><img src="img/Globe_Disconnected.png" width="35px"/></div>
                        <div id="regionActive" class="toolButton labelI18n" data-i18n="[title]tooltip.regionMultiple"><img src="img/Globe_RegionConnected.png" width="35px"/>
                        </div>
                        <div id="regionSelectComment" class="labelI18n" data-i18n="button.region"></div>
                    </div>
                </div>

                <div class="comment labelI18n" data-i18n="label.clickRegion"></div>
                <div id="resetMap" class="labelI18n" data-i18n="[title]tooltip.resetMap;button.reset"></div>
            </div>
        </div>

        <div class="bottomBasicCell">
            <div class="barChartUnit labelI18n" data-i18n="label.unit"></div>
            <div id="fluxBarChartTitle" class="barChartTitle labelI18n">&nbsp;</div>
            <div id="fluxBarChart">
                <div id="fluxBarChartForMainFlux"></div>
                <div id="fluxBarChartForSeparatedFlux"></div>
            </div>
        </div>
    </div>

    <!-- ********************* RIGHT COL : FLUX & BARCHART ********************* -->
    <div id="rightCol">
        <div class="basicCell">
            <div id="imageFluxCell">
                <img id="imageFlux" src="img/land_cycle_pcv6PC1.svg" usemap="#mapForImageFlux" alt="Image for flux"/>
                <map id="mapForImageFlux" name="mapForImageFlux">
                    <area shape="rect" alt="WPD" title="" coords="125,59,180,110" href="" target=""/>
                    <area shape="rect" alt="CPC" title="" coords="185,59,261,110" href="" target=""/>
                    <area shape="rect" alt="LUC" title="" coords="266,59,313,110" href="" target=""/>
                    <area shape="rect" alt="Fires" title="" coords="323,59,363,110" href="" target=""/>
                    <area shape="rect" alt="NPP" title="" coords="382,59,415,110" href="" target=""/>
                    <area shape="rect" alt="HR" title="" coords="432,59,515,110" href="" target=""/>
                    <area shape="rect" alt="FO" title="" coords="543,59,615,110" href="" target=""/>
                    <area shape="rect" alt="FFE" title="" coords="50,13,117,48" href="" target=""/>
                    <area shape="rect" alt="NEE" title="" coords="356,17,390,35" href="" target=""/>
                    <area shape="rect" alt="CE" title="" coords="0,248,88,284" href="" target=""/>
                    <area shape="rect" alt="WE" title="" coords="0,322,88,356" href="" target=""/>
                    <area shape="rect" alt="SCE" title="" coords="465,262,508,297" href="" target=""/>
                    <area shape="rect" alt="ETO" title="" coords="650,262,710,299" href="" target=""/>
                    <area shape="rect" alt="C" title="" coords="386,364,410,383" href="" target=""/>
                    <!-- Created by Online Image Map Editor (http://www.maschek.hu/imagemap/imgmap) -->
                </map>

                <div id="dynamicAreasForImageFlux"></div>
                <div id="synthesis" class="toolButton labelI18n" data-i18n="[title]tooltip.synthesis">
                    <img src="img/FluxEmptyWB_small.png" width="30px"/>

                    <div id="synthesisComment" class="labelI18n" data-i18n="button.synthesis"></div>
                </div>

                <div class="comment labelI18n" data-i18n="label.clickFlux"></div>
                <div id="resetFlux" class="labelI18n" data-i18n="[title]tooltip.resetFlux;button.reset"></div>
            </div>
        </div>

        <div class="bottomBasicCell">
            <div class="barChartUnit labelI18n" data-i18n="label.unit"></div>
            <div class="barChartTitle">&nbsp;</div>
            <div id="regionBarChart">
                <div id="regionBarChartForMainFlux"></div>
                <div id="regionBarChartForSeparatedFlux"></div>
            </div>
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
            <img id="imageFluxForSynthesis" src="img/land_cycle_pcv6PC1.svg" usemap="#mapForImageFluxForSynthesis" alt="Synthesis for flux"/>
            <map id="mapForImageFluxForSynthesis" name="mapForImageFluxForSynthesis">
                <area shape="rect" alt="NEEValue" coords="387,23,407,42" href="" target="" isRed/>
                <area shape="rect" alt="FFEValue" coords="45,150,65,170" href="" target="" isRed/>
                <area shape="rect" alt="WPDValue" coords="115,150,135,170" href="" target="" isRed/>
                <area shape="rect" alt="CPCValue" coords="183,150,203,170" href="" target="" isRed/>
                <area shape="rect" alt="LUCValue" coords="262,150,282,170" href="" target="" isRed/>
                <area shape="rect" alt="FiresValue" coords="310,135,330,155" href="" target="" isRed/>
                <area shape="rect" alt="NPPValue" coords="387,135,407,155" href="" target=""/>
                <area shape="rect" alt="HRValue" coords="425,150,445,170" href="" target=""/>
                <area shape="rect" alt="FOValue" coords="585,150,605,170" href="" target=""/>
                <area shape="rect" alt="CEValue" coords="90,263,110,285" href="" target=""/>
                <area shape="rect" alt="WEValue" coords="90,335,110,355" href="" target=""/>
                <area shape="rect" alt="CValue" coords="412,368,432,388" href="" target=""/>
                <area shape="rect" alt="SCEValue" coords="466,315,486,335" href="" target=""/>
                <area shape="rect" alt="ETOValue" coords="657,315,677,335" href="" target=""/>
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
