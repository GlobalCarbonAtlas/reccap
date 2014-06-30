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
    <link rel="stylesheet" type="text/css" href="css/RCInterface_white_slides.css">


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

<div id="pageWrapper">

    <div class="container-fluid">

        <div class="row">

            <div class="col-md-8">
                <div class="row">
                    <div class="col-md-7 title"><span class="bigTitle">RE</span>gional <span class="bigTitle">C</span>arbon <span class="bigTitle">C</span>ycle <span
                            class="bigTitle">A</span>ssessment and <span class="bigTitle">P</span>rocesses&nbsp;&nbsp;&nbsp;&nbsp;</div>
                </div>

                <div class="row">
                    <div class="tools col-md-1">
                        <div id="reset" class="toolButton"><img src="img/reset-icon-614x460.png" width="50px" title="Reset all"/></div>
                        <div id="export" class="toolButton"><img src="img/export_small.png" title="Export"/></div>
                        <div id="help" class="toolButton"><img src="img/help.png" width="30px" title="Help"/></div>
                        <div id="regionActive" class="toolButton"><img src="img/Globe_Connected.png" width="30px" title="Allow multiple selection for regions"/></div>
                        <div id="regionUnActive" class="toolButton"><img src="img/Globe_Disconnected.png" width="30px" title="Only one selected region"/></div>
                    </div>
                    <div class="col-md-7">
                        <div id="map-chart"></div>
                        <div>Click on one region to get the functions</div>
                    </div>
                </div>
            </div>

            <div class="function">
                <div id="function-chart"></div>
            </div>
        </div>


        <div class="row">
            <div class="col-md-8">

                <div>
                    <img id="imageFlux" src="img/FluxEmptyWB.png" usemap="#mapForImageFlux" alt="Image for flux"/>
                    <map id="mapForImageFlux" name="mapForImageFlux">
                        <!--                    <area shape="rect" alt="FossilFuel" title="Fossil Fuel" coords="344,56,423,90"/>-->
                        <!--                    <area shape="rect" alt="Crop + Wood products use" title="Crop + Wood products use" coords="434,54,530,91"/>-->
                        <area shape="rect" href="#" alt="Land use change" title="Land use change" coords="538,49,611,93">
                        <area shape="rect" href="#" alt="Fire" title="Fires" coords="628,65,667,92"/>
                        <!--                    <area shape="rect" alt="Natural Fires" title="Natural Fires" coords="750,51,802,91"/>-->
                        <area shape="rect" href="#" alt="Heterotrophic Respiration" title="Heterotrophic Respiration" coords="831,49,920,92"/>
                        <!--                    <area shape="rect" alt="Land sink" title="Land sink" coords="929,56,990,76"/>-->
                        <area shape="rect" href="#" alt="GPP" title="Gross primary production" coords="1020,14,1111,54"/>
                        <!--                    <area shape="rect" alt="Plant" title="Plant" coords="761,228,836,279"/>-->
                        <!--                    <area shape="rect" alt="Soils" title="Soils" coords="705,290,794,340"/>-->
                        <!--                    <area shape="rect" alt="Wood product storage" title="Wood product storage" coords="516,270,565,328"/>-->
                        <!--                    <area shape="rect" alt="FrozenSoils" title="FrozenSoils" coords="5,263,124,291"/>-->
                        <!--                    <area shape="rect" alt="Wetland soils" title="Wetland soils" coords="128,289,243,312"/>-->
                        <!--                    <area shape="rect" alt="Coal" title="Coal" coords="310,327,361,348"/>-->
                        <!--                    <area shape="rect" alt="Gas" title="Gas" coords="444,322,482,349"/>-->
                        <!--                    <area shape="rect" alt="Oil" title="Oil" coords="385,324,419,351"/>-->
                        <!--                    <area shape="rect" alt="Fossil fuel trade" title="Fossil fuel trade" coords="306,388,426,416"/>-->
                        <area shape="rect" href="#" alt="NPP" title="NPP" coords="989,129,1069,174"/>
                        <!--                    <area  shape="rect" alt="weathering" title="weathering" coords="974,216,1060,245"/>-->
                        <!--                    <area shape="rect"  alt="FreshwaterOutgassing" title="FreshwaterOutgassing" coords="1060,211,1146,240"/>-->
                        <!--                    <area shape="rect"  alt="SoilExport" title="SoilExport" coords="820,316,911,341"/>-->
                        <!--                    <area shape="rect"  alt="weathering2" title="weathering2" coords="765,371,847,396"/>-->
                        <!--                    <area shape="rect"  alt="FreshwaterEstuaryBurial" title="FreshwaterEstuaryBurial" coords="995,365,1069,414"/>-->
                        <area shape="rect" href="#" alt="RiverExportToOcean" title="exportToOcean" coords="1075,390,1142,421"/>
                    </map>
                    <div id="dynamicAreas"></div>
                </div>
                <div class="imageFluxTitle">Flux</div>
                <div class="imageFluxText">Click on a flux to display the bar chart</div>

            </div>

            <div class="col-md-4">
                <!--                <h3>Bar chart</h3>-->

                <div id="bar-chart"></div>

            </div>

        </div>
    </div>

</div>


<div id="slideButtonsAndDiv">
    <div id="hiddenDivSlide">&nbsp;</div>

    <div id="dataSlide" class="toolButton"><img src="img/Data.png" width="30px" title="Get all data"/></div>
    <div id="synthesisSlide" class="toolButton"><img src="img/FluxEmptyWB_small.png" width="30px" title="Display synthesis"/></div>
</div>

<div id="dataDiv">
    <div class="dataTitle">
        <div id="dataTitle">CARBON BUDGET(S)</div>
    </div>
    <div id="data-count" class="dc-data-count dc-chart">
        <span class="filter-count"></span> selected out of <span class="total-count"></span> records
    </div>
    <div id="exportData" class="toolButton toolsForData"><img src="img/export_small.png" title="Export"/></div>
    <BR/><BR/>

    <table id="data-table" class="table table-hover dc-data-table dc-chart">
        <thead>
        <tr class="header">
            <th>Carbon budget</th>
            <th>Value</th>
        </tr>
        </thead>
    </table>
</div>

<div id="synthesisDiv">
    <div class="synthesisTitle">
        <div id="synthesisTitle">SYNTHESIS</div>
    </div>
    <img id="imageFluxForSynthesis" src="img/Flux.png" width="1100px"/>
</div>

<script type="text/javascript">
    $( document ).ready( function ()
    {
        new RCInterface();
    } );

</script>


</BODY>
</HTML>


