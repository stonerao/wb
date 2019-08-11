var box = {
    template: `
    <div class="g-box">
        <div class="g-box-title" v-if="title">
            <span class="g-box--tcontent">{{title}}</span>
        </div>
        <div class="g-box-main" :style="{'top':title?'58px':'0px'}">
            <div class="g-box--it"></div>
            <div class="g-box--ib"></div>
            <div class="g-box-content">
                <slot name="main">

                </slot>
            </div>
            
        </div>
        
    </div>`,
    props: {
        title: String
    }
}
var attackList = [...new Array(8)].map((elem, index) => {
    return {
        id: index + 1,
        vin: "LS5A3ADE0AB046791",
        code: "421Ads",
        ip: "255.255.255.255",
        type: "设置ACK和RST标志位的dos攻击",
        address: "四川省 达州市",
        date: "2019-7-24 21:31:36",
        src: "四川",
        dst: "上海"
    }
})
var VM = new Vue({
    el: "#app",
    data: {
        title: "汽车网络安全态势感知",
        attackComponents: [
            {
                name: "IVI",
                img: "./image/IVI.png",
                value: 4021
            }, {
                name: "TBOX",
                img: "./image/TBOX.png",
                value: 12021
            }, {
                name: "GATEWAY",
                img: "./image/GATEWAY.png",
                value: 23021
            }, {
                name: "EUCs",
                img: "./image/EUCs.png",
                value: 54021
            }
        ],
        attackList: attackList,
        currAdr: null,
        cityLevel: 1
    },
    components: {
        cbox: box
    },
    mounted() {
        let _this = this;
        document.querySelector(".l-loding").remove()
        var names = [
            '待选项的IP包（一）',
            '待选项的IP包（二）',
            'TCK ACK 端口扫描',
            "TCK ACK Flood",
            "TCP Xmax端口扫描",
            "设置ACK和RST标志位的dos攻击",
            "服务及版本扫描探测",
            "UDP端口扫描",
            "TCP终端存活探测",
            "ICMP终端存活探测"
        ]
        var datas = [...new Array(10)].map((elem, index) => {
            return {
                name: names[index],
                value: parseInt(Math.random() * 2500)
            }
        })
        var eventType = new initBarList({
            id: "eventType",
            data: datas,
            color: "#4081ff",
            dstColor: "#65bef5"
        })
        var attackEvent = new initLineList({
            id: "attackEvent",
            data: datas
        })
        var dailyDatas = [...new Array(5)].map((elem, index) => {
            return {
                name: names[index],
                value: parseInt(Math.random() * 2500)
            }
        })
        var dailyEvent = new initBarList({
            id: "daily",
            data: dailyDatas,
            color: "#ff8d36",
            dstColor: "#ffea61"
        })
        /* map */
        var dom = document.getElementById("map");
        this.currAdr = "china";
        this.cityLevel = 1;


        var map = new initMap({
            geo: china,
            dom: dom,
            click: function (res) {
                if (res === false && _this.cityLevel === 2) {
                    //点击空白 
                    _this.cityLevel = 1;
                    map.createMap({
                        geo: china
                    })
                } else if (_this.cityLevel === 1 && res !== false) {
                    _this.getJson(res.id, function (data) {
                        map.createMap({
                            geo: data
                        })
                    })
                }
            }
        })

        window.addEventListener("resize", function () {
            map.resize();//地图resize event
            eventType.resize();
            attackEvent.resize();
            dailyEvent.resize();
        })
        /*  setTimeout(() => {
             this.getJson(`sichuan`, function (data) {
                 map.createMap({
                     geo: data
                 })
             })
 
         }, 5000) */
    },
    methods: {
        getJson(city, callback) {
            var cityName = "";
            switch (city) {
                case "sichuan":
                    cityName = "si_chuan_geo";
                    break
            }
            console.log(city)
            if (!city) {
                return false
            }
            this.currAdr = city;
            this.cityLevel = 2;
            axios(`./geoJson/${city}_geo.json`).then(res => {
                var data = res.data;
                typeof callback === 'function' ? callback(data) : false;
            })
        },

    }
})
