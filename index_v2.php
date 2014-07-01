<HTML>

<!--
 ##########################################################################
 Vanessa.Maigne@lsce.ipsl.fr    for Global Carbon Atlas
 PLEASE DO NOT COPY OR DISTRIBUTE WITHOUT PERMISSION
 ##########################################################################
-->

<HEAD>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>GCA Reccap</title>
    <link rel="icon" href="img/globe.png" type="image/png">

    <!-- ************************* CSS ************************* -->
    <link rel="stylesheet" type="text/css" href="css/bootstrap-3.1.1-dist/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="js/dc.js-master/web/css/dc.css">
    <link rel="stylesheet" type="text/css" href="css/RCInterface_white_v2.css">


    <!-- ************************* JS ************************* -->
    <script type="text/javascript" src="js/library/jquery-1.9.1.js"></script>
    <script type="text/javascript" src="js/jquery-ui-1.10.4.custom/js/jquery-ui-1.10.4.custom.min.js"></script>
    <script type="text/javascript" src="js/bootstrap-3.1.1-dist/js/bootstrap.js"></script>

    <script type="text/javascript" src="js/dc.js-master/web/js/d3.js"></script>
    <script type="text/javascript" src="js/dc.js-master/web/js/crossfilter.js"></script>
    <script type="text/javascript" src="js/dc.js-master/web/js/dc.js"></script>
    <!-- Tooltips -->
    <script type="text/javascript" src="js/library/d3.tip.min.js"></script>

    <!--    ???-->
    <script type="text/javascript" src="js/library/topojson.v1.min.js"></script>

    <!-- Responsive image with map/area & style for area -->
    <script type="text/javascript" src="js/library/jquery.imagemapster.min.js"></script>

    <!-- Export table -->
    <script type="text/javascript" src="js/htmltable_export/tableExport.js"></script>
    <script type="text/javascript" src="js/htmltable_export/jquery.base64.js"></script>
    <script type="text/javascript" src="js/htmltable_export/jspdf/libs/sprintf.js"></script>
    <script type="text/javascript" src="js/htmltable_export/jspdf/jspdf.js"></script>
    <script type="text/javascript" src="js/htmltable_export/jspdf/libs/base64.js"></script>

    <script type="text/javascript" src="js/helper.js"></script>
    <script type="text/javascript" src="js/library/jquery.class.js"></script>
    <script type="text/javascript" src="js/RCInterface.js"></script>

</HEAD>
<BODY>


<div id="pageWrapper" class="container-fluid row">

    <div class="col-md-4">
        <div class="row">
            <div id="map-chart"></div>
            <div class="mapText">Click on a region to get the functions</div>
        </div>

        <div class="row function">
            <div id="function-chart"></div>
        </div>
    </div>


    <div class="col-md-1">
        <div class="row tools">
            <div id="reset" class="toolButton"><img src="img/reset-icon-614x460.png" width="50px" title="Reset all"/></div>
            <div id="export" class="toolButton"><img src="img/export_small.png" title="Export"/></div>
            <div id="help" class="toolButton"><img src="img/help.png" width="30px" title="Help"/></div>
            <div id="regionActive" class="toolButton"><img src="img/Globe_Connected.png" width="30px" title="Allow multiple selection for regions"/></div>
            <div id="regionUnActive" class="toolButton"><img src="img/Globe_Disconnected.png" width="30px" title="Only one selected region"/></div>
            <div id="data" class="toolButton"><img src="img/Data.png" width="30px" title="Get all data"/></div>
            <div id="synthesis" class="toolButton"><img src="img/FluxEmptyWB_small.png" width="30px" title="Display synthesis"/></div>
        </div>
    </div>


    <div class="col-md-7">
        <div class="row title"><span class="bigTitle">RE</span>gional <span class="bigTitle">C</span>arbon <span class="bigTitle">C</span>ycle <span
                class="bigTitle">A</span>ssessment and <span class="bigTitle">P</span>rocesses&nbsp;&nbsp;&nbsp;&nbsp;</div>

        <div class="row">
            <div id="bar-chart"></div>
        </div>

        <div class="row">
            <div id="imageFluxDiv">
                <img id="imageFlux" src="img/FluxEmptyWB.png" usemap="#mapForImageFlux" alt="Image for flux"/>
                <map id="mapForImageFlux" name="mapForImageFlux">
                    <area shape="rect" href="#" alt="Land use change" title="Land use change" coords="538,49,611,93">
                    <area shape="rect" href="#" alt="Fire" title="Fires" coords="628,65,667,92"/>
                    <area shape="rect" href="#" alt="Heterotrophic Respiration" title="Heterotrophic Respiration" coords="831,49,920,92"/>
                    <area shape="rect" href="#" alt="GPP" title="Gross primary production" coords="1020,14,1111,54"/>
                    <area shape="rect" href="#" alt="NPP" title="NPP" coords="989,129,1069,174"/>
                    <area shape="rect" href="#" alt="RiverExportToOcean" title="exportToOcean" coords="1075,390,1142,421"/>
                </map>
                <div id="dynamicAreasForImageFlux"></div>
            </div>
            <div class="imageFluxTitle">Flux</div>
            <div class="imageFluxText">Click on a flux to display the bar chart</div>
        </div>
    </div>

</div>

<div id="hiddenDiv"></div>

<!-- ****************** DATA TABLE AND EXPORT ****************** -->
<div id="dataDiv">
    <div class="row dataTitleAndExport">
        <div class="dataTitle">
            <div id="dataTitle">CARBON BUDGETS</div>
        </div>
        <div id="exportData" class="toolButton">
            <button class="exportButton btn-link" data-toggle="dropdown"><img src="img/export_small.png" title="Export"/></button>
            <ul class="exportMenu dropdown-menu">
                <li><a href="#" onClick="$('#data-table').tableExport({type:'pdf',pdfFontSize:'10',escape:'false'});"> <img src='js/htmltable_export/icons/pdf.png' width='24px'>
                    PDF</a>
                </li>
                <li><a href="#" onClick="$('#data-table').tableExport({type:'csv',escape:'false'});"> <img src='js/htmltable_export/icons/csv.png' width='24px'> CSV</a></li>
                <li><a href="#" onClick="$('#data-table').tableExport({type:'txt',escape:'false'});"> <img src='js/htmltable_export/icons/txt.png' width='24px'> TXT</a></li>
            </ul>
        </div>
    </div>

    <div class="row dataTableDiv">
        <div id="data-count" class="dc-data-count dc-chart">
            <span class="filter-count"></span> selected out of <span class="total-count"></span> records
        </div>

        <table id="data-table" class="table table-hover dc-data-table dc-chart">
            <thead>
            <tr class="header">
                <th>Carbon budget</th>
                <th>Value</th>
            </tr>
            </thead>
        </table>
    </div>
</div>

<!-- ****************** SYNTHESIS IMAGE AND EXPORT ****************** -->
<div id="synthesisDiv">
    <div class="row synthesisTitleAndExport">
        <div class="synthesisTitle">
            <div id="synthesisTitle">SYNTHESIS</div>
        </div>
        <div id="exportSynthesis" class="toolButton">
            <button class="exportButton btn-link" data-toggle="dropdown"><img src="img/export_small.png" title="Export"/></button>
        </div>
    </div>
    <div class="row">
        <img id="imageFluxForSynthesis" src="img/FluxEmpty.png" usemap="#mapForImageFluxForSynthesis" alt="Synthesis for flux"/>
        <map id="mapForImageFluxForSynthesis" name="mapForImageFluxForSynthesis">
            <map id="imgmap2014623132018" name="imgmap2014623132018">
                <area shape="rect" alt="" title="" coords="405,252,434,273" href="" isRed/>
                <area shape="rect" alt="CropValue" title="" coords="503,248,537,268" href="" isRed/>
                <area shape="rect" alt="woodValue" title="" coords="525,285,562,314" href="" isRed/>
                <area shape="rect" alt="Fire_value" title="" coords="665,249,704,275" href="" isRed/>
                <area shape="rect" alt="Land use change_value" title="" coords="601,249,629,276" href="" isRed/>
                <area shape="rect" alt="Heterotrophic Respiration_value" title="" coords="834,252,858,274" href="" target=""/>
                <area shape="rect" alt="" title="" coords="785,255,817,273" href="" target=""/>
                <area shape="rect" alt="" title="" coords="861,252,906,275" href="" target=""/>
                <area shape="rect" alt="LandSinkValue" title="" coords="914,252,948,278" href="" target=""/>
                <area shape="rect" alt="NPP_value" title="" coords="972,251,1018,275" href="" target=""/>
                <area shape="rect" alt="weatheringValue" title="" coords="1011,345,1036,367" href="" target=""/>
                <area shape="rect" alt="" title="" coords="1105,368,1141,398" href="" target=""/>
                <area shape="rect" alt="" title="" coords="796,365,851,388" href="" target=""/>
                <area shape="rect" alt="" title="" coords="752,424,796,450" href="" target=""/>
                <area shape="rect" alt="" title="" coords="935,423,967,446" href="" target=""/>
                <area shape="rect" alt="weatheringValue" title="" coords="855,503,888,523" href="" target=""/>
                <area shape="rect" alt="freshwaterEstuaryValue" title="" coords="1077,495,1105,522" href="" target=""/>
                <area shape="rect" alt="exprotToOceanValue" title="" coords="1128,480,1159,505" href="" target=""/>
                <area shape="rect" alt="CoalValue" title="" coords="336,461,387,485" href="" target=""/>
                <area shape="rect" alt="OilValue" title="" coords="401,458,453,487" href="" target=""/>
                <area shape="rect" alt="GasValue" title="" coords="464,458,511,485" href="" target=""/>
                <area shape="rect" alt="FossiFuelTradeValue" title="" coords="462,498,516,525" href="" target=""/>
                <!-- Created by Online Image Map Editor (http://www.maschek.hu/imagemap/index) --></map>
        </map>
        <div id="dynamicAreasForImageFluxForSynthesis"></div>

    </div>
</div>

<canvas id="svg-canvas" hidden="hidden"></canvas>


<script type="text/javascript">
    $( document ).ready( function ()
    {
        new RCInterface();
    } );

</script>

</BODY>
</HTML>


