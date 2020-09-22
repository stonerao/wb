var tipconts = null;
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
        title: String,
    },
};
axios.interceptors.response.use((res) => {
    const result = res || {};
    if (result.status === 200) {
        return result.data;
    }
});

const url = "/SOC/webclient/api";
const ref = {
    date: url + "/ss/server/info",
    eventType: url + "/ss/eventdatas/", // /ss/eventdatas/{size}
    attackType: url + "/ss/eventdataStatCategory/", // {day}
    attackProvince: url + "/ss/eventdataStatProvince/", // {day}
    dailyStat: url + "/ss/dailyStat/", // {day}
    eventDataDevice: url + "/ss/eventdataStatDeviceType/", // {day}
    eventDataCity: url + "/ss/eventdataStatCity/", //{days}?provinceId={provinceId}
    eventdataStatModel: url + "/ss/eventdataStatModel/", //{days}?provinceId={provinceId}
};
var VM = new Vue({
    el: "#app",
    data: {
        title: "汽车网络安全态势感知",
        attackComponents: [{
            name: "IVI",
            img: "./image/IVI.png",
            value: 4021,
        },
        {
            name: "TBOX",
            img: "./image/TBOX.png",
            value: 12021,
        },
        {
            name: "GATEWAY",
            img: "./image/GATEWAY.png",
            value: 23021,
        },
        {
            name: "EUCs",
            img: "./image/EUCs.png",
            value: 54021,
        },
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
        carModelsEvent: null,
        provinceId: "",
        map: null,
        dayItems: [{
            value: 7,
        },
        {
            value: 15,
        },
        {
            value: 30,
        },
        {
            value: 90,
        },
        ],
        itemsAnimatList: null,
        cartTotal: 0,
        newCar: 0,
        newEventNum: 0,
        eventTotal: 0,
        eventToTotal:0,
        activeCar: 0,
        typeCars: 0,
        selectCity: "",
        attackNumber: 50, // 攻击个数
        cityIdArr: {
            "1": "黑龙江省",
            "3": "吉林省",
            "5": "辽宁省",
            "7": "河北省",
            "9": "山东省",
            "11": "山西省",
            "13": "河南省",
            "15": "云南省",
            "17": "重庆市",
            "19": "四川省",
            "21": "湖南省",
            "23": "湖北省",
            "25": "贵州省",
            "27": "安徽省",
            "29": "江西省",
            "31": "江苏省",
            "33": "福建省",
            "35": "海南省",
            "37": "青海省",
            "39": "甘肃省",
            "41": "陕西省",
            "43": "广东省",
            "45": "台湾省",
            "47": "北京市",
            "49": "天津市",
            "51": "上海市",
            "55": "新疆维吾尔自治区",
            "57": "内蒙古自治区",
            "59": "宁夏回族自治区",
            "61": "广西壮族自治区",
            "63": "西藏藏族自治区",
            "65": "香港特别行政区",
            "67": "澳门特别行政区",
        },
        cityIndex: 0,
        cityNameTitle: "",
        stopNum: 2,
        infos: _Config,
    },
    components: {
        cbox: box,
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

        document.querySelector(".l-loding").remove();
        var names = [
            "待选项的IP包（一）",
            "待选项的IP包（二）",
            "TCK ACK 端口扫描",
            "TCK ACK Flood",
            "TCP Xmax端口扫描",
            // "设置ACK和RST标志位的dos攻击",
            // "服务及版本扫描探测",
            // "UDP端口扫描",
            // "TCP终端存活探测",
            // "ICMP终端存活探测",
        ];
        var datas = [...new Array(10)].map((elem, index) => {
            return {
                name: names[index],
                value: parseInt(Math.random() * 2500),
            };
        });

        this.chartEventType = new initBarList({
            id: "eventType",
            data: datas,
            color: _Config.attackTypeConfig.color,
            dstColor: _Config.attackTypeConfig.dstColor,
            barWidth: _Config.attackTypeConfig.barWidth
        });

        this.chartAttackEvent = new initLineList({
            id: "attackEvent",
            data: datas, 
            areaStyle: _Config.attacktrend.areaStyle,
            itemStyle: _Config.attacktrend.itemStyle
        });
        this.carModelsEvent = new initBarList2({
            id: "carModels",
            data: [],
            color: _Config.carModelsEvent.color,
            dstColor: _Config.carModelsEvent.dstColor,
            barWidth: _Config.carModelsEvent.barWidth,
        });
        var dailyDatas = [...new Array(5)].map((elem, index) => {
            return {
                name: names[index],
                value: parseInt(Math.random() * 2500),
            };
        });
        // top5
        this.chartDayTop5 = new initBarList({
            id: "daily",
            data: dailyDatas,
            color: _Config.attackSort.color,
            dstColor: _Config.attackSort.dstColor,
            barWidth: _Config.attackSort.barWidth,
        });
        this.parts = new initBarList({
            id: "attackComm",
            data: dailyDatas,
            color: _Config.partsConfig.color,
            dstColor: _Config.partsConfig.dstColor,
            barWidth: _Config.partsConfig.barWidth,
        });

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
                        _this.stopNum = 2;
                        _this.selectCity = key;
                        _this.getCityData(_this.selectDay, key);
                        continue;
                    }
                }
                return;
            },
            attackCallBack: function (data) { },
        });

        window.addEventListener("resize", function () {
            _this.map.resize(); //地图resize event
            _this.chartEventType.resize();
            _this.chartAttackEvent.resize();
            _this.carModelsEvent.resize();
            _this.chartDayTop5.resize();
            _this.parts.resize();
        });

        //dete
        this.getDate();


        //安全事件
        this.getEventType(this.attackNumber);
        this.selectEvent();
        this.getCarModels();// 饼图


        // 定时更新数据
        setInterval(() => {
            //中下方
            this.getEventType(this.attackNumber);
            // 左上方
            this.selectEvent();
            this.getCarModels();// 车型
        }, _Config.dataTime);


        // 创建tips
        creatTips($('.g-center'));


        // 每三秒一次切换 
        setInterval(() => {
            if (this.stopNum > 0) {
                this.stopNum--;
                return false;
            }
            const keys = Object.keys(this.cityIdArr);

            const key = keys[this.cityIndex % keys.length];
            this.selectCity = key;
            _this.getCityData(this.selectDay, this.selectCity);

            this.cityIndex++;

        }, _Config.cityTime)
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
                        name: this.cityIdArr[key],
                    };
                    continue;
                }
            }
            return obj;
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
                geo: china,
            });
        },
        selectDataDay(day) {
            if (this.selectDay === day) {
                return;
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
                return false;
            }
            this.currAdr = city;
            this.cityLevel = 2;
            axios(`./geoJson/${city}_geo.json`).then((res) => {
                typeof callback === "function" ? callback(res) : false;
            });
        },
        sec_to_time (s) {
            var t;
            if (s > -1) {
                var hour = Math.floor(s / 3600);
                var min = Math.floor(s / 60) % 60;
                var sec = s % 60;
                var day = Math.floor(hour / 24); 

                if (hour < 10) {
                    t = '0' + hour + ":";
                } else {
                    t = day + " 天 " + (hour % 24) + " 时 ";
                }

                if (min < 10) { t += "0"; }
                t += min + " 分 ";
                // if (sec < 10) { t += "0"; }
                // t += sec.toFixed(2);
            }
            return t;
        },
        getDate() {
         
            axios(ref.date).then((res) => { 
                if (res.success) {
                    if (this.dataInterval) clearInterval(this.dataInterval);
                    let dateTime = res.realtime;
                    let dateVal = res.realtime -( res.starttime || 0);
                   
                    let date = new Date(res.realtime);
                    // this.date = GetCurrentDate(date);
                    // this.date = GetCurrentDate(date);
                    this.dataInterval = setInterval(() => {
                        dateVal += 1000;
                        // date = new Date(dateTime);
                        this.date = this.sec_to_time(dateVal / 1000);
                    }, 1000);
                }
            });
        },
        getEventType(size = 10) {
            axios(ref.eventType + size).then((res) => {
                if (res.success) {
                    if (this.itemsAnimatList) clearInterval(this.itemsAnimatList);
                    const data = res.data;

                    this.attackList = data.map((elem, index) => {
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
                                break;
                            default:
                                color = "";
                        };
                        let vim = elem.vehicleId;
                        if (String(elem.vehicleId).length > 20) {
                            vim = "..." + vim.slice(String(elem.vehicleId).length - 20);
                        }

                        return {
                            id: index + 1,
                            vin: vim,
                            code: elem.code,
                            ip: typeof content === "object" ? content.src_ip : "-",
                            type: elem.name == "LogModule_start" ? "- -" : elem.name,
                            address: elem.province + " " + elem.city,
                            date: GetCurrentDate(new Date(elem.eventTime)),
                            src: "",
                            dst: elem.province,
                            content: content,
                            color: color,
                            sip: elem.sip,
                            dip: elem.dip,
                            // provinceIdSrc: this.getCity(17, 1).id,
                            provinceIdSrc: elem.provinceIdSrc,
                            provinceSrc: elem.provinceSrc,
                            province: elem.province,
                            // provinceSrc: this.getCity(17, 1).name,
                            provinceId: elem.provinceId,
                            cityId: elem.cityId,
                            cityIdSrc: elem.cityIdSrc,
                            citySrc: elem.citySrc,
                            city: elem.city,
                        };
                    });

                    this.itemsAnimatList = setInterval(() => {
                        if (this.attackList.length == 0) {
                            clearInterval(this.itemsAnimatList);
                            return false;
                        }
                        var obj = this.attackList.shift();
                        this.attackList.push(obj);
                        this.map.attckCity(obj);
                    }, _Config.updateListTime);
                }
            });
        },
        getAttackType(day = 7) {
            axios(ref.attackType + day).then((res) => {
                if (res.success) {
                    let data = res.data;
                    const spliceLen = 12;
                    if (data.length > spliceLen) {
                        data.splice(spliceLen);
                    }
                    const items = data.map((elem) => ({
                        value: elem.total,
                        name: elem.eventCategory.name,
                        grade: elem.eventCategory.grade,
                    }));
                    this.map.updateTypes(items);
                    let t = items.sort((a, b) => a.value - b.value).filter((e, i) => i < 5);

                    this.chartEventType.update(t);
                }
            });
        },
        getAttackProvince(day = 7) {
            axios(ref.attackProvince + day).then((res) => {
                if (res.success) {
                    let data = res.data;
                    let cloneData = JSON.parse(JSON.stringify(data));
                    // top5
                    const spliceLen = 5;
                    if (data.length > spliceLen) {
                        data.splice(spliceLen);
                    }
                    const items = data
                        .map((elem) => ({
                            value: elem.total,
                            name: elem.province,
                        }))
                        .sort((a, b) => b.value - a.value);
                    if (!items[0]) return false;
                    const cityName = items[0].name;
                    if (!this.selectCity) {
                        for (const key in this.cityIdArr) {
                            const elem = this.cityIdArr[key];
                            if (elem.indexOf(cityName) != -1) {
                                this.selectCity = key;
                                this.getCityData(this.selectDay, this.selectCity);
                                continue;
                            }
                        }
                    } else {
                        this.getCityData(this.selectDay, this.selectCity);
                    }
                    this.chartDayTop5.update(items);
                    //地图数据
                    setTimeout(() => {
                        this.map.update(cloneData);
                    }, 1000);

                    //地图 左下角
                }
            });
        },
        getDailyStat(day = 7) {
            axios(ref.dailyStat + day).then((res) => {
                if (res.success) {
                    var newEvent = []; //新增事件
                    var newCar = []; //新增车辆
                    var cartTotal = []; //车辆累计总数
                    var eventTotal = []; //车辆总数
                    var activeCar = []; // 活跃车辆
                    var typeCars = []; // 车型总数
                    // 0 今日事件新增；1 今日车辆新增；2 车辆累计总数；3 事件累计总数
                    let data = res.data;
                    for (var i = 0; i < data.length; i++) {
                        var elem = data[i];
                        switch (parseInt(elem.type)) {
                            case 0:
                                newEvent.push({
                                    value: elem.total,
                                    name: GetCurrentDate(new Date(elem.stateDate)),
                                });
                                break;
                            case 1:
                                newCar.push({
                                    value: elem.total,
                                    name: GetCurrentDate(new Date(elem.stateDate)),
                                });
                                break;
                            case 2:
                                cartTotal.push({
                                    value: elem.total,
                                    name: GetCurrentDate(new Date(elem.stateDate)),
                                });
                                break;
                            case 3:
                                eventTotal.push({
                                    value: elem.total,
                                    name: GetCurrentDate(new Date(elem.stateDate)),
                                });
                                break;
                            case 4:
                                activeCar.push({
                                    value: elem.total,
                                    name: GetCurrentDate(new Date(elem.stateDate)),
                                });
                                break;
                            case 5:
                                typeCars.push({
                                    value: elem.total,
                                    name: GetCurrentDate(new Date(elem.stateDate)),
                                });  
                                break;
                        }
                    }
                    // var _cartTotal = this.cartTotal;
                    var obj = {
                        cartTotal: this.cartTotal,
                        newCar: this.newCar,
                        newEventNum: this.newEventNum,
                        eventTotal: this.eventTotal,
                        typeCars: this.typeCars,
                        activeCar: this.activeCar,
                    };
                    var target = {
                        cartTotal: this.widgetVal(cartTotal),
                        newCar: this.widgetVal(newCar),
                        newEventNum: this.widgetVal(newEvent),
                        eventTotal: this.widgetVal(eventTotal),
                        activeCar: this.widgetVal(activeCar),
                        typeCars: this.widgetVal(typeCars)
                    };

                    var animate = new TWEEN.Tween(obj).to(target, 2000).start();

                    animate.onUpdate(() => {
                        this.cartTotal = parseInt(obj.cartTotal);
                        this.newCar = parseInt(obj.newCar);
                        this.newEventNum = parseInt(obj.newEventNum);
                        this.eventTotal = parseInt(obj.eventTotal);
                        this.activeCar = parseInt(obj.activeCar || 0);
                        this.typeCars = parseInt(obj.typeCars || 0);
                    }).onComplete(() => {
                            this.cartTotal = obj.cartTotal;
                            this.newCar = obj.newCar;
                            this.newEventNum = obj.newEventNum;
                            this.eventTotal = obj.eventTotal;
                            this.activeCar = parseInt(obj.activeCar || 0);
                            this.typeCars = parseInt(obj.typeCars || 0);
                        });
                    newEvent = newEvent.map((elem) => {
                        return {
                            value: elem.value,
                            name: elem.name.split(" ")[0],
                        };
                    });
                    this.chartAttackEvent.update(newEvent);
                }
            });
        },
        widgetVal(arr) {
            if (arr.length == 0) return 0;
            return arr[arr.length - 1].value || 0;
        },
        getDeviceData(day = 7) {
            //获取设备数据
            this.attackComponents = [...new Array(4)].map(function (elem) {
                return {
                    nameL: "",
                    value: "",
                    date: "",
                    id: "",
                };
            });
            axios(ref.eventDataDevice + day).then((res) => {
                if (res.success) {
                    let data = res.data;
                    this.attackComponents = data.map(function (elem) {
                        return {
                            name: elem.name,
                            value: elem.total,
                            date: elem.stateDate,
                            id: elem.id,
                        };
                    });
                    if (this.attackComponents.length > 5) {
                        this.attackComponents.splice(5, this.attackComponents.length);
                    }
                    // this.attackComponents = this.attackComponents.sort((a,b)=>a.value-b.value);
                    this.parts.update(this.attackComponents);
                }
            });
        },
        getCityData(day = 7, provinceId) { 
            this.attackMapList = [];
            axios(ref.eventDataCity + day + "?provinceId=" + provinceId).then((res) => {
                if (res.success) {
                    let data = res.data;
                    if (Array.isArray(data) && data.length >= 0) {
                        data.forEach((elem) => {
                            this.attackMapList.push({
                                srcName: elem.city,
                                // type: data.type,
                                date: GetCurrentDate(new Date(elem.stateDate)),
                                total: elem.total,
                                id: elem.id,
                            });
                        });
                    }
                    if (this.attackMapList.length > 5) {
                        this.attackMapList.splice(5, this.attackMapList.length - 1);
                    }
                }
            });
        },
        getCarModels(day = 7, provinceId) {
            this.attackMapList = [];
            // "?provinceId=" + provinceId
            axios(ref.eventdataStatModel + day).then((res) => {
                if (res.success) {
                    let data = res.data;
                    const vals = data.map(elem => {
                        return {
                            name: elem.model.name,
                            value: elem.total
                        }
                    });
                    this.carModelsEvent.update(vals);
                }
            });
        },
        setMapAttackTop(data) {
            //地图左下 Top5
            data = data || [];
        },
        tipsMoveUp(cont, event) {
            var config = {
                x: event.clientX,
                y: event.clientY - 95
            }
            setTips(cont, config)
        },
        tipsMoveOut() {
            removeTips()
        }
    },
    watch: {
        selectCity(val) {
            if (this.cityIdArr[val]) {
                this.cityNameTitle = this.cityIdArr[val]; 
            }
        },
        eventTotal(val) {
            if (val > 99999999){
                this.eventToTotal = Math.floor(val / 10000) + '万'
            }else{
                this.eventToTotal = val;
            }
        }
    }
});

function GetCurrentDate(date) {
    var y = date.getYear() + 1900;
    var month = add_zero(date.getMonth() + 1),
        days = add_zero(date.getDate()),
        hours = add_zero(date.getHours());
    var minutes = add_zero(date.getMinutes()),
        seconds = add_zero(date.getSeconds());
    var str = y + "-" + month + "-" + days + " " + hours + ":" + minutes + ":" + seconds;

    function add_zero(temp) {
        if (temp < 10) {
            return "0" + temp;
        }
        return temp;
    }
    return str;
}

//tips
function creatTips(container) {
    var tmp = {
        tipCont: '<div id="GM_tips"></div>',
        icon: "<i></i>",
        txt: '<span id="DM_txt"></span>',
        bage: "<div></div>",
    };
    var tipcont = $(tmp.tipCont).css({
        position: "absolute",
        left: "0",
        top: "0",
        display: "none",
        "z-index": "30000",
    });
    tipcont.append(
        $(tmp.bage).css({
            position: "absolute",
            background: "#000",
            opacity: "0.3",
            "border-radius": "5px",
            height: "100%",
            width: "100%",
        })
    );
    tipcont.append(
        $(tmp.bage)
            .css({
                position: "relative",
                padding: "4px 6px",
                color: "#fff",
                "font-size": "12px",
                "margin-left": "10px",
            })
            .append(
                $(tmp.icon).css({
                    border: "3px solid #fff",
                    position: "absolute",
                    left: "-2px",
                    "margin-top": "6px",
                    "border-radius": "3px",
                })
            )
            .append(
                $(tmp.txt)
                    .css({
                        position: "relative",
                        padding: "4px 6px",
                        color: "#fff;",
                        "font-size": "12px",
                    })
                    .html("")
            )
    );
    tipconts = tipcont;
    $(container).append(tipcont);
}

function removeTips() {
    tipconts.css("display", "none");
    tipconts.find("span#DM_txt").html("");
}

function setTips(conts, position) {
    tipconts.css({
        left: position.x,
        top: position.y,
        display: "block",
    });
    tipconts.find("span#DM_txt").html(conts);
}