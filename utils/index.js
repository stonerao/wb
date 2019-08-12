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
axios.interceptors.response.use(res => {
    const result = res || {}
    if (result.status === 200) {
        return result.data
    }

})
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
const url = "/SOC/webclient/api";
const ref = {
    date: url + "/ss/server/info",
    eventType: url + "/ss/eventdatas/",// /ss/eventdatas/{size}
    attackType: url + "/ss/eventdataStatCategory/",// {day}
    attackProvince: url + "/ss/eventdataStatProvince/",// {day}
    dailyStat: url + "/ss/dailyStat/",
}
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
        cityLevel: 1,
        date: "",
        chartEventType: null,
        chartDayTop5: null,
        chartAttackEvent: null
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
        this.chartEventType = new initBarList({
            id: "eventType",
            data: datas,
            color: "#4081ff",
            dstColor: "#65bef5"
        })
        this.chartAttackEvent = new initLineList({
            id: "attackEvent",
            data: datas
        })
        var dailyDatas = [...new Array(5)].map((elem, index) => {
            return {
                name: names[index],
                value: parseInt(Math.random() * 2500)
            }
        })
        this.chartDayTop5 = new initBarList({
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
                return
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

        //dete
        this.getDate();
        setInterval(() => {
            this.getDate();
        }, 50000)

        //安全事件
        //中下方
        this.getEventType();

        // 左上方
        this.getAttackType(7);
        this.getAttackProvince(7);
        this.getDailyStat(7);
    },
    methods: {
        getJson(city, callback) {
            var cityName = "";
            switch (city) {
                case "sichuan":
                    cityName = "si_chuan_geo";
                    break
            }
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
        getDate() {
            axios(ref.date).then(res => {
                if (res.success) {
                    res.realtime
                    const date = new Date(res.realtime);
                    this.date = GetCurrentDate(date);
                }
            })
        },
        getEventType(size = 10) {
            axios(ref.eventType + size).then(res => {
                if (res.success) {
                    const data = res.data;

                }
            })
        },
        getAttackType(day = 7) {
            axios(ref.attackType + day).then(res => {
                if (res.success) {
                    let data = res.data;
                    const spliceLen = 12;
                    if (data.length > spliceLen) {
                        data.splice(spliceLen)
                    }
                    const items = data.map(elem => ({
                        value: elem.total,
                        name: elem.eventCategory.name
                    }))
                    this.chartEventType.update(items)
                }
            })
        },
        getAttackProvince(day = 7) {
            axios(ref.attackProvince + day).then(res => {
                if (res.success) {
                    let data = res.data; 
                    const spliceLen = 5;
                    if (data.length > spliceLen) {
                        data.splice(spliceLen)
                    }
                    const items = data.map(elem => ({
                        value: elem.total,
                        name: elem.province
                    }))
                    this.chartDayTop5.update(items)
                }
            })
        },
        getDailyStat(day=7){
            axios(ref.dailyStat + day).then(res => {
                if (res.success) {
                    let data = res.data;
                    // const spliceLen = 5;
                    // if (data.length > spliceLen) {
                    //     data.splice(spliceLen)
                    // }
                    const items = data.map(elem => ({
                        value: elem.total,
                        name: GetCurrentDate(new Date(elem.stateDate))
                    }))
                    this.chartAttackEvent.update(items)
                }
            })
        }
    }
})
function GetCurrentDate(date) {
    var y = date.getYear() + 1900;
    var month = add_zero(date.getMonth() + 1),
        days = add_zero(date.getDate()),
        hours = add_zero(date.getHours());
    var minutes = add_zero(date.getMinutes()),
        seconds = add_zero(date.getSeconds());
    var str = y + '-' + month + '-' + days + ' ' + hours + ':' + minutes + ':' + seconds;
    function add_zero(temp) {
        if (temp < 10) {
            return "0" + temp;
        }
        return temp;
    }
    return str;
}