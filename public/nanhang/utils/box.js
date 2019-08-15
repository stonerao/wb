(function (global, factory) {
    global.DevThree = factory()
}(this, function () {
    function isObject(obj) {
        return obj !== null && typeof obj === 'object'
    }

    function isString(str) {
        return typeof str === "string";
    }

    function cloneJson(obj) {
        if (this.isObject(obj)) {
            return JSON.parse(JSON.stringify(obj))
        } else {
            console.warn("data not is object or array")
            return obj
        }
    }

    function remove(arr, item) {
        if (arr.length) {
            var index = arr.indexOf(item);
            if (index > -1) {
                return arr.splice(index, 1)
            }
        }
    }

    function hasOwn(obj, key) {
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        return hasOwnProperty.call(obj, key)
    }

    function setOption(options, data) {
        /* 改变对象中的参数 */
        if (!isObject(options)) {
            return console.warn("参数不是对象")
        } else {
            for (let key in data) {
                if (hasOwn(options, key)) {
                    options[key] = data[key]
                }
            }
        }
    }

    function setConfig(conf, vals) {
        var _keys = Object.keys(vals)
        for (var key in conf) {
            // if is object
            if (_keys.includes(key)) {
                var isNull = conf[key] === null
                if (typeof conf[key] === 'object' && !Array.isArray(conf[key]) && !isNull) {
                    setConfig(conf[key], vals[key])
                } else {
                    conf[key] = vals[key]
                }
            }

        }
    }

    function objectsToNumber(data) {
        // tranform number
        for (var key in data) {
            var _node = data[key]
            if (_node === undefined || _node === null || isNaN(parseFloat(_node))) {
                data[key] = 0;
            } else {
                data[key] = typeof _node === 'number' ? _node : parseFloat(_node)
            }
        }
        return data;
    }
    var scene, camera, controls;
    var transformControl, stats;
    var options = Object.assign({}, {
        parentDom: null,
        canvas: null,
    })
    var DragMeshs = [];
    var currMesh = null
    //page config
    var config = {
        id: null, //id
        click: null, //click event
        mousemove: null, //mouse move event 
        resize: null, //docuemnt resize event
        isResize: true, //document is resize
        controls: {
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
        },
        camera: {
            position: {
                x: 0,
                y: 0,
                z: 190
            },
            ratatoion: {
                x: 0,
                y: 0,
                z: 0
            }
        }, //camera options 
        created: null, //创建完毕执行方法
        renderer: {
            background: "", //color
            alpha: true, //Boolean
            antialias: true, //Boolean
        },
        stats: false, //Fps
        transformControls: false, //拖
        grid: false
    }

    function onMouse(event) {
        var canvas = options.canvas;
        event.preventDefault();
        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - canvas.getBoundingClientRect().left) / canvas.offsetWidth) * 2 - 1;
        mouse.y = -((event.clientY - canvas.getBoundingClientRect().top) / canvas.offsetHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(scene.children);
        return intersects;
    }

    function onMouseUp(event) {
        var intersects = onMouse(event)
        typeof config.click === 'function' ? config.click(intersects) : null;
    }

    function onMouseMove(event) {
        var intersects = onMouse(event)
        typeof config.mousemove === 'function' ? config.mousemove(intersects) : null;
    }

    function onWindoResize() {
        //resize  
        camera.aspect = options.parentDom.clientWidth / options.parentDom.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(options.parentDom.clientWidth, options.parentDom.clientHeight);
    }

    function controlsEvent() {
        console.log(THREE.OrbitControls)
        if (!THREE.OrbitControls || !config.controls.run) {
            config.controls.run = false;
            return
        }
        var {
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
        } = config.controls
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
        if (config.transformControls) {
            controls.addEventListener('start', function () {
                cancelHideTransform();
            });

            controls.addEventListener('end', function () {
                delayHideTransform();

            });

            transformControl = new THREE.TransformControls(camera, renderer.domElement);
            // transformControl.addEventListener('change', render);
            transformControl.addEventListener('dragging-changed', function (event) {
                controls.enabled = !event.value;

            });
            scene.add(transformControl);

            // Hiding transform situation is a little in a mess :()
            transformControl.addEventListener('change', function (o) {

                if (currMesh) {
                    if (currMesh._type === "drag") {
                        /* scene.children.forEach(node=>{ 
                            if (node.type == "LineSegments") {  
                                node.position.x = currMesh.position.x
                                node.position.y = currMesh.position.y  
                                node.position.z = currMesh.position.z
                                node.update()
                            }
                        }) */
                        DragMeshs.forEach(x => {
                            if (x.uuid === currMesh._target) {
                                x.position.x = currMesh.position.x
                                x.position.y = currMesh.position.y - x.options.y / 2
                                x.position.z = currMesh.position.z
                            }
                        })
                        /* */
                    } else if (currMesh._type === "dragLine") {
                        var parent = currMesh.parent;
                        let drags = parent.children.filter(x => x._type === currMesh._type)
                        let line = parent.children.filter(x => x._type !== currMesh._type)
                        var positions = drags.map(elem => {
                            return new THREE.Vector3(...Object.values(elem.position))
                        })
                        var curve = new THREE.CatmullRomCurve3(positions);
                        var points = curve.getPoints(200);
                        line[0].geometry.setFromPoints(points);
                    }
                }
                cancelHideTransform();
            });

            transformControl.addEventListener('mouseDown', function () {

                cancelHideTransform();

            });

            transformControl.addEventListener('mouseUp', function () {

                delayHideTransform();

            });

            transformControl.addEventListener('objectChange', function () {

            });
            var dragcontrols = new THREE.DragControls(DragMeshs, camera, renderer.domElement); //
            dragcontrols.enabled = false;
            dragcontrols.addEventListener('hoveron', function (event) {
                transformControl.attach(event.object);
                currMesh = event.object
                cancelHideTransform();
            });

            dragcontrols.addEventListener('hoveroff', function () {
                delayHideTransform();

            });

            var hiding;

            function delayHideTransform() {
                cancelHideTransform();
                hideTransform();
            }

            function hideTransform() {
                hiding = setTimeout(function () {
                    transformControl.detach(transformControl.object);
                }, 2000);

            }

            function cancelHideTransform() {
                if (hiding) {
                    clearTimeout(hiding);
                }
            }
        }

        if (config.stats) {
            stats = new Stats();
            options.parentDom.appendChild(stats.dom);
        }

    }


    function initMixin(Dev) {
        // initital options
        Dev.prototype._init = function (params) {
            // if options has id
            if (!hasOwn(params, "id")) {
                return console.error("options lack id")
            }
            // page init  
            // set options
            // config_setControls()
            // camera

            if (hasOwn(params, 'camera')) {
                if (!hasOwn(params.camera, 'position')) {
                    Object.defineProperty(params.camera, 'position', {
                        value: {
                            x: 0,
                            y: 400,
                            z: 400
                        },
                        enumerable: true,
                        writable: true
                    })
                } else {
                    objectsToNumber(params.camera.position)
                }
                if (!hasOwn(params.camera, 'ratatoion')) {
                    Object.defineProperty(params.camera, 'ratatoion', {
                        value: {
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        enumerable: true,
                        writable: true
                    })
                } else {
                    objectsToNumber(params.camera.ratatoion)
                }

            }
            // set configs
            setConfig(config, params)

            //create initCanvas
            initCanvas(config.id)
            initRenderer(DevThree);
            //registered event 
            if (typeof config.click === 'function') {
                options.canvas.addEventListener("mouseup", onMouseUp)
            }
            if (typeof config.mousemove === 'function') {
                options.canvas.addEventListener("mousemove", onMouseMove)
            }
            if (config.isResize) {
                window.addEventListener("resize", onWindoResize)
            }

        }
    }

    function initEvents(Dev) {
        Dev.prototype.dispose = function () {
            //  removeEventListener
            if (typeof config.click === 'function') {
                options.canvas.removeEventListener("mouseup", onMouseUp)
            }
            if (typeof config.mousemove === 'function') {
                options.canvas.removeEventListener("mousemove", onMouseMove)
            }
            if (config.isResize) {
                window.removeEventListener("resize", onWindoResize)
            }
        }

    }

    function initCanvas(id) {
        options.parentDom = document.getElementById(id)
        if (options.parentDom === null) {
            throw "没有选择DOM元素 function:initCanvas"
        }
        options.parentDom.innerHTML = ""
        width = options.parentDom.clientWidth;
        height = options.parentDom.clientHeight;
        options.canvas = document.createElement("canvas");
        options.canvas.width = width;
        options.canvas.height = height
        options.parentDom.appendChild(options.canvas);
        return options.canvas
    }

    function created() {
        if (typeof config.created === 'function') {
            setTimeout(() => {
                config.created({
                    scene,
                    renderer,
                    camera,
                    DragMeshs
                })
            })
        }
    }


    function initRenderer() {
        var canvas = options.canvas
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            canvas: canvas
        });
        var width = canvas.clientWidth
        var height = canvas.clientHeight
        renderer.setPixelRatio(window.devicePixelRatio);
        // renderer.setClearColor('#011D42', 0.8);
        // renderer.setClearColor(0x021835);
        renderer.setSize(width, height);
        // renderer.setClearAlpha(0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.gammaInput = true;
        renderer.gammaOutput = true
        //scene
        scene = new THREE.Scene();
        //camera
        camera = new THREE.PerspectiveCamera(45, width / height, 1, 100000);
        camera.position.set(...Object.values(config.camera.position));
        camera.rotation.set(...Object.values(config.camera.ratatoion));
        camera.lookAt(scene.position);
        scene.add(camera)
        // light
        /* 	var ambient = new THREE.AmbientLight(0xffffff, 0.5);
        	scene.add(ambient) */

    }

    var group
    var group1
    var group2

    function initGrid() {
        if (config.grid) {
            var size = 10000;
            var divisions = 100;

            var gridHelper = new THREE.GridHelper(size, divisions);
            scene.add(gridHelper);
        }


        var light = new THREE.AmbientLight(0xffffff); // soft white light
        scene.add(light);
        /* var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
        scene.add( directionalLight ); */
        var light = new THREE.PointLight(0x2e60c5, 1, 100);
        light.position.set(30, 50, 50);
        var spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(100, 500, 100);

        spotLight.castShadow = true;

        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;

        spotLight.shadow.camera.near = 500;
        spotLight.shadow.camera.far = 4000;
        spotLight.shadow.camera.fov = 20;
        scene.add(spotLight);
        scene.add(light);
        group = addGroup()
        group1 = addGroup()
        group1.position.set(-120, 30, -30)
        group1.scale.set(0.8, 0.8, 0.8)
        group2 = addGroup()
        group2.position.set(100, 30, -30)
        group2.scale.set(0.8, 0.8, 0.8)
    }

    function addGroup() {
        var group = new THREE.Group()
        var geometry = new THREE.BoxBufferGeometry(50, 50, 50);
        var material = new THREE.MeshPhongMaterial({
            color: 0x255dcf,
            opacity: 0.3,
            transparent: true
        });

        var cube = new THREE.Mesh(geometry, material);
        var materialLine = new THREE.LineBasicMaterial({
            color: 0x6f85b1,
        });
        var box = new THREE.BoxHelper(cube, 0xffff00);
        //  group.add(box); 
        group.add(cube)
        cube.rotation.x = Math.PI / 4
        // cube.rotation.z = Math.PI / 4
        scene.add(group);
        var geo = new THREE.Geometry();
        let arr = cube.geometry.attributes.position.array
        var vert = 25;
        geo.vertices.push(
            new THREE.Vector3(vert, vert, vert),
            new THREE.Vector3(-vert, vert, vert),
            new THREE.Vector3(-vert, -vert, vert),
            new THREE.Vector3(vert, -vert, vert),
            new THREE.Vector3(vert, vert, vert),
            new THREE.Vector3(vert, vert, -vert),
            new THREE.Vector3(vert, -vert, -vert),
            new THREE.Vector3(vert, -vert, vert),
            new THREE.Vector3(vert, -vert, -vert),
            new THREE.Vector3(-vert, -vert, -vert),
            new THREE.Vector3(-vert, -vert, vert),
            new THREE.Vector3(-vert, vert, vert),
            new THREE.Vector3(-vert, vert, -vert),
            new THREE.Vector3(-vert, -vert, -vert),
            new THREE.Vector3(-vert, vert, -vert),
            new THREE.Vector3(vert, vert, -vert),
        );

        var line = new THREE.Line(geo, materialLine);
        group.add(line);
        line.rotation.x = Math.PI / 4



        var geometry = new THREE.PlaneBufferGeometry(vert * 2, vert * 2.83, 32);
        var material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            opacity: 0.5,
            //    transparent:true  
        });
        var plane = new THREE.Mesh(geometry, material);
        group.add(plane);
        // line.rotation.z = Math.PI / 4
        group.rotation.z = Math.PI / 4
        return group;
    }

    function DevThree(options) {
        this._init(options)
        controlsEvent()
        render()
        created()
        initGrid()
    }

    function render() {
        if (config.controls.run) {
            controls.update();
        }
        if (stats) {
            stats.update();
        }
        if (group) {
            group.rotation.y += 0.008
            // group.rotation.z += 0.005 
        }
        if (group1) {
            group1.rotation.y += 0.008
            // group.rotation.z += 0.005 
        }
        if (group2) {
            group2.rotation.y += 0.008
            // group.rotation.z += 0.005 
        }
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    initMixin(DevThree);
    initEvents(DevThree)

    return DevThree
}))