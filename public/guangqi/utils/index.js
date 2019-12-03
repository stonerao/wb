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

const url = "/SOC/webclient/api";
const ref = {
    date: url + "/ss/server/info",
    eventType: url + "/ss/eventdatas/",// /ss/eventdatas/{size}
    attackType: url + "/ss/eventdataStatCategory/",// {day}
    attackProvince: url + "/ss/eventdataStatProvince/",// {day}
    dailyStat: url + "/ss/dailyStat/",// {day}
    eventDataDevice: url + "/ss/eventdataStatDeviceType/",// {day}
    eventDataCity: url + "/ss/eventdataStatCity/",//{days}?provinceId={provinceId}
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
        attackList: [],
        attackMapList: [],
        currAdr: null,
        cityLevel: 1,
        selectDay: 7,
        date: "",
        dataInterval: null,
        chartEventType: null,
        chartDayTop5: null,
        chartAttackEvent: null,
        provinceId: "",
        map: null,
        dayItems: [
            {
                value: 7
            }, {
                value: 15
            }, {
                value: 30
            }, {
                value: 90
            }
        ],
        itemsAnimatList: null,
        cartTotal: 0,
        newCar: 0,
        newEventNum: 0,
        eventTotal: 0,
        selectCity: "",
        attackNumber: 50,// 攻击个数
        cityIdArr:
        {
            '1': '黑龙江省',
            '3': '吉林省',
            '5': '辽宁省',
            '7': '河北省',
            '9': '山东省',
            '11': '山西省',
            '13': '河南省',
            '15': '云南省',
            '17': '重庆市',
            '19': '四川省',
            '21': '湖南省',
            '23': '湖北省',
            '25': '贵州省',
            '27': '安徽省',
            '29': '江西省',
            '31': '江苏省',
            '33': '福建省',
            '35': '海南省',
            '37': '青海省',
            '39': '甘肃省',
            '41': '陕西省',
            '43': '广东省',
            '45': '台湾省',
            '47': '北京市',
            '49': '天津市',
            '51': '上海市',
            '55': '新疆维吾尔自治区',
            '57': '内蒙古自治区',
            '59': '宁夏回族自治区',
            '61': '广西壮族自治区',
            '63': '西藏藏族自治区',
            '65': '香港特别行政区',
            '67': '澳门特别行政区'
        }
    },
    components: {
        cbox: box
    },
    created() {
        let urlParms = this.getRequest();
        if (urlParms.hasOwnProperty("day")) {
            let day = urlParms.day;
            this.selectDay = parseInt(day) === NaN ? 30 : parseInt(day);
        }
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
        // top5
        this.chartDayTop5 = new initBarList({
            id: "daily",
            data: dailyDatas,
            color: "#ff8d36",
            dstColor: "#ffea61"
        })
        this.parts = new initBarList2({
            id: "attackComm",
            data: dailyDatas,
            color: "#ff8d36",
            dstColor: "#ffea61"
        })

        /* map */
        var dom = document.getElementById("map");
        this.currAdr = "china";
        this.cityLevel = 1;

        var attackMapIndex = 0;
        this.map = new initMap({
            geo: china,
            dom: dom,
            click: function (res) {
                for (const key in _this.cityIdArr) {
                    const elem = _this.cityIdArr[key];
                    if (elem.indexOf(res.name) != -1) {
                        _this.selectCity = key;
                        _this.getCityData(_this.selectDay, key);
                        continue;
                    }
                }
                return
            },
            attackCallBack: function (data) {
                /* for (const key in _this.cityIdArr) {
                    const elem = _this.cityIdArr[key];
                    if (elem == data.src.province){
                        _this.getCityData(_this.selectDay,key)
                    }
                } */
                //每次产生攻击后的回调函数 

            }
        })

        window.addEventListener("resize", function () {
            _this.map.resize();//地图resize event
            _this.chartEventType.resize();
            _this.chartAttackEvent.resize();
            _this.chartDayTop5.resize();
            _this.parts.resize();
        })


        //dete
        this.getDate();
        setInterval(() => {
            this.getDate();
        }, 10000)

        //安全事件
        //中下方
        this.getEventType(this.attackNumber);
        setInterval(() => {
            this.getEventType(this.attackNumber);
        }, 60000)

        // 左上方
        this.selectEvent();
        setInterval(() => {
            this.selectEvent();
        }, 60000)
    },
    methods: {
        getCity(val, type) {
            // 根据城市ID或者城市名找到当前的name 和 id
            // type 1 根据ID 查找  type 2 根据name查找
            let obj = null;
            for (let key in this.cityIdArr) {
                let isMatch = false;
                if (type == 1) {
                    if (key == val) {
                        isMatch = true;
                    }
                } else {
                    if (this.cityIdArr[key] == val) {
                        isMatch = true;
                    }
                }
                if (isMatch) {
                    obj = {
                        id: key,
                        name: this.cityIdArr[key]
                    }
                    continue
                }
            }
            return obj
        },
        getRequest() {
            var url = location.search; //获取url中"?"符后的字串  
            var theRequest = new Object();
            if (url.indexOf("?") != -1) {
                var str = url.substr(1);
                strs = str.split("&");
                for (var i = 0; i < strs.length; i++) {
                    theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
                }
            }
            return theRequest;
        },
        backmap() {
            this.map.cityLevel = 1;
            this.cityLevel = 1;
            this.getAttackProvince(this.selectDay);
            this.map.createMap({
                geo: china
            })
        },
        selectDataDay(day) {
            if (this.selectDay === day) {
                return
            }
            this.selectDay = day;
            this.selectEvent();
        },
        selectEvent() {
            this.getAttackType(this.selectDay);
            this.getAttackProvince(this.selectDay);
            this.getDailyStat(this.selectDay);
            this.getDeviceData(this.selectDay);
        },
        getJson(city, callback) {
            if (!city) {
                return false
            }
            this.currAdr = city;
            this.cityLevel = 2;
            axios(`./geoJson/${city}_geo.json`).then(res => {
                typeof callback === 'function' ? callback(res) : false;
            })
        },
        getDate() {
            axios(ref.date).then(res => {
                if (res.success) {
                    if (this.dataInterval) clearInterval(this.dataInterval);
                    let dateTime = res.realtime
                    let date = new Date(res.realtime);
                    this.date = GetCurrentDate(date);
                    this.dataInterval = setInterval(() => {
                        dateTime += 1000;
                        date = new Date(dateTime);
                        this.date = GetCurrentDate(date);
                    }, 1000)
                }
            })
        },
        getEventType(size = 10) {
            axios(ref.eventType + size).then(res => {
                if (res.success) {
                    if (this.itemsAnimatList) clearInterval(this.itemsAnimatList);
                    const data = res.data;
                    this.attackList = data.map( (elem, index)=> {
                        var content = "";
                        try {
                            content = JSON.parse(elem.content);
                        } catch (err) {
                            content = elem.content;
                        }
                        let color;
                        switch (elem.isNew) {
                            case true:
                                color = "g-at-ac1";
                                break
                            default:
                                color = "";
                        }
                        return {
                            id: index + 1,
                            vin: elem.vehicleId,
                            code: elem.code,
                            ip: typeof content === 'object' ? content.src_ip : '-',
                            type: elem.name,
                            address: elem.province + " " + elem.city,
                            date: GetCurrentDate(new Date(elem.eventTime)),
                            src: "",
                            dst: elem.province,
                            content: content,
                            color: color,
                            // provinceIdSrc: this.getCity(17, 1).id,
                            provinceIdSrc: elem.provinceIdSrc,
                            provinceSrc: elem.provinceSrc,
                            // provinceSrc: this.getCity(17, 1).name,
                            provinceId: elem.provinceId,
                            cityId: elem.cityId,
                            cityIdSrc: elem.cityIdSrc,
                            citySrc: elem.citySrc,
                        }
                    })
                    // console.log(this.attackList)
                    this.itemsAnimatList = setInterval(() => {
                        var obj = this.attackList.shift();
                        this.attackList.push(obj);
                        this.map.attckCity(obj)
                    }, 500)
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
                        name: elem.eventCategory.name,
                        grade: elem.eventCategory.grade
                    }))
                    this.map.updateTypes(items);
                    this.chartEventType.update(items)
                }
            })
        },
        getAttackProvince(day = 7) {
            axios(ref.attackProvince + day).then(res => {
                if (res.success) {
                    let data = res.data;
                    let cloneData = JSON.parse(JSON.stringify(data));
                    // top5
                    const spliceLen = 5;
                    if (data.length > spliceLen) {
                        data.splice(spliceLen)
                    }
                    const items = data.map(elem => ({
                        value: elem.total,
                        name: elem.province
                    })).sort((a, b) => b.value - a.value);
                    const cityName = items[0].name;
                    for (const key in this.cityIdArr) {
                        const elem = this.cityIdArr[key];
                        if (elem.indexOf(cityName) != -1) {
                            this.selectCity = key;
                            this.getCityData(this.selectDay, key);
                            continue;
                        }
                    }
                    this.chartDayTop5.update(items);
                    //地图数据 
                    setTimeout(() => {
                        this.map.update(cloneData)
                    }, 2000)

                    //地图 左下角
                }
            })
        },
        getDailyStat(day = 7) {
            axios(ref.dailyStat + day).then(res => {
                if (res.success) {
                    var newEvent = [];//新增事件
                    var newCar = [];//新增车辆
                    var cartTotal = [];//车辆累计总数
                    var eventTotal = [];//车辆总数
                    // 0 今日事件新增；1 今日车辆新增；2 车辆累计总数；3 事件累计总数
                    let data = res.data;
                    for (var i = 0; i < data.length; i++) {
                        var elem = data[i];
                        switch (parseInt(elem.type)) {
                            case 0:
                                newEvent.push({
                                    value: elem.total,
                                    name: GetCurrentDate(new Date(elem.stateDate))
                                })
                                break;
                            case 1:
                                newCar.push({
                                    value: elem.total,
                                    name: GetCurrentDate(new Date(elem.stateDate))
                                })
                                break;
                            case 2:
                                cartTotal.push({
                                    value: elem.total,
                                    name: GetCurrentDate(new Date(elem.stateDate))
                                })
                                break;
                            case 3:
                                eventTotal.push({
                                    value: elem.total,
                                    name: GetCurrentDate(new Date(elem.stateDate))
                                })
                                break;
                        }
                    }
                    this.cartTotal = cartTotal[cartTotal.length - 1].value;
                    this.newCar = newCar[newCar.length - 1].value;
                    this.newEventNum = newEvent[newEvent.length - 1].value;
                    this.eventTotal = eventTotal[eventTotal.length - 1].value;;

                    this.chartAttackEvent.update(newEvent);
                }
            })
        },
        getDeviceData(day = 7) {
            //获取设备数据 
            this.attackComponents = [...new Array(4)].map(function (elem) {
                return {
                    nameL: "",
                    value: "",
                    date: "",
                    id: ""
                }
            })
            axios(ref.eventDataDevice + day).then(res => {
                if (res.success) {
                    let data = res.data;
                    this.attackComponents = data.map(function (elem) {
                        return {
                            name: elem.name,
                            value: elem.total,
                            date: elem.stateDate,
                            id: elem.id
                        }
                    })
                    if (this.attackComponents.length > 5) {
                        this.attackComponents.splice(5, this.attackComponents.length)
                    }
                    // this.attackComponents = this.attackComponents.sort((a,b)=>a.value-b.value);
                    this.parts.update(this.attackComponents);
                }
            })
        },
        getCityData(day = 7, provinceId) {
            this.attackMapList = [];
            axios(ref.eventDataCity + day + '?provinceId=' + provinceId).then(res => {
                if (res.success) {
                    let data = res.data;
                    if (Array.isArray(data) && data.length >= 0) {
                        data.forEach((elem) => {
                            this.attackMapList.push({
                                srcName: elem.city,
                                // type: data.type,
                                date: GetCurrentDate(new Date(elem.stateDate)),
                                total: elem.total,
                                id: elem.id
                            });
                        })
                    }
                    if (this.attackMapList.length > 5) {
                        this.attackMapList.splice(5, this.attackMapList.length - 1)
                    }
                }
            })
        },
        setMapAttackTop(data) {
            //地图左下 Top5
            data = data || [];
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