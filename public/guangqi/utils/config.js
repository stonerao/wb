window._Config = {
    // 颜色
    title: "汽车网络安全态势感知",
    sort: "序号", // 序号
    vin: "VIN",
    code: "设备编号",
    ip: "攻击IP",
    attackType: "攻击类型",
    carIn: "车辆位置",
    date: "时间",
    target: "攻击位置",
    scrollList: "攻击滚动实时展示列表",
    eventType: "攻击类型排行TOP5", //安全事件类型,
    attackEvent: "攻击趋势(次)", //攻击事件
    overview: "安全总览", //概览
    component: "零部件", // 零部件
    targetTop5: "被攻击排行TOP5", //被攻击区域TOP5
    carTotal: "车辆总数",
    dayAdd: "今日新增车辆",
    eventTotal: "累计攻击次数",
    dayEvent: "今日攻击次数",
    activeCar: " 今日活跃车辆",
    typeCar: "车型总数",
    carModelTotal: "车型",

    // 颜色类型
    // 攻击类型排行 颜色配置
    attackTypeConfig: {
        color: "#4081ff",
        dstColor: "#65bef5",
        barWidth:13
    },
    // 被攻击排行TOP5
    attackSort: {
        color: "#ff8d36",
        dstColor: "#ffea61",
        barWidth: 13
    },
    // 零部件
    partsConfig: {
        color: "#ff8d36",
        dstColor: "#ffea61",
        barWidth: 13
    },
    // 车型
    carModelsEvent: {
        color: "#4081ff",
        dstColor: "#65bef5",
        barWidth: 13
    },
    // 攻击趋势
    attacktrend:{
        // 线条颜色
        itemStyle: {
            normal: {
                color: "#1effd2"
            },
            emphasis: {
                color: 'rgb(0,196,132)',
                borderColor: 'rgba(0,196,132,0.2)',
                extraCssText: 'box-shadow: 8px 8px 8px rgba(0, 0, 0, 1);',
                borderWidth: 10
            }
        },
        // 面积颜色
        areaStyle: {
            color1: 'rgba(30,254,209,0.3)',
            color2: 'rgba(30,254,209,0.3)',
            shadowColor: 'rgba(53,142,215, 0.9)', //阴影颜色
        }

    },
    // 城市切换时间
    cityTime: 3000,
    // 数据更新时间
    dataTime: 6000,

    selectDay: 7,// 最近选择天数

    updateListTime: 1000 , // 列表更新时间

};

/**
 * 地图颜色配置
 * value 参数超过当前使用当前颜色
 */
window._ColorConfig = [
    {
        value: 0,
        color: "#cddcd9",
    },
    {
        value: 2000,
        color: "#9ce0d4",
    },
    {
        value: 5000,
        color: "#e2d763",
    },
    {
        value: 10000,
        color: "#fbab53",
    },
    {
        value: 15000,
        color: "#fa8737",
    },
    {
        value: 30000,
        color: "#ff6f5b",
    }
];
/**
 * 地图字体颜色等级
 * value 超过颜色等级
 */
window._ColorFontConfig = [
    {
        value: 0,
        color: "#ffffff",
    },
    {
        value: 400,
        color: "#ff4200",
    },
    {
        value: 1000,
        color: "#ff0000",
    }
];
