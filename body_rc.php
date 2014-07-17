<div id="pageWrapper">

    <!-- ********************* MENU & TITLE ********************* -->
    <div class="container-fluid">
        <div class="leftTools ">
            <div id="reset" class="toolButton"><img src="img/reset-icon-614x460.png" width="50px" title="Reset all"/></div>
            <div id="export" class="toolButton"><img src="img/export_small.png" title="Export"/></div>
            <div id="help" class="toolButton"><img src="img/help.png" width="30px" title="Help"/></div>
        </div>

        <div class="rightTools ">
            <div id="data" class="toolButton"><img src="img/Data.png" width="30px" title="Get all data"/></div>
            <div id="synthesis" class="toolButton"><img src="img/FluxEmptyWB_small.png" width="30px" title="Display synthesis"/></div>
        </div>
    </div>

    <div class="container-fluid">
        <div class="title">
            <span class="bigTitle">RE</span>gional <span class="bigTitle">C</span>arbon <span class="bigTitle">C</span>ycle <span class="bigTitle">A</span>ssessment and <span
                class="bigTitle">P</span>rocesses
        </div>
    </div>


    <div class="container-fluid">
        <!-- ********************* MAP & FUNCTION ********************* -->
        <div class="col-md-6">
            <div class="row basicCell">
                <div id="regionSelect">
                    <div id="globeActive" class="toolButton"><img src="img/Globe_Connected.png" width="35px" title="See all regions"/></div>
                    <div id="regionUnActive" class="toolButton"><img src="img/Globe_Disconnected.png" width="35px" title="See only one region"/></div>
                    <div id="regionActive" class="toolButton"><img src="img/Globe_RegionConnected.png" width="35px" title="See multiple regions"/></div>
                </div>

                <div id="mapChartAndComment">
                    <div id="mapChart"></div>
                    <div class="comment mapChartComment">Click on a region to show all component CO2 fluxes</div>
                </div>
            </div>

            <div class="row basicCell">
                <div id="functionBarChart"></div>
                <div id="resetFunctionBarChart">Reset selection</div>
            </div>
        </div>

        <!-- ********************* FLUX & BARCHART ********************* -->
        <div class="col-md-6">
            <div class="row basicCell">
                <img id="imageFlux" src="img/FluxEmpty2.png" usemap="#mapForImageFlux" alt="Image for flux"/>
                <map id="mapForImageFlux" name="mapForImageFlux">
                    <area shape="rect" alt="FFE" coords="69,7,155,55" href="" target=""/>
                    <area shape="rect" alt="WPD" coords="156,48,258,88" href="" target=""/>
                    <area shape="rect" alt="CPC" coords="258,45,357,84" href="" target=""/>
                    <area shape="rect" alt="LUC" coords="332,12,403,47" href="" target=""/>
                    <area shape="rect" alt="Fires" coords="406,10,453,36" href="" target=""/>
                    <area shape="rect" alt="NPP" coords="502,13,544,36" href="" target=""/>
                    <area shape="rect" alt="HR" coords="562,13,660,52" href="" target=""/>
                    <area shape="rect" alt="FO" coords="768,154,847,192" href="" target=""/>
                    <area shape="rect" alt="SCE" coords="633,271,714,293" href="" target=""/>
                    <area shape="rect" alt="ETO" coords="832,242,880,296" href="" target=""/>
                </map>

                <div id="dynamicAreasForImageFlux"></div>
                <div class="comment">Select a flux name to show its values accross all regions</div>
            </div>

            <div class="row">
                <div id="groupedBarChart"></div>
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
                    <li><a href="#" onClick="$('#data-table').tableExport({type:'pdf',pdfFontSize:'10',escape:'false'});"> <img src='js/htmltable_export/icons/pdf.png'
                                                                                                                                width='24px'>
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
    <div class="synthesisDiv">
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
    </div>

    <canvas id="svg-canvas" hidden="hidden"></canvas>
</div>


<script type="text/javascript">
    $( document ).ready( function ()
    {
        // Load properties file
        jQuery.i18n.properties( {
            name:'flux',
            path:'',
            language:null,
            mode:'both'
        } );

        testBrowser();

        new RCInterface();
    } );

</script>
