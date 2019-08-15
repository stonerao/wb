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
	var scene, camera, controls;
	var options = Object.assign({}, {
		parentDom: null,
		canvas: null,
	})
	//page config
	var config = {
		id: null, //id
		click: null, //click event
		mousemove: null, //mouse move event 
		resize: null, //docuemnt resize event
		isResize: true, //document is resize
		camera: {
			x: 0,
			y: 100,
			z: 100
		}, //camera position 
		created: null
	}
	var interVal = {}

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
		if (!THREE.OrbitControls) {
			return
		}
		controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		//动态阻尼系数 就是鼠标拖拽旋转灵敏度
		controls.dampingFactor = 1;
		//是否可以缩放
		controls.enableZoom = true;
		//是否自动旋转controls.autoRotate = true; 设置相机距离原点的最远距离
		controls.minDistance = 0;
		//设置相机距离原点的最远距离
		controls.maxDistance = 3000;
		//是否开启右键拖拽
		controls.enablePan = true;
		controls.enableRotate = true;
		// controls.autoRotate = true;
		// controls.autoRotateSpeed = 0.5;
	}


	function initMixin(Dev) {
		// initital options
		Dev.prototype._init = function (params) {
			var _dev = this;
			// if options has id
			if (!hasOwn(params, "id")) {
				return console.error("options lack id")
			}
			// page init 
			config_setControls()
			// set options
			setOption(config, params);
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
			config.created(scene)
		}
	}


	function initRenderer(Dev) {
		var canvas = options.canvas
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			// alpha: true,
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

		camera.position.set(...Object.values(config.camera));
		// camera.rotation.set(...Object.values(curr.params.ratatoion));
		camera.lookAt(scene.position);
		scene.add(camera)
		// light
		var ambient = new THREE.AmbientLight(0xffffff, 1);
		scene.add(ambient)

		//Create a closed wavey loop
		var curve = new THREE.SplineCurve3([
			new THREE.Vector3(-50, 0, 10),
			new THREE.Vector3(-5, 5, 5),
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(5, -5, 5),
			new THREE.Vector3(10, 0, 10)

		]);

		var points = curve.getPoints(50);
		var geometry = new THREE.Geometry()
		geometry.vertices = points
		var material = new THREE.LineBasicMaterial({
			color: 0xffffff
		});

		// Create the final object to add to the scene
		var curveObject = new THREE.Line(geometry, material);
		scene.add(curveObject);

		var geometry = new THREE.BoxGeometry(1, 1, 1);
		var material = new THREE.MeshBasicMaterial({
			color: 0x00ff00
		});
		var cube = new THREE.Mesh(geometry, material);
		scene.add(cube);
	}

	function DevThree(options) {
		this._init(options)
		controlsEvent()
		created()
		render()
	}

	function render() {
		controls.update();
		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}
	initMixin(DevThree);
	initEvents(DevThree)
	return DevThree
}))
