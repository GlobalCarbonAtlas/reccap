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
                <div id="regionAndUncertaintySelect">
                    <div id="globeActive" class="toolButton"><img src="img/Globe_Connected.png" width="35px" title="See all regions"/></div>
                    <div id="regionUnActive" class="toolButton"><img src="img/Globe_Disconnected.png" width="35px" title="See only one region"/></div>
                    <div id="regionActive" class="toolButton"><img src="img/Globe_RegionConnected.png" width="35px" title="See multiple regions"/></div>

                    <div id="uncertaintyDisable" class="toolButton"><img src="img/uncertainty_disable2.png" width="40px" title="Hide uncertainty"/></div>
                    <div id="uncertainty" class="toolButton"><img src="img/uncertainty2.png" width="40px" title="Display uncertainty"/></div>
                </div>

                <div id="mapChartAndComment">
                    <div id="mapChart"></div>
                    <div class="comment mapChartComment">Click on a region to show all component CO2 fluxes</div>
                </div>
            </div>

            <div class="bottomBasicCell">
                <div id="functionBarChartUnit">Tg C yr-1</div>
                <div id="functionBarChartTitle">All regions</div>
                <div id="functionBarChart">
                    <div id="functionBarChartForMainFlux"></div>
                    <div id="functionBarChartForSeparatedFlux"></div>
                </div>
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
                    <area shape="rect" alt="HR" coords="562,12,660,51" href="" target=""/>
                    <area shape="rect" alt="FO" coords="768,154,847,192" href="" target=""/>
                    <area shape="rect" alt="SCE" coords="633,271,714,293" href="" target=""/>
                    <area shape="rect" alt="ETO" coords="832,242,880,296" href="" target=""/>
                    <!-- Created by Online Image Map Editor (http://www.maschek.hu/imagemap/imgmap) -->
                </map>

                <div id="dynamicAreasForImageFlux"></div>
                <div class="comment">Select a flux name to show its values accross all regions</div>
            </div>

            <div class="row bottomBasicCell">
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

            <div class="row imageFluxForSynthesis">
                <img id="imageFluxForSynthesis" src="img/FluxEmpty2.png" usemap="#mapForImageFluxForSynthesis" alt="Synthesis for flux"/>
                <map id="mapForImageFluxForSynthesis" name="mapForImageFluxForSynthesis">
                    <area shape="rect" alt="FFEValue" coords="68,90,100,116" href="" target="" isRed/>
                    <area shape="rect" alt="WPDValue" coords="185,117,218,140" href="" target="" isRed/>
                    <area shape="rect" alt="CPCValue" coords="258,111,294,132" href="" target="" isRed/>
                    <area shape="rect" alt="LUCValue" coords="365,93,390,113" href="" target="" isRed/>
                    <area shape="rect" alt="FiresValue" coords="415,69,445,90" href="" target="" isRed/>
                    <area shape="rect" alt="NPPValue" coords="491,58,521,79" href="" target=""/>
                    <area shape="rect" alt="HRValue" coords="552,66,584,85" href="" target=""/>
                    <area shape="rect" alt="SCEValue" coords="666,295,706,314" href="" target=""/>
                    <area shape="rect" alt="FOValue" coords="780,207,806,228" href="" target=""/>
                    <area shape="rect" alt="ETOValue" coords="849,308,876,324" href="" target=""/>
                    <!-- Created by Online Image Map Editor (http://www.maschek.hu/imagemap/imgmap) -->
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
