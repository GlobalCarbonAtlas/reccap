<div id="pageWrapper">

    <div class="rowWrapper">
        <div class="DCObject">
            <h2>Net Primary Production</h2>

            <div id="npp-chart"></div>
            <div id="npp-chart2"></div>
        </div>

        <div class="DCObject">
            <h2>Choropleth Map</h2>

            <div id="map-chart"></div>
        </div>

        <div class="DCObject">
            <h2>Heterotrophic Respiration</h2>

            <div id="hr-chart"></div>
        </div>
    </div>

    <div class="rowWrapper">
        <div class="DCObject">
            <h2>Data</h2>

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
        <div class="DCObject">
            <h2>Functions</h2>

            <div id="function-chart"></div>
        </div>
    </div>
</div>



<script type="text/javascript">
    $( document ).ready( function ()
    {
        new RCInterface();
    } );

</script>
