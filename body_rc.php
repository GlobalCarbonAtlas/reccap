<div id="pageWrapper">

    <div class="rowWrapper">
        <div class="DCObject">
            <h2>Net Primary Production</h2>

            <div id="npp-gpp-chart"></div>
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

            <div id="function-pie-chart"></div>
        </div>
        <div class="DCObject">
            <h2>Functions</h2>

            <div id="function-chart"></div>
        </div>
    </div>
</div>

<!--<div class="bob">-->
<!--    <svg width="100" height="200">-->
<!--        <g transform="translate(50,100)">-->
<!--            <g class="pie-slice _0">-->
<!--                <path fill="#fde0dd"-->
<!--                      d="M3.061616997868383e-15,-50A50,50 0 0,1 21.743379146490955,-45.02472057983194L13.046027487894575,-27.014832347899166A30,30 0 0,0 1.83697019872103e-15,-30Z"/>-->
<!--                <title/></g>-->
<!--            <g class="pie-slice _1">-->
<!--                <path fill="#fa9fb5"-->
<!--                      d="M21.743379146490955,-45.02472057983194A50,50 0 0,1 33.44802051489923,-37.16490177082243L20.068812308939535,-22.298941062493462A30,30 0 0,0 13.046027487894575,-27.014832347899166Z"/>-->
<!--                <title/></g>-->
<!--            <g class="pie-slice _2">-->
<!--                <path fill="#e7e1ef"-->
<!--                      d="M33.44802051489923,-37.16490177082243A50,50 0 0,1 45.467896720935684,-20.800729981765684L27.280738032561413,-12.48043798905941A30,30 0 0,0 20.068812308939535,-22.298941062493462Z"/>-->
<!--                <title/></g>-->
<!--            <g class="pie-slice _3">-->
<!--                <path fill="#d4b9da"-->
<!--                      d="M45.467896720935684,-20.800729981765684A50,50 0 0,1 45.467896720935684,-20.800729981765684L27.280738032561413,-12.48043798905941A30,30 0 0,0 27.280738032561413,-12.48043798905941Z"/>-->
<!--                <title/></g>-->
<!--            <g class="pie-slice _4">-->
<!--                <path fill="#c994c7"-->
<!--                      d="M45.467896720935684,-20.800729981765684A50,50 0 0,1 49.326568409598515,-8.178609229765039L29.59594104575911,-4.907165537859024A30,30 0 0,0 27.280738032561413,-12.48043798905941Z"/>-->
<!--                <title/></g>-->
<!--            <g class="pie-slice _5">-->
<!--                <path fill="#fcc5c0"-->
<!--                      d="M49.326568409598515,-8.178609229765039A50,50 0 0,1 23.060657888965753,44.36446841480332L13.836394733379453,26.618681048881992A30,30 0 0,0 29.59594104575911,-4.907165537859024Z"/>-->
<!--                <title/></g>-->
<!--            <g class="pie-slice _6">-->
<!--                <path fill="#df65b0"-->
<!--                      d="M23.060657888965753,44.36446841480332A50,50 0 0,1 15.343145053569849,47.58768643110437L9.20588703214191,28.552611858662623A30,30 0 0,0 13.836394733379453,26.618681048881992Z"/>-->
<!--                <title/></g>-->
<!--            <g class="pie-slice _7">-->
<!--                <path fill="#e7298a"-->
<!--                      d="M15.343145053569849,47.58768643110437A50,50 0 0,1 -48.981048837280355,10.04275135607553L-29.388629302368212,6.025650813645319A30,30 0 0,0 9.20588703214191,28.552611858662623Z"/>-->
<!--                <title/></g>-->
<!--            <g class="pie-slice _8">-->
<!--                <path fill="#ce1256"-->
<!--                      d="M-48.981048837280355,10.04275135607553A50,50 0 0,1 -49.91707480411295,2.8784792861148616L-29.950244882467768,1.727087571668917A30,30 0 0,0 -29.388629302368212,6.025650813645319Z"/>-->
<!--                <title/></g>-->
<!--            <g class="pie-slice _9">-->
<!--                <path fill="#f768a1"-->
<!--                      d="M-49.91707480411295,2.8784792861148616A50,50 0 0,1 -49.99937219899388,0.2505587884664902L-29.999623319396328,0.15033527307989414A30,30 0 0,0 -29.950244882467768,1.727087571668917Z"/>-->
<!--                <title/></g>-->
<!--            <g class="pie-slice _10">-->
<!--                <path fill="#dd3497"-->
<!--                      d="M-49.99937219899388,0.2505587884664902A50,50 0 0,1 -49.668157295864376,-5.751013026700119L-29.800894377518624,-3.4506078160200717A30,30 0 0,0 -29.999623319396328,0.15033527307989414Z"/>-->
<!--                <title/></g>-->
<!--            <g class="pie-slice _11">-->
<!--                <path fill="#e78ac3"-->
<!--                      d="M-49.668157295864376,-5.751013026700119A50,50 0 0,1 -17.6250415470242,-46.79057501747196L-10.575024928214521,-28.074345010483174A30,30 0 0,0 -29.800894377518624,-3.4506078160200717Z"/>-->
<!--                <title/></g>-->
<!--            <g class="pie-slice _12">-->
<!--                <path fill="#f1b6da"-->
<!--                      d="M-17.6250415470242,-46.79057501747196A50,50 0 0,1 -9.573681263683346,-49.074887947517496L-5.744208758210008,-29.444932768510498A30,30 0 0,0 -10.575024928214521,-28.074345010483174Z"/>-->
<!--                <title/></g>-->
<!--            <g class="pie-slice _13">-->
<!--                <path fill="#c51b7d"-->
<!--                      d="M-9.573681263683346,-49.074887947517496A50,50 0 0,1 -9.184850993605149e-15,-50L-5.510910596163089e-15,-30A30,30 0 0,0 -5.744208758210008,-29.444932768510498Z"/>-->
<!--                <title/></g>-->
<!--        </g>-->
<!--    </svg>-->
<!---->
<!--</div>-->
<!---->
<!--<div class="bob">-->
<!--    <svg width="100" height="200">-->
<!--        <g transform="translate(50,100)">-->
<!--            <g class="pie-slice _0">-->
<!--                <path fill="#1f77b4" d="M3.061616997868383e-15,-50A50,50 0 0,1 3.061616997868383e-15,-50L1.83697019872103e-15,-30A30,30 0 0,0 1.83697019872103e-15,-30Z"/>-->
<!--                <title>A negative value indicates net carbon sink: 0</title></g>-->
<!--            <g class="pie-slice _1">-->
<!--                <path fill="#aec7e8" d="M0,0"/>-->
<!--                <title>Atmosphere: NaN</title></g>-->
<!--            <g class="pie-slice _2">-->
<!--                <path fill="#ff7f0e" d="M0,0"/>-->
<!--                <title>Atmospherica aerosol carbon export: 1</title></g>-->
<!--            <g class="pie-slice _3">-->
<!--                <path fill="#ffbb78" d="M0,0"/>-->
<!--                <title>C input to river: 72</title></g>-->
<!--            <g class="pie-slice _4">-->
<!--                <path fill="#2ca02c" d="M0,0"/>-->
<!--                <title>Crop consumption: NaN</title></g>-->
<!--            <g class="pie-slice _5">-->
<!--                <path fill="#98df8a" d="M0,0"/>-->
<!--                <title>Crop trade: NaN</title></g>-->
<!--            <g class="pie-slice _6">-->
<!--                <path fill="#d62728" d="M0,0"/>-->
<!--                <title>FF trade: 0</title></g>-->
<!--            <g class="pie-slice _7">-->
<!--                <path fill="#ff9896" d="M0,0"/>-->
<!--                <title>Fire: NaN</title></g>-->
<!--            <g class="pie-slice _8">-->
<!--                <path fill="#9467bd" d="M0,0"/>-->
<!--                <title>GPP: -2668</title></g>-->
<!--            <g class="pie-slice _9">-->
<!--                <path fill="#c5b0d5" d="M0,0"/>-->
<!--                <title>Harvest: 20</title></g>-->
<!--            <g class="pie-slice _10">-->
<!--                <path fill="#8c564b" d="M0,0"/>-->
<!--                <title>Heterotrophic Respiration: 20889</title></g>-->
<!--            <g class="pie-slice _11">-->
<!--                <path fill="#c49c94" d="M0,0"/>-->
<!--                <title>Land use change: NaN</title></g>-->
<!--            <g class="pie-slice _12">-->
<!--                <path fill="#e377c2" d="M0,0"/>-->
<!--                <title>Live product: 3</title></g>-->
<!--            <g class="pie-slice _13">-->
<!--                <path fill="#f7b6d2" d="M0,0"/>-->
<!--                <title>Livestock consumption: 2</title></g>-->
<!--            <g class="pie-slice _14">-->
<!--                <path fill="#7f7f7f" d="M0,0"/>-->
<!--                <title>Livestock trade: NaN</title></g>-->
<!--            <g class="pie-slice _15">-->
<!--                <path fill="#c7c7c7" d="M0,0"/>-->
<!--                <title>Logging: 171</title></g>-->
<!--            <g class="pie-slice _16">-->
<!--                <path fill="#bcbd22" d="M0,0"/>-->
<!--                <title>NBP: NaN</title></g>-->
<!--            <g class="pie-slice _17">-->
<!--                <path fill="#dbdb8d" d="M0,0"/>-->
<!--                <title>NEP: -4575</title></g>-->
<!--            <g class="pie-slice _18">-->
<!--                <path fill="#17becf" d="M0,0"/>-->
<!--                <title>NPP: -24520</title></g>-->
<!--            <g class="pie-slice _19">-->
<!--                <path fill="#9edae5" d="M0,0"/>-->
<!--                <title>Non-territorial C stocks: 155</title></g>-->
<!--            <g class="pie-slice _20">-->
<!--                <path fill="#1f77b4" d="M0,0"/>-->
<!--                <title>Non-territorial emissions: 155</title></g>-->
<!--            <g class="pie-slice _21">-->
<!--                <path fill="#aec7e8" d="M0,0"/>-->
<!--                <title>Outgassing: 66</title></g>-->
<!--            <g class="pie-slice _22">-->
<!--                <path fill="#ff7f0e" d="M0,0"/>-->
<!--                <title>River export to ocean: NaN</title></g>-->
<!--            <g class="pie-slice _23">-->
<!--                <path fill="#ffbb78" d="M0,0"/>-->
<!--                <title>Territorial FF and methane Emissions: NaN</title></g>-->
<!--            <g class="pie-slice _24">-->
<!--                <path fill="#2ca02c" d="M0,0"/>-->
<!--                <title>Units: Tg C/yr: 0</title></g>-->
<!--            <g class="pie-slice _25">-->
<!--                <path fill="#98df8a" d="M0,0"/>-->
<!--                <title>Wood decay: 5</title></g>-->
<!--            <g class="pie-slice _26">-->
<!--                <path fill="#d62728" d="M0,0"/>-->
<!--                <title>wood trade: 34</title></g>-->
<!--            <text class="pie-slice _0" text-anchor="middle" transform="translate(2.4492935992912173e-15,-40)"/>-->
<!--            <text class="pie-slice _1" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _2" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _3" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _4" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _5" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _6" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _7" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _8" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _9" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _10" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _11" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _12" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _13" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _14" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _15" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _16" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _17" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _18" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _19" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _20" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _21" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _22" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _23" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _24" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _25" text-anchor="middle" transform=""/>-->
<!--            <text class="pie-slice _26" text-anchor="middle" transform=""/>-->
<!--        </g>-->
<!--    </svg>-->
<!--</div>-->

<script type="text/javascript">
    $( document ).ready( function ()
    {
        new RCInterface();
    } );

</script>
