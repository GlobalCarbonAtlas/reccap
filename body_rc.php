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

                <div id="flux-img"><img src="img/FluxEmptyWB.png" width="850px" usemap="#mapFlux"/>
                    <map id="mapFlux" name="mapFlux">
                        <area shape="rect" alt="Fossil Fuel" title="Fossil Fuel" coords="344,56,423,90" href="fossilFuel" target=""/>
                        <area shape="rect" alt="Crop + Wood products use" title="Crop " coords="434,54,530,91" href="cropWood" target=""/>
                        <area shape="rect" alt="Land use change" title="" coords="538,49,601,93" href="land" target=""/>
                        <area shape="rect" alt="Fires" title="" coords="629,67,665,91" href="fires" target=""/>
                        <area shape="rect" alt="Natural Fires" title="" coords="750,51,802,91" href="naturalFires" target=""/>
                        <area shape="rect" alt="Heterotrophic Respiration" title="" coords="831,49,914,92" href="HP" target=""/>
                        <area shape="rect" alt="Land sink" title="" coords="929,56,990,76" href="landSink" target=""/>
                        <area shape="rect" alt="Gross primary production" title="" coords="1025,16,1111,46" href="gross" target=""/>
                        <area shape="rect" alt="Plant" title="" coords="761,228,836,279" href="plant" target=""/>
                        <area shape="rect" alt="Soils" title="" coords="705,290,794,340" href="soils" target=""/>
                        <area shape="rect" alt="Wood product storage" title="" coords="516,270,565,328" href="woodProductStorage" target=""/>
                        <area shape="rect" alt="FrozenSoils" title="" coords="5,263,124,291" href="frozenSoils" target=""/>
                        <area shape="rect" alt="Wetland soils" title="" coords="128,289,243,312" href="wetlandSoils" target=""/>
                        <area shape="rect" alt="Coal" title="" coords="310,327,361,348" href="coal" target=""/>
                        <area shape="rect" alt="Gas" title="" coords="444,322,482,349" href="gas" target=""/>
                        <area shape="rect" alt="Oil" title="" coords="385,324,419,351" href="oil" target=""/>
                        <area shape="rect" alt="Fossil fuel trade" title="" coords="306,388,426,416" href="fossilFuelTrade" target=""/>
                        <!-- Created by Online Image Map Editor (http://www.maschek.hu/imagemap/index) --></map>
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
