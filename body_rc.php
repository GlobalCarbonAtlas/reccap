<div id="pageWrapper">

    <div class="container-fluid">

        <div class="row">

            <div class="col-md-8">
                <div class="row title"><span class="bigTitle">RE</span>gional <span class="bigTitle">C</span>arbon <span class="bigTitle">C</span>ycle <span
                        class="bigTitle">A</span>ssessment and <span class="bigTitle">P</span>rocesses&nbsp;&nbsp;&nbsp;&nbsp;</div>

                <div class="row">
                    <div class="tools col-md-1">
                        <div id="reset"><img src="img/reset-icon-614x460.png" width="50px" title="Reset all"/></div>
                        <div id="export"><img src="img/export_small.png" title="Export"/></div>
                        <div id="regionActive"><img src="img/Globe_Connected.png" width="30px" title="Allow multiple selection for regions"/></div>
                        <div id="regionUnActive"><img src="img/Globe_Disconnected.png" width="30px" title="Only one selected region"/></div>
                        <div id="data"><img src="img/Data.png" width="30px" title="Get all data"/></div>
                        <div id="synthesis"><img src="img/FluxEmptyWB_small.png" width="30px" title="Display synthesis"/></div>
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

                <div id="flux-img"><img src="img/FluxEmptyWB.png" width="850px"/></div>
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

<script type="text/javascript">
    $( document ).ready( function ()
    {
        new RCInterface();
    } );

</script>
