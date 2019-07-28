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
            x: 0,
            y: 750,
            z: 300
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
    var sceneOptions = {
        tags: {
            fontColor: "RGBA(200,223,249,.9)",
            fontSize: 1.8,
        },
        sceneStyle: {
            blockColor: "rgb(27,46,94)",
            blockHeight: 1,

            borderColor: "rgb(53,110,195)",
            borderWidth: 2,
        },
        texture: {
        },
        outerGlow: {
            glowColor: "rgba(22,71,121,.9)",
            size: 1,
            perTime: 2,
        }
    }
    var _Shaders = {
        SplineVShader: [
            "uniform vec3 u_color; uniform float u_opacity; uniform float u_width;",
            "attribute float cRatio; attribute vec3 cPosition; varying vec4 vColor; ",
            " varying vec2 vUv; void main() { ",
            "vec3 nPosition = position; float k = 20.0;",
            "if ( cRatio>.0 && cRatio<.5 ) { nPosition.y = u_width; } ",
            "if ( cRatio>.5 && cRatio<1.5 ) { nPosition = cPosition*u_width+position; } ",
            // 2
            "if ( cRatio>1.5 && cRatio<2.5 ) { nPosition = -cPosition*u_width/2.0+position; } ",
            "if ( cRatio>-2.5 && cRatio<-1.5 ) { nPosition = cPosition*u_width/2.0+position; } ",
            // 3
            "if ( cRatio>2.5 && cRatio<3.5 ) { ",
            "nPosition = -cPosition*k+position; nPosition.y = u_width/2.0; } ",
            "if ( cRatio>-3.5 && cRatio<-2.5 ) { ",
            "nPosition = cPosition*k+position; nPosition.y = -u_width/2.0; } ",
            // 4
            "if ( cRatio>3.5 && cRatio<4.5 ) { ",
            "nPosition = -cPosition*k+position; nPosition.y = -u_width/2.0; } ",
            "if ( cRatio>-4.5 && cRatio<-3.5 ) { ",
            "nPosition = cPosition*k+position; nPosition.y = u_width/2.0; } ",

            "vColor = vec4( u_color, u_opacity ); vUv = uv;",
            "vec4 mP = modelViewMatrix * vec4( nPosition, 1.0 ); ",
            "gl_Position = projectionMatrix * mP; } "
        ].join("\n"),
        SpreadVShader: [
            'uniform vec3 u_color; uniform float u_opacity; uniform float u_time; ',
            'attribute float cRatio; attribute vec3 position2; varying vec4 vColor; ',
            'varying vec2 vUv; void main() {',
            'float _k = cRatio + u_time; ',
            'if ( _k >= 1.0 ) _k -= 1.0; ',
            'vec3 vPos = mix( position, position2, _k );',
            'vColor = vec4( u_color, u_opacity*5.0*(1.0-_k) ); vUv = uv;',
            'gl_Position = projectionMatrix * modelViewMatrix * vec4( vPos, 1.0 );',
            '}'
        ].join("\n"),
        SpotVShader: [
            'uniform vec3 u_color; uniform float u_opacity; uniform float u_size; ',
            'uniform float u_time; attribute float cOffset; varying float vTime; ',
            'varying vec4 vColor; void main() { vTime = u_time + cOffset; ',
            'vColor = vec4( u_color, u_opacity ); ',
            'vec4 mP = modelViewMatrix * vec4( position, 1.0 ); ',
            'gl_PointSize = u_size * 300.0/(-mP.z ); ',
            'gl_Position = projectionMatrix * mP; } ',
        ].join("\n"),
        PointVShader: [
            'uniform vec3 u_color; uniform float u_opacity; uniform float u_size; ',
            'uniform float u_time; uniform float u_len; uniform float u_ratio;',
            'attribute float cSize; attribute float cOpacity; attribute float cId; ',
            'varying vec4 vColor; void main() { float _k = u_ratio + u_time; ',
            'if ( _k >= 1.0 ) _k -= 1.0; ',
            'float _m = u_len*_k, _l = 108.0, _o = 1.0, _s = 1.0; ',
            'if ( cId >= _m-_l && cId <= _m ) { ',
            '	float _n = 1.0+(cId-_m)/_l; ',
            '	_o = 3.6*_n; _s = 2.0*_n; } ',
            'vColor = vec4( u_color, u_opacity * cOpacity *_o ); ',
            'vec4 mP = modelViewMatrix * vec4( position, 1.0 ); ',
            'gl_PointSize = _s * u_size * 300.0/(-mP.z ); ',
            'gl_Position = projectionMatrix * mP; } ',
        ].join("\n"),

        SplineFShader: [
            "varying vec4 vColor; void main() {  gl_FragColor = vColor; } ",
        ].join("\n"),
        SpreadFShader: [
            "uniform sampler2D u_txue; varying vec4 vColor; ",
            "varying vec2 vUv; void main() {  gl_FragColor = vColor * texture2D(u_txue, vUv); } ",
        ].join("\n"),
        SpotFShader: [
            "uniform sampler2D u_txue; varying float vTime; varying vec4 vColor; ",
            "const float pi2 = 6.2831853071795866; void main() { ",
            "float c = cos( vTime * pi2 ); float s = sin( vTime * pi2 ); ",
            "vec2 rotatedUV = vec2( c*(gl_PointCoord.x-.5) + s*(gl_PointCoord.y-.5) + .5,",
            " .5 -c*(gl_PointCoord.y-.5) + s*(gl_PointCoord.x-.5) );",

            "gl_FragColor = vColor * texture2D( u_txue, rotatedUV ); } ",
        ].join("\n"),
        PointFShader: [
            "uniform sampler2D u_txue; varying vec4 vColor; void main() { ",
            "gl_FragColor = vColor * texture2D( u_txue, gl_PointCoord ); } ",
        ].join("\n"),
    };
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
        // renderer.setClearColor(renderer.background);
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

        // White directional light at half intensity shining from the top.
        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        scene.add(directionalLight);
        var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
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
        depth: 20,
        bevelThickness: 0,
        bevelSize: 0,
        bevelEnabled: true,
        bevelSegments: 0,
        curveSegments: 1,
        steps: 1,
    };
    var svgGroups = new THREE.Group();
    svgGroups.rotation.x = Math.PI / 2;
    svgGroups.position.y = 0;
    svgGroups.position.x = -10;
    svgGroups.position.z = -110;
    function reverse(c) { if (!THREE.ShapeUtils.isClockWise(c)) c = c.reverse(); }
    function getBevelVec(inPt, inPrev, inNext) {
        var v_trans_x, v_trans_y, shrink_by = 1;

        var v_prev_x = inPt.x - inPrev.x, v_prev_y = inPt.y - inPrev.y,
            v_next_x = inNext.x - inPt.x, v_next_y = inNext.y - inPt.y,
            v_prev_lensq = (v_prev_x * v_prev_x + v_prev_y * v_prev_y),
            collinear0 = (v_prev_x * v_next_y - v_prev_y * v_next_x);

        if (Math.abs(collinear0) > Number.EPSILON) {
            var v_prev_len = Math.sqrt(v_prev_lensq);
            var v_next_len = Math.sqrt(v_next_x * v_next_x + v_next_y * v_next_y);

            var ptPrevShift_x = (inPrev.x - v_prev_y / v_prev_len),
                ptPrevShift_y = (inPrev.y + v_prev_x / v_prev_len),
                ptNextShift_x = (inNext.x - v_next_y / v_next_len),
                ptNextShift_y = (inNext.y + v_next_x / v_next_len);

            var sf = ((ptNextShift_x - ptPrevShift_x) * v_next_y -
                (ptNextShift_y - ptPrevShift_y) * v_next_x) / (v_prev_x * v_next_y - v_prev_y * v_next_x);

            v_trans_x = (ptPrevShift_x + v_prev_x * sf - inPt.x);
            v_trans_y = (ptPrevShift_y + v_prev_y * sf - inPt.y);

            var v_trans_lensq = (v_trans_x * v_trans_x + v_trans_y * v_trans_y);

            if (v_trans_lensq <= 2) {
                return new THREE.Vector2(v_trans_x, v_trans_y);
            } else { shrink_by = Math.sqrt(v_trans_lensq / 2); }

        } else {

            var direction_eq = false;
            if (v_prev_x > Number.EPSILON) {
                if (v_next_x > Number.EPSILON) direction_eq = true;
            } else {
                if (v_prev_x < - Number.EPSILON) {
                    if (v_next_x < - Number.EPSILON) direction_eq = true;
                } else {
                    if (Math.sign(v_prev_y) === Math.sign(v_next_y)) direction_eq = true;
                }
            }

            if (direction_eq) {
                v_trans_x = - v_prev_y;
                v_trans_y = v_prev_x;
                shrink_by = Math.sqrt(v_prev_lensq);
            } else {
                v_trans_x = v_prev_x;
                v_trans_y = v_prev_y;
                shrink_by = Math.sqrt(v_prev_lensq / 2);
            }
        }

        return new THREE.Vector2(v_trans_x / shrink_by, v_trans_y / shrink_by);
    }
    var creatSplineGeo = function (contour, opts) {
        opts = opts || {};
        contour = contour || [];
        var type = opts.type || 0,

            u1 = (undefined != opts.uRatio) ? opts.uRatio : .4,
            v1 = (undefined != opts.vRatio) ? opts.vRatio : 1;

        var bgeo = new THREE.BufferGeometry();
        reverse(contour);

        var il = contour.length, bevelVecs = [],
            r1 = -.1, r2 = .1, v2 = 1 - v1, u2 = 1 - 2 * u1;

        if (type > 0.5) {
            for (var i = 0, j = il - 2, k = i + 1; i < il; i++ , j++ , k++) {
                if (j === il) j = 0;
                if (k === il) k = 0;
                bevelVecs[i] = getBevelVec(contour[i], contour[j], contour[k]);
            }
            r1 = -type; r2 = type;
        }

        var indices = [], uvs = [], ratios = [],
            positions = [], positions2 = [];

        for (var i = 0; i < il; i++) {
            var ci = contour[i], bv = bevelVecs[i] || new THREE.Vector2();
            bv = bv.clone();

            uvs.push(u1 + u2 * i / il, v1, u1 + u2 * i / il, v2);
            positions.push(ci.x, ci.y, 0, ci.x, ci.y, 0);
            positions2.push(bv.x, 0, bv.y, bv.x, 0, bv.y);

            ratios.push(r1, r2);

            if (i < il - 1) {
                var a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3;
                indices.push(a, b, c, b, d, c);
            }
        }
        indices.push(il * 2 - 2, il * 2 - 1, 0, il * 2 - 1, 1, 0);

        bgeo.setIndex(indices);
        bgeo.addAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        bgeo.addAttribute('cRatio', new THREE.Float32BufferAttribute(ratios, 1));
        bgeo.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        bgeo.addAttribute('cPosition', new THREE.Float32BufferAttribute(positions2, 3));

        return bgeo;
    }
    function initSvg(path, properties) {
        //生成地图
        var draw_s = drawShape();
        var shapeGeo = new THREE.ExtrudeGeometry(draw_s, optionsE)
        shapeGeo.applyMatrix(new THREE.Matrix4().makeTranslation(-450, -300, 0));
        var material = new THREE.MeshLambertMaterial({
            color: new THREE.Color(sceneOptions.sceneStyle.blockColor),
            flatShading: THREE.FlatShading,
            transparent: true,
            // blending: THREE.AdditiveBlending,
            opacity: 0.7
        });
        var shape = new THREE.Mesh(shapeGeo, material);
        function drawShape() {
            var svgString = path
            var shape = transformSVGPathExposed(svgString);
            // 返回shape 
            return shape;
        }
        // shape.position.z -= 1000

        svgGroups.add(shape);
        shape.userData.type = "path"
        // 加载动画
        shape.position.x = projection(properties.cp)[0] * 6;
        shape.position.y = projection(properties.cp)[1] * 6;
        createjs.Tween.get(shape.position, { override: true }).to({ x: 0, y: 0, z: 0 }, 3000, createjs.Ease.linear)

        // 生成轮廓线条

        // 偏移
        var setCenter = {
            x: (width - 68) / 2,
            y: (height - 106) / 2
        }
        draw_s.forEach(elem => {
            var contour = elem.getPoints(6);
            var _lGeo = creatSplineGeo(contour, { type: 1 });
            var bufferGeo = new THREE.BufferGeometry();
            var positions = new Float32Array(contour.length * 3);
            var alphas = new Float32Array(contour.length);
            contour.forEach((x, i) => {
                positions[i * 3] = x.x;
                positions[i * 3 + 1] = x.y;
                positions[i * 3 + 2] = 0;
                alphas[i] = 0;
            })
            bufferGeo.addAttribute('position', new THREE.BufferAttribute(positions, 3));
            var line = new THREE.Mesh(_lGeo, initCoffet.Line1);
            line.position.y -= setCenter.y;
            line.position.x -= setCenter.x;
            line.position.z = -2;
            shape.add(line);
            var cloneLine = new THREE.Mesh(_lGeo, initCoffet.Line2);
            shape.add(cloneLine)
            cloneLine.material.opacity = 0;
            cloneLine.position.z = optionsE.depth;
            cloneLine.position.y -= setCenter.y;
            cloneLine.position.x -= setCenter.x;
            cloneLine.position.z = -2;
        })
        // 生成地区名字
        var cityNameCtx = addCityName("四川");

        
    }
    var initCoffet = {
        Line1: new THREE.ShaderMaterial({
            uniforms: {
                u_color: { value: new THREE.Color(sceneOptions.sceneStyle.borderColor) },
                u_opacity: { value: 0.8 },
                u_width: { value: -2 },
            },
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            // blending: THREE.AdditiveBlending,
            vertexShader: _Shaders.SplineVShader,
            fragmentShader: _Shaders.SplineFShader,
        }),
        Line2: new THREE.ShaderMaterial({
            uniforms: {
                u_color: { value: new THREE.Color(sceneOptions.sceneStyle.borderColor) },
                u_opacity: { value: 0.5 },
                u_width: { value: -2 },
            },
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            // blending: THREE.AdditiveBlending,
            vertexShader: _Shaders.SplineVShader,
            fragmentShader: _Shaders.SplineFShader,
        }),
        createLine: function (_lGeo, op) {

            return
        }
    }
    this.initSvgBox = function () {
        var boxs = new THREE.Group();
        var box = new THREE.Box3().expandByObject(svgGroups);
        var bx = box.max.x - box.min.x,
            by = box.max.y - box.min.y,
            bz = box.max.z - box.min.z;
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
                initSvg(path(d), d.properties)
                if (i == geo.features.length - 1) {
                    console.log(svgGroups)
                }
                return path(d)
            })
            .attr("stroke", "#009CFF")
            .attr("stroke-width", 1)
            .attr("fill", function (d, i) {
                return "#fff0";
            })
        /*   geo.features.forEach((path, i) => {
              var pos = projection(path.properties.cp);
              var geometry = new THREE.BoxGeometry(5, 5, 111);
              var material = new THREE.MeshBasicMaterial({ color: 0x00Fff00 });
              var cube = new THREE.Mesh(geometry, material);
              svgGroups.add(cube)
              cube.position.x = pos[0]
              cube.position.y = pos[1]
              cube.position.z = -111 / 2
          }) */
    }
    function projection(arr) {
        var pos = _this.projection(arr);
        pos = [pos[0] - (width - 68) / 2, pos[1] - (height - 106) / 2]
        return pos
    }
    function addCityName(){
        // 添加城市名字 
        var canvas = document.createElement("canvas");
        canvas.width = Math.pow(2,4);
        canvas.height = Mat.pow(2,4);
        return canvas;
    }
    function addCanvasMesh({
        width = 256,
        height = 256,
        img
    }) {
        //img 转换 canvas
        let canvas = document.createElement('canvas');
        //导入材质
        canvas.width = width;
        canvas.height = height;
        let context = canvas.getContext("2d");
        context.drawImage(img, 0, 0, width, height);
        return canvas
    }
    this.load = function () {
        this.init();
        this.initLight()
        this.controlsEvent(controls);
        scene.add(svgGroups)
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