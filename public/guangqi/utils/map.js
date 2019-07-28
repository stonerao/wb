var initMap = function ({
    geo, dom, svg
}) {
    //生成地图
    var _this = this;
    var scene, camera, controls, renderer;
    var transformControl, stats;
    var width, height;
    this.currDom = dom;
    this.currCanvas = null;
    this.projection;
    var options = Object.assign({}, {
        parentDom: null,
        canvas: null,
    })
    var groups = [];
    var currMesh = null;
    var cameraOption = {/*  */
        position: {
            x: 122,
            y: 400,
            z: 400
        },
        ratatoion: {
            x: 0,
            y: 0,
            z: 0
        }
    }
    var controls = {
        run: true, //是否运行
        enableDamping: true, //动态阻尼系数 就是鼠标拖拽旋转灵敏度
        dampingFactor: true, //动态阻尼系数 就是鼠标拖拽旋转灵敏度
        enableZoom: true, ////是否可以缩放
        minDistance: 0, //设置相机距离原点的最远距离
        maxDistance: 3000, //设置相机距离原点的最远距离
        enablePan: true, ////是否开启右键拖拽
        enableRotate: true,
        autoRotate: false, //自动旋转
        autoRotateSpeed: 1,
        enabled: true,
    }
    var renderer = {
        background: 0x000000, //color
        alpha: true, //Boolean
        antialias: true, //Boolean
    }
    this.init = function () {
        width = _this.currDom.clientWidth;
        height = _this.currDom.clientHeight;
        _this.currCanvas = document.createElement("canvas");
        _this.currCanvas.width = width;
        _this.currCanvas.height = height;
        _this.currDom.appendChild(_this.currCanvas);

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            canvas: _this.currCanvas
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(renderer.background);
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.gammaInput = true;
        renderer.gammaOutput = true
        //scene
        scene = new THREE.Scene();
        //camera
        camera = new THREE.PerspectiveCamera(45, width / height, 1, 100000);
        camera.position.set(...Object.values(cameraOption.position));
        camera.rotation.set(...Object.values(cameraOption.ratatoion));
        camera.lookAt(scene.position);
        scene.add(camera)
        console.log(scene)
    }
    this.initGeo = function () {
        var geometry = new THREE.BoxBufferGeometry(111, 111, 111);
        var material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        var cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
    }
    this.controlsEvent = function ({
        autoRotate,
        autoRotateSpeed,
        dampingFactor,
        enableDamping,
        enabled,
        enablePan,
        enableRotate,
        enableZoom,
        maxDistance,
        minDistance
    }) {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enabled = enabled;
        controls.enableDamping = enableDamping;
        //动态阻尼系数 就是鼠标拖拽旋转灵敏度
        controls.dampingFactor = dampingFactor;
        //是否可以缩放
        controls.enableZoom = enableZoom;
        //是否自动旋转controls.autoRotate = true; 设置相机距离原点的最远距离
        controls.minDistance = minDistance;
        //设置相机距离原点的最远距离
        controls.maxDistance = maxDistance;
        //是否开启右键拖拽
        controls.enablePan = enablePan;
        controls.enableRotate = enableRotate;
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = autoRotateSpeed;

    }
    this.initLight = function (path) {
        var light = new THREE.AmbientLight(0x404040); // soft white light
        scene.add(light);
    }
    function svgGroup() {
        var boxs = new THREE.Group();
        groups.forEach(node => {
            let n = node.clone()
            groups.push(n)
            boxs.add(n)
        })
        var box = new THREE.Box3().expandByObject(boxs);
        var bx = box.max.x - box.min.x,
            by = box.max.y - box.min.y,
            bz = box.max.z - box.min.z;

        /*  setTimeout(() => {
             boxs.children.forEach(node => {
                 let position = node.geometry.boundingSphere.center
                 addCube([position.x, position.z, position.y], node.geometry.boundingSphere
                     .radius)
             })
         }) */
        // cube.position.set(-bx / 2, -by / 2, -bz / 2);
        /* boxs.position.set(bx / 2, by / 2, bz / 2);
        scene.add(boxs) 
        boxs.children.forEach((x)=>{ 
        }) */
    }
    var optionsE = {
        depth: 4,
        bevelThickness: 0,
        bevelSize: 0,
        bevelEnabled: true,
        bevelSegments: 0,
        curveSegments: 1,
        steps: 1,
    };
    function initSvg(path, status) {
        //生成2d图形 
        var shape = new THREE.ExtrudeGeometry(drawShape(), optionsE)
        shape.applyMatrix(new THREE.Matrix4().makeTranslation(-450, -300, 0));
        var material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(
                `rgb(${~~(Math.random() * 250)},${~~(Math.random() * 250)},${~~(Math.random() * 250)})`
            ),
            flatShading: THREE.FlatShading,
            transparent: true,
            opacity: 1
        });
        var shape = new THREE.Mesh(shape, material);

        function drawShape() {
            var svgString = path
            var shape = transformSVGPathExposed(svgString);
            // 返回shape
            console.log(shape)
            return shape;
        }
        // shape.rotation.x = -Math.PI / 4;
        shape.rotation.x = Math.PI / 2;
        shape.position.y = 0
        // shape.rotation.y = Math.PI/2;
        scene.add(shape);
        shape.userData.type = "path"
        // groups.push(shape)
        /* if (status) {
            setTimeout(() => {
                svgGroup()
            })
        } */
    }

    this.initSvg = function () {
        var whileArr = [7];
        var series = testData.series;
        var paths = document.querySelectorAll("path");
        
       /*  paths.forEach((path, i) => {
            var status = false
            if (i == paths.length - 1) {
                status = true
            }
            initSvg(path.getAttribute("d"), status)
        }) */
    //    series.forEach((x, i) => {
    //       /*   console.log(i)
    //         initSvgMap(x.path) */
    //        initSvg(x.path, false)
    //     }) 
        // function di(arr){
        //     if(arr.length==0){
        //         return
        //     }
        //     var obj = arr.pop();
        //     initSvgMap(obj.path)
        //     setTimeout(()=>{
        //         di(arr)
        //     },2000)
        // }
        // di(series)
        _this.projection = d3.geoMercator().fitExtent([[0, 0], [width, height]], geo);
        // path
        var path = d3.geoPath().projection(_this.projection);
        // var svg = d3.select(document.createElement("svg"));
        var svg = d3.select("#svg").append("svg");
        var svgGroup = svg.append('g');
        var svgps = []
        var whileArr = [7];
        var allPath = svgGroup.selectAll("path")
            .data(geo.features)
            .enter()
            .append("path")
            .attr("d", (d, i) => {
                // svgps.push(path(d)) 
                console.log(d)
               
                initSvg(path(d)) 
                
                return path(d)
            })
            .attr("stroke", "#009CFF")
            .attr("stroke-width", 1)
            .attr("fill", function (d, i) {
                return "#fff0";
            })

        var paths = document.querySelectorAll("path"); 
        paths.forEach((path, i) => {  

        })
    }
    this.load = function () {
        this.init();
        this.initLight()
        this.controlsEvent(controls);
        this.initSvg();
        // this.initGeo();
        render();
    }
    this.load();

    function render() {
        if (controls) controls.update();
        if (stats) stats.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

}