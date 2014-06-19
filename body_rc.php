<div id="pageWrapper">

    <div class="container-fluid">

        <div class="row">

            <div class="col-md-8">
                <div class="row title"><span class="bigTitle">RE</span>gional <span class="bigTitle">C</span>arbon <span class="bigTitle">C</span>ycle <span
                        class="bigTitle">A</span>ssessment and <span class="bigTitle">P</span>rocesses&nbsp;&nbsp;&nbsp;&nbsp;</div>

                <div class="row">
                    <div class="tools col-md-1">
                        <div id="reset" class="toolButton"><img src="img/reset-icon-614x460.png" width="50px" title="Reset all"/></div>
                        <div id="export" class="toolButton"><img src="img/export_small.png" title="Export"/></div>
                        <div id="regionActive" class="toolButton"><img src="img/Globe_Connected.png" width="30px" title="Allow multiple selection for regions"/></div>
                        <div id="regionUnActive" class="toolButton"><img src="img/Globe_Disconnected.png" width="30px" title="Only one selected region"/></div>
                        <div id="data" class="toolButton"><img src="img/Data.png" width="30px" title="Get all data"/></div>
                        <div id="synthesis" class="toolButton"><img src="img/FluxEmptyWB_small.png" width="30px" title="Display synthesis"/></div>
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
                    <img id="imageFlux" src="img/FluxEmptyWB.png" usemap="#mapFlux" alt="Image for flux"/>
                    <map id="mapFlux" name="mapFlux">
                        <!--                    <area shape="rect" alt="FossilFuel" title="Fossil Fuel" coords="344,56,423,90"/>-->
                        <!--                    <area shape="rect" alt="Crop + Wood products use" title="Crop + Wood products use" coords="434,54,530,91"/>-->
                        <area shape="rect" href="#" alt="Land use change" title="Land use change" coords="538,49,601,93" style="border: 2px solid blue"/>
                        <area shape="rect" href="#" alt="Fire" title="Fires" coords="629,67,665,91"/>
                        <!--                    <area shape="rect" alt="Natural Fires" title="Natural Fires" coords="750,51,802,91"/>-->
                        <area shape="rect" href="#" alt="Heterotrophic Respiration" title="Heterotrophic Respiration" coords="831,49,914,92"/>
                        <!--                    <area shape="rect" alt="Land sink" title="Land sink" coords="929,56,990,76"/>-->
                        <area shape="rect" href="#" alt="GPP" title="Gross primary production" coords="1025,16,1111,46"/>
                        <!--                    <area shape="rect" alt="Plant" title="Plant" coords="761,228,836,279"/>-->
                        <!--                    <area shape="rect" alt="Soils" title="Soils" coords="705,290,794,340"/>-->
                        <!--                    <area shape="rect" alt="Wood product storage" title="Wood product storage" coords="516,270,565,328"/>-->
                        <!--                    <area shape="rect" alt="FrozenSoils" title="FrozenSoils" coords="5,263,124,291"/>-->
                        <!--                    <area shape="rect" alt="Wetland soils" title="Wetland soils" coords="128,289,243,312"/>-->
                        <!--                    <area shape="rect" alt="Coal" title="Coal" coords="310,327,361,348"/>-->
                        <!--                    <area shape="rect" alt="Gas" title="Gas" coords="444,322,482,349"/>-->
                        <!--                    <area shape="rect" alt="Oil" title="Oil" coords="385,324,419,351"/>-->
                        <!--                    <area shape="rect" alt="Fossil fuel trade" title="Fossil fuel trade" coords="306,388,426,416"/>-->
                        <area  shape="rect" href="#" alt="NPP" title="NPP" coords="983,129,1069,174"/>
                        <!--                    <area  shape="rect" alt="weathering" title="weathering" coords="974,216,1060,245"/>-->
                        <!--                    <area shape="rect"  alt="FreshwaterOutgassing" title="FreshwaterOutgassing" coords="1060,211,1146,240"/>-->
                        <!--                    <area shape="rect"  alt="SoilExport" title="SoilExport" coords="820,316,911,341"/>-->
                        <!--                    <area shape="rect"  alt="weathering2" title="weathering2" coords="765,371,847,396"/>-->
                        <!--                    <area shape="rect"  alt="FreshwaterEstuaryBurial" title="FreshwaterEstuaryBurial" coords="995,365,1069,414"/>-->
                        <area shape="rect" href="#" alt="River export to ocean" title="exportToOcean" coords="1075,390,1142,421"/>
                    </map>
                </div>
                <div class="imageTitle">Flux</div>
                Click on one variable to get the bar chart

            </div>

            <div class="col-md-4">
                <!--                <h3>Bar chart</h3>-->

                <div id="bar-chart"></div>

            </div>

        </div>
    </div>


</div>

<div id="hiddenDiv"></div>

<div id="dataDiv">
    <div id="dataTitle" class="dataTitle">CARBON BUDGETS FOR SELECTED REGION(S)</div>
    <div id="data-count" class="dc-data-count dc-chart">
        <span class="filter-count"></span> selected out of <span class="total-count"></span> records
    </div>
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
    <div class="synthesisTitle">SYNTHESIS</div>
    <img src="img/Flux.png" width="1100px"/>
</div>

<script type="text/javascript">
    $( document ).ready( function ()
    {
        new RCInterface();
    } );

</script>
