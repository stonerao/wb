(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
		typeof define === 'function' && define.amd ? define(factory) :
		(global = global || self, global.DevThree = factory());
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
				y: 100,
				z: 100
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
	// 加载图 
	var IMGTexture = [
		new THREE.TextureLoader().load(TextureIMGS.t1),
		new THREE.TextureLoader().load(TextureIMGS.p3),
		new THREE.TextureLoader().load('./img/e1.jpg'),
		new THREE.TextureLoader().load('./img/css_globe_diffuse.jpg'),
		new THREE.TextureLoader().load('./img/em_DISP.jpg'),
		new THREE.TextureLoader().load('./img/em_NRM.jpg'),
		new THREE.TextureLoader().load('./img/em_OCC.jpg')
	];
	var _ShadersP = {
		SpreadFShader: ["uniform sampler2D u_txue; varying vec4 vColor; ", "varying vec2 vUv; void main() {  gl_FragColor = vColor * texture2D( u_txue, vUv ); } "].join("\n"),
		SpreadVShader: ['uniform vec3 u_color; uniform float u_opacity; uniform float u_time; ', 'attribute float cRatio; attribute vec3 position2; varying vec4 vColor; ', 'varying vec2 vUv; void main() {', 'float _k = cRatio + u_time; ', 'if ( _k >= 1.0 ) _k -= 1.0; ', 'vec3 vPos = mix( position, position2, _k );', 'float _o = _k>.8? 5.0*(1.0-_k): _k>.1? 1.0: _k*10.0; ', 'vColor = vec4( u_color, _o*u_opacity ); vUv = uv;', 'gl_Position = projectionMatrix * modelViewMatrix * vec4( vPos, 1.0 );', '}'].join("\n"),
		vertexShader: ['varying vec3	vVertexWorldPosition;', 'varying vec3	vVertexNormal;', 'varying vec4	vFragColor;', 'void main(){', '	vVertexNormal	= normalize(normalMatrix * normal);', //将法线转换到视图坐标系中
			'	vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;', //将顶点转换到世界坐标系中
			'	// set gl_Position', '	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);', '}'
		].join('\n'),
		fragmentShader1: ['uniform vec3	glowColor;', 'uniform float	coeficient;', 'uniform float	power;', 'varying vec3	vVertexNormal;', 'varying vec3	vVertexWorldPosition;', 'varying vec4	vFragColor;', 'void main(){', '	vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;', //世界坐标系中从相机位置到顶点位置的距离
			'	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;', //视图坐标系中从相机位置到顶点位置的距离
			'	viewCameraToVertex	= normalize(viewCameraToVertex);', //规一化
			'	float intensity		= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);', '	gl_FragColor		= vec4(glowColor, intensity);', '}' //vVertexNormal视图坐标系中点的法向量
			//viewCameraToVertex视图坐标系中点到摄像机的距离向量
			//dot点乘得到它们的夹角的cos值
			//从中心向外面角度越来越小（从钝角到锐角）从cos函数也可以知道这个值由负变正，不透明度最终从低到高
		].join('\n'),
		fragmentShader2: ['uniform vec3	glowColor;', 'uniform float	coeficient;', 'uniform float	power;', 'varying vec3	vVertexNormal;', 'varying vec3	vVertexWorldPosition;', 'varying vec4	vFragColor;', 'void main(){', '	vec3 worldVertexToCamera= cameraPosition - vVertexWorldPosition;', //世界坐标系中顶点位置到相机位置到的距离
			'	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldVertexToCamera, 0.0)).xyz;', //视图坐标系中从相机位置到顶点位置的距离
			'	viewCameraToVertex	= normalize(viewCameraToVertex);', //规一化
			'	float intensity		= coeficient + dot(vVertexNormal, viewCameraToVertex);', '	if(intensity > 0.55){ intensity = 0.0;}', '	gl_FragColor		= vec4(glowColor, intensity);', '}' //vVertexNormal视图坐标系中点的法向量
			//viewCameraToVertex视图坐标系中点到摄像机的距离向量
			//dot点乘得到它们的夹角的cos值
			//从中心向外面角度越来越大（从锐角到钝角）从cos函数也可以知道这个值由负变正，不透明度最终从高到低
		].join('\n')
	};

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
			config_setControls()
			// set options
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
		renderer.setClearColor(0x000000);
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



	function initObject(Dev) {
		Dev.prototype.addTransformObj = function (obj) {
			var box = new THREE.Box3();
			//通过传入的object3D对象来返回当前模型的最小大小，值可以使一个mesh也可以使group
			box.expandByObject(obj);
			var materialObj = new THREE.MeshBasicMaterial({
				opacity: 0,
				transparent: true
			});
			DragMeshs.push(obj)
			scene.add(obj)
			obj.options = {}
			let x = obj.options.x = box.max.x - box.min.x
			let y = obj.options.y = box.max.y - box.min.y
			let z = obj.options.z = box.max.z - box.min.z
			var geometry = new THREE.BoxBufferGeometry(x, y, z);
			var cube = new THREE.Mesh(geometry, materialObj);
			cube.position.x = obj.position.x
			cube.position.y = obj.position.y + y / 2
			cube.position.z = obj.position.z
			cube._type = "drag"
			cube._target = obj.uuid
			DragMeshs.push(cube)
			scene.add(cube)
			/*  var box = new THREE.BoxHelper(cube, 0xffff00);
			 scene.add(box); */
		}
	}

	function initGrid() {
		if (config.grid) {
			var size = 10000;
			var divisions = 100;

			var gridHelper = new THREE.GridHelper(size, divisions);
			scene.add(gridHelper);
		}
	}
	var airObj
	var cubebox

	function DevThree(options) {
		this._init(options)
		controlsEvent()
		render()
		created()
		initGrid()

		new THREE.MTLLoader().load('./img/air.mtl', function (materials) {
			materials.preload();
			// instantiate a loader
			var loader = new THREE.OBJLoader().setMaterials(materials);
			// load a resource
			loader.load(
				// resource URL
				'./img/air.obj',
				function (object) {
					airObj = object
					let scale = 1
					airObj.scale.set(scale, scale, scale)
					initEarth()
					initLineAir()


					var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
					var material = new THREE.MeshBasicMaterial({
						color: 0x00ff00,
						opacity: 0.5,
						transparent: 0.5
					});
					cubebox = new THREE.Mesh(geometry, material);
					scene.add(cubebox);
				}
			);
		});


	}
	var EARTH_RADIUS = 6378137.0; //单位M
	var PI = Math.PI;

	function getRad(d) {
		return d * PI / 180.0;
	}

	function getFlatternDistance(lat1, lng1, lat2, lng2) {
		var f = getRad((lat1 + lat2) / 2);
		var g = getRad((lat1 - lat2) / 2);
		var l = getRad((lng1 - lng2) / 2);

		var sg = Math.sin(g);
		var sl = Math.sin(l);
		var sf = Math.sin(f);

		var s, c, w, r, d, h1, h2;
		var a = EARTH_RADIUS;
		var fl = 1 / 298.257;

		sg = sg * sg;
		sl = sl * sl;
		sf = sf * sf;

		s = sg * (1 - sl) + (1 - sf) * sl;
		c = (1 - sg) * (1 - sl) + sf * sl;

		w = Math.atan(Math.sqrt(s / c));
		r = Math.sqrt(s * c) / w;
		d = 2 * w * a;
		h1 = (3 * r - 1) / 2 / c;
		h2 = (3 * r + 1) / 2 / s;
		return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
	}

	function render() {
		if (config.controls.run) {
			controls.update();
		}
		if (stats) {
			stats.update();
		}
		renderer.render(scene, camera);
		requestAnimationFrame(render);

		airIng()
	}
	initMixin(DevThree);
	initEvents(DevThree)
	initObject(DevThree)




	function initEarth() {
		var geometry = new THREE.SphereBufferGeometry(radius + 0.2, 64, 64);
		var material = new THREE.ShaderMaterial({
			uniforms: {
				coeficient: {
					type: "f",
					value: 1.0
				},
				power: {
					type: "f",
					value: 2
				},
				glowColor: {
					type: "c",
					value: new THREE.Color('white')
				}
			},
			vertexShader: _ShadersP.vertexShader,
			fragmentShader: _ShadersP.fragmentShader1,
			blending: THREE.NormalBlending,
			transparent: true,
			depthTest: false,

		});
		var sphere = new THREE.Mesh(geometry, material);
		scene.add(sphere);
		var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
			transparent: true,
			map: IMGTexture[2],
			aoMap: IMGTexture[4],
			displacementMap: IMGTexture[5],
			normalMap: IMGTexture[6],
			opacity: 0.8
		}));
		var meshBg = new THREE.Mesh(new THREE.SphereGeometry(radius + .1, 128, 128), material);
		scene.add(mesh);
		scene.add(meshBg);
	}
	var globeRadius = 110;
	var radius = 110;
	var airLength = 1000
	var globeExtraDistance = 0.05
	var lineMaterial = new THREE.LineBasicMaterial({
		color: 0x323296,
		linewidth: 1,
		transparent: true,
		opacity: 1,
		scale: 1
	});
	var airM = new THREE.MeshBasicMaterial({
		//color: 0x00BFFF,
		side: THREE.DoubleSide,
		map: new THREE.TextureLoader().load('./img/fs2.png'),
		transparent: true
	});
	var airArr = []


	function initLineAir() {
		dataMap.forEach(elem => {
			// 计算当前线路的总长度
			var totalDistance = 0;
			var ps = []
			var psrc = [elem[0][0], elem[0][1]]
			let plat1 = getPosition(...psrc)
			elem.forEach((lineAir, index, arr) => {
				if (index < arr.length - 1) {
					// console.log(index, arr.length)
					const src = [lineAir[0], lineAir[1]]
					const dst = [arr[index + 1][0], arr[index + 1][1]]
					// 当前两点之间的距离
					const distance = getFlatternDistance(...src, ...dst)
					totalDistance += distance;
					let lat1 = getPosition(...src)
					/*
					let lat2 = getPosition((src[0] + dst[0])/2, (src[1] + dst[1])/2, 30)
					let lat3 = getPosition(...dst)
					addAirLine([lat1, lat2, lat3],distance)
					addCube(lat1) 
					addCube(lat3) */
					let {
						points,
						position
					} = getAirPonits(src, dst, airLength)
					addAirLine(position)
					ps = [...ps, ...points]

				}
			})
			addAir(Object.values(plat1), ps)
		})

	}
	var lineHeight = 5

	function getAirPonits(start, end, len = 100) {
		var start_lng = start[0];
		var start_lat = start[1];

		var end_lng = end[0];
		var end_lat = end[1];
		var max_height = Math.random() * lineHeight + 2;

		var points = [];
		var position = []
		var spline_control_points = len;

		for (var i = 0; i < spline_control_points + 1; i++) {

			var arc_angle = i * 180.0 / spline_control_points;

			var arc_radius = radius + 1 + (Math.sin(arc_angle * Math.PI / 180.0)) * max_height;

			var latlng = latlngInterPoint(start_lat, start_lng, end_lat, end_lng, i / spline_control_points);

			var pos = xyzFromLatLng(latlng.lat, latlng.lng, arc_radius);
			points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
			position.push(pos.x, pos.y, pos.z);

		}
		return {
			points,
			position
		};
	}

	function xyzFromLatLng(lat, lng, radius) {
		var phi = (90 - lat) * Math.PI / 180;
		var theta = (360 - lng) * Math.PI / 180;

		return {
			x: radius * Math.sin(phi) * Math.cos(theta),
			y: radius * Math.cos(phi),
			z: radius * Math.sin(phi) * Math.sin(theta)
		};
	}

	function latlngInterPoint(lat1, lng1, lat2, lng2, offset) {
		lat1 = lat1 * Math.PI / 180.0;
		lng1 = lng1 * Math.PI / 180.0;
		lat2 = lat2 * Math.PI / 180.0;
		lng2 = lng2 * Math.PI / 180.0;

		const d = 2 * Math.asin(Math.sqrt(Math.pow((Math.sin((lat1 - lat2) / 2)), 2) +
			Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lng1 - lng2) / 2), 2)));
		const A = Math.sin((1 - offset) * d) / Math.sin(d);
		const B = Math.sin(offset * d) / Math.sin(d);
		const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
		const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
		const z = A * Math.sin(lat1) + B * Math.sin(lat2);
		const lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))) * 180 / Math.PI;
		const lng = Math.atan2(y, x) * 180 / Math.PI;

		return {
			lat: lat,
			lng: lng
		};
	}


	function getAngle(px, py, mx, my) {
		var x = Math.abs(px - mx);
		var y = Math.abs(py - my);
		var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		var cos = y / z;
		var radina = Math.acos(cos); //用反三角函数求弧度
		var angle = Math.floor(180 / (Math.PI / radina)); //将弧度转换成角度

		if (mx > px && my > py) { //鼠标在第四象限
			angle = 180 - angle;
		}

		if (mx == px && my > py) { //鼠标在y轴负方向上
			angle = 180;
		}

		if (mx > px && my == py) { //鼠标在x轴正方向上
			angle = 90;
		}

		if (mx < px && my > py) { //鼠标在第三象限
			angle = 180 + angle;
		}

		if (mx < px && my == py) { //鼠标在x轴负方向
			angle = 270;
		}

		if (mx < px && my < py) { //鼠标在第二象限
			angle = 360 - angle;
		}



		return angle;
	}

	function airIng() {
		// 处理正在飞行的飞机	
		// console.log(airArr)  
		airArr.forEach((air, index) => {
			let ints = parseInt(air.userData.progress);
			let p = air.userData.line[ints];
			if (ints > air.userData.line.length - 2) {
				// remove(airArr, air) 
				return
			}
			let nexNumber = ints + 1 < air.userData.line.length - 1 ? ints + 1 : ints + 1
			let pnext1 = air.userData.line[nexNumber].clone();
			// pnext1.multiplyScalar(0.992)
			let pnext = air.userData.line[nexNumber];
			// 计算飞机的角度 
			// 当前角度 和 下一角度 的弧度

			/* 	
				
			 */

			let position = Object.values(p)
			let angle = getAngle(p.x, p.y, pnext.x, pnext.y)
			let angle1 = getAngle(p.y, p.x, pnext1.y, pnext1.x)
			let angle2 = getAngle(p.z, p.x, pnext1.z, pnext1.x)
			var angle3 = getAngle(p.x, p.z, pnext1.x, pnext1.z)

			let n = THREE.Math.degToRad(0, 0, pnext.x, pnext.y)
			let n1 = THREE.Math.degToRad(0, 0, pnext.x, pnext.y)
			let n2 = THREE.Math.degToRad(0, 0, pnext.x, pnext.y)
			var n3 = THREE.Math.degToRad(getAngle(0, 0, pnext1.x, pnext1.z))
			let d = THREE.Math.degToRad(angle)
			let d1 = THREE.Math.degToRad(angle1)
			let d2 = THREE.Math.degToRad(angle2)
			let d3 = THREE.Math.degToRad(angle3)

			//	判断朝内 还是朝外航线
			/* if(ints%9===1){
				console.log(p, pnext)
			} */
			/* 
			if (d > Math.PI && d1 > (d1 % Math.PI) / 2&&position[1]<0) { 
				air.rotation.z = d2 - d1   
			} */
			// 外点
			var vertex = pnext.clone();
			  vertex.multiplyScalar(9.99);
			// 
			cubebox.position.x = vertex.x
			cubebox.position.y = vertex.y
			cubebox.position.z = vertex.z
			cubebox.position.set(...position)
			cubebox.lookAt(pnext1)
			// cubebox.lookAt(air)
			/* cubebox.position.set(vertex.x, vertex.y, vertex.z);
			cubebox.lookAt(pnext)*/
			/* 
			air.lookAt(pnext)
			air.rotation.z = air.rotation.z  + n1 */
			air.position.set(...position)
			air.lookAt(pnext1)
			/* 
			console.log(air.rotation.x)
			console.log(d, d1, d2, n, n1, n2) */

			/* if (air.rotation.x < 0 && air.rotation.x>-Math.PI*0.8) {
				air.rotation.z = Math.PI - d3
			} else if (air.rotation.x >Math.PI/2){
				// console.log()
				air.rotation.z = Math.PI - d2
			} */
			/* air.rotation.y = Math.PI - d3
			air.rotation.x =d1 */
			// air.rotation.x=-Math.PI/2 
			/* air.rotation.x = d
			air.rotation.y = d1
			air.rotation.z = d2 */

			if (position[1] <= 0) {

			} else {

			}
			// air.rotation.z = cubebox.rotation.z
			// air.rotation.z = cubebox.rotation.x
			// cubebox.position

		})
		airArr.forEach(air => {
			let ints = parseInt(air.userData.progress);
			if (ints > air.userData.line.length - 2) {
				// remove(airArr, air)
				air.userData.progress = 0;
				return
			}
			air.userData.progress += 1
		})
	}

	function getPosition(lng, lat, alt = 1) {
		// 获取position  
		var phi = (90 - lat) * (Math.PI / 180),
			theta = (lng + 180) * (Math.PI / 180),
			radius = alt + globeRadius,
			x = -(radius * Math.sin(phi) * Math.cos(theta)),
			z = (radius * Math.sin(phi) * Math.sin(theta)),
			y = (radius * Math.cos(phi));
		return new THREE.Vector3(x, y, z)
	}

	function addAir(position, line) {
		let air = airObj.clone()
		air.userData.line = line
		air.position.set(...position)
		air.userData.progress = 0
		airArr.push(air)
		scene.add(air);
	}

	function addAirLine(points) {
		var buffer = new THREE.BufferGeometry()
		buffer.addAttribute('position', new THREE.Float32BufferAttribute(points, 3));
		var curveObject = new THREE.Line(buffer, lineMaterial);
		scene.add(curveObject)
		return points
	}



	return DevThree
}))