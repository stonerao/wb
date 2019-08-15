if (THREE) {
    if (+THREE.REVISION < 90) {
        // 
        THREE.Geometry.prototype.setFromObject = function (object) {
            // console.log( 'THREE.BufferGeometry.setFromObject(). Converting', object, this ); 
            var geometry = object.geometry;

            if (object.isPoints || object.isLine) {
                console.log(1)
                var positions = new Float32BufferAttribute(geometry.vertices.length * 3, 3);
                var colors = new Float32BufferAttribute(geometry.colors.length * 3, 3);

                this.addAttribute('position', positions.copyVector3sArray(geometry.vertices));
                this.addAttribute('color', colors.copyColorsArray(geometry.colors));

                if (geometry.lineDistances && geometry.lineDistances.length === geometry
                    .vertices.length) {

                    var lineDistances = new Float32BufferAttribute(geometry.lineDistances
                        .length, 1);

                    this.addAttribute('lineDistance', lineDistances.copyArray(geometry
                        .lineDistances));

                }

                if (geometry.boundingSphere !== null) {

                    this.boundingSphere = geometry.boundingSphere.clone();

                }

                if (geometry.boundingBox !== null) {

                    this.boundingBox = geometry.boundingBox.clone();

                }

            } else if (object.isMesh) {

                if (geometry && geometry.isGeometry) {

                    this.fromGeometry(geometry);

                }

            }

            return this;

        }
        


    }
}

function config_setControls() {
    THREE.OrbitControls = function (F, G) {
        function h() {
            return Math.pow(0.95, a.zoomSpeed);
        }

        function z(b) {
            a.object instanceof THREE.PerspectiveCamera ? k /= b : a.object instanceof THREE.OrthographicCamera ? (a.object.zoom = Math.max(a.minZoom, Math.min(a.maxZoom, a.object.zoom * b)), a.object.updateProjectionMatrix(), y = !0) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), a.enableZoom = !1)
        }

        function A(b) {
            a.object instanceof THREE.PerspectiveCamera ? k *= b : a.object instanceof THREE.OrthographicCamera ?
                (a.object.zoom = Math.max(a.minZoom, Math.min(a.maxZoom, a.object.zoom / b)), a.object.updateProjectionMatrix(), y = !0) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), a.enableZoom = !1)
        }

        function H(b) {
            if (!1 !== a.enabled) {
                b.preventDefault();
                if (b.button === a.mouseButtons.ORBIT) {
                    if (!1 === a.enableRotate) return;
                    l.set(b.clientX, b.clientY);
                    d = c.ROTATE
                } else if (b.button === a.mouseButtons.ZOOM) {
                    if (!1 === a.enableZoom) return;
                    m.set(b.clientX, b.clientY);
                    d = c.DOLLY
                } else if (b.button ===
                    a.mouseButtons.PAN) {
                    if (!1 === a.enablePan) return;
                    n.set(b.clientX, b.clientY);
                    d = c.PAN
                }
                d !== c.NONE && (document.addEventListener("mousemove", B, !1), document.addEventListener("mouseup", C, !1), a.dispatchEvent(D))
            }
        }

        function B(b) {
            !1 !== a.enabled && (b.preventDefault(), d === c.ROTATE ? !1 !== a.enableRotate && (p.set(b.clientX, b.clientY), q.subVectors(p, l), b = a.domElement === document ? a.domElement.body : a.domElement, e.theta -= 2 * Math.PI * q.x / b.clientWidth * a.rotateSpeed, e.phi -= 2 * Math.PI * q.y / b.clientHeight * a.rotateSpeed, l.copy(p), a.update()) :
                d === c.DOLLY ? !1 !== a.enableZoom && (r.set(b.clientX, b.clientY), t.subVectors(r, m), 0 < t.y ? z(h()) : 0 > t.y && A(h()), m.copy(r), a.update()) : d === c.PAN && !1 !== a.enablePan && (u.set(b.clientX, b.clientY), v.subVectors(u, n).multiplyScalar(a.panSpeed), w(v.x, v.y), n.copy(u), a.update()))
        }

        function C(b) {
            !1 !== a.enabled && (document.removeEventListener("mousemove", B, !1), document.removeEventListener("mouseup", C, !1), a.dispatchEvent(E), d = c.NONE)
        }

        function I(b) {
            !1 === a.enabled || !1 === a.enableZoom || d !== c.NONE && d !== c.ROTATE || (b.preventDefault(),
                b.stopPropagation(), 0 > b.deltaY ? A(h()) : 0 < b.deltaY && z(h()), a.update(), a.dispatchEvent(D), a.dispatchEvent(E))
        }

        function J(b) {
            if (!1 !== a.enabled && !1 !== a.enableKeys && !1 !== a.enablePan) switch (b.keyCode) {
                case a.keys.UP:
                    w(0, 7 * -a.panSpeed);
                    a.update();
                    break;
                case a.keys.BOTTOM:
                    w(0, 7 * a.panSpeed);
                    a.update();
                    break;
                case a.keys.LEFT:
                    w(7 * -a.panSpeed, 0);
                    a.update();
                    break;
                case a.keys.RIGHT:
                    w(7 * a.panSpeed, 0), a.update()
            }
        }

        function K(b) {
            if (!1 !== a.enabled) {
                switch (b.touches.length) {
                    case 1:
                        if (!1 === a.enableRotate) return;
                        l.set(b.touches[0].pageX,
                            b.touches[0].pageY);
                        d = c.TOUCH_ROTATE;
                        break;
                    case 2:
                        if (!1 === a.enableZoom) return;
                        var g = b.touches[0].pageX - b.touches[1].pageX;
                        b = b.touches[0].pageY - b.touches[1].pageY;
                        m.set(0, Math.sqrt(g * g + b * b));
                        d = c.TOUCH_DOLLY;
                        break;
                    case 3:
                        if (!1 === a.enablePan) return;
                        n.set(b.touches[0].pageX, b.touches[0].pageY);
                        d = c.TOUCH_PAN;
                        break;
                    default:
                        d = c.NONE
                }
                d !== c.NONE && a.dispatchEvent(D)
            }
        }

        function L(b) {
            if (!1 !== a.enabled) switch (b.preventDefault(), b.stopPropagation(), b.touches.length) {
                case 1:
                    if (!1 === a.enableRotate) break;
                    if (d !== c.TOUCH_ROTATE) break;
                    p.set(b.touches[0].pageX, b.touches[0].pageY);
                    q.subVectors(p, l);
                    var g = a.domElement === document ? a.domElement.body : a.domElement;
                    e.theta -= 2 * Math.PI * q.x / g.clientWidth * a.rotateSpeed;
                    e.phi -= 2 * Math.PI * q.y / g.clientHeight * a.rotateSpeed;
                    l.copy(p);
                    a.update();
                    break;
                case 2:
                    if (!1 === a.enableZoom) break;
                    if (d !== c.TOUCH_DOLLY) break;
                    g = b.touches[0].pageX - b.touches[1].pageX;
                    b = b.touches[0].pageY - b.touches[1].pageY;
                    r.set(0, Math.sqrt(g * g + b * b));
                    t.subVectors(r, m);
                    0 < t.y ? A(h()) : 0 > t.y && z(h());
                    m.copy(r);
                    a.update();
                    break;
                case 3:
                    if (!1 ===
                        a.enablePan) break;
                    if (d !== c.TOUCH_PAN) break;
                    u.set(b.touches[0].pageX, b.touches[0].pageY);
                    v.subVectors(u, n);
                    w(v.x, v.y);
                    n.copy(u);
                    a.update();
                    break;
                default:
                    d = c.NONE
            }
        }

        function M(b) {
            !1 !== a.enabled && (a.dispatchEvent(E), d = c.NONE)
        }

        function N(a) {
            a.preventDefault()
        }
        this.object = F;
        this.domElement = void 0 !== G ? G : document;
        this.enabled = !0;
        this.target = new THREE.Vector3;
        this.minDistance = 0;
        this.maxDistance = Infinity;
        this.minZoom = 0;
        this.maxZoom = Infinity;
        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI;
        this.minAzimuthAngle = -Infinity;
        this.maxAzimuthAngle = Infinity;
        this.enableDamping = !1;
        this.dampingFactor = .25;
        this.enableZoom = !0;
        this.zoomSpeed = 1;
        this.enableRotate = !0;
        this.rotateSpeed = 1;
        this.enablePan = !0;
        this.panSpeed = 1;
        this.autoRotate = !1;
        this.autoRotateSpeed = 2;
        this.enableKeys = !0;
        this.keys = {
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            BOTTOM: 40
        };
        this.mouseButtons = {
            ORBIT: THREE.MOUSE.LEFT,
            ZOOM: THREE.MOUSE.MIDDLE,
            PAN: THREE.MOUSE.RIGHT
        };
        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();
        this.zoom0 = this.object.zoom;
        this.getPolarAngle =
            function () {
                return f.phi
            };
        this.getAzimuthalAngle = function () {
            return f.theta
        };
        this.reset = function () {
            a.target.copy(a.target0);
            a.object.position.copy(a.position0);
            a.object.zoom = a.zoom0;
            a.object.updateProjectionMatrix();
            a.dispatchEvent(O);
            a.update();
            d = c.NONE
        };
        this.update = function () {
            var b = new THREE.Vector3,
                g = (new THREE.Quaternion).setFromUnitVectors(F.up, new THREE.Vector3(0, 1, 0)),
                U = g.clone().inverse(),
                P = new THREE.Vector3,
                Q = new THREE.Quaternion;
            return function () {
                var h = a.object.position;
                b.copy(h).sub(a.target);
                b.applyQuaternion(g);
                f.setFromVector3(b);
                a.autoRotate && d === c.NONE && (e.theta -= 2 * Math.PI / 60 / 60 * a.autoRotateSpeed);
                f.theta += e.theta;
                f.phi += e.phi;
                f.theta = Math.max(a.minAzimuthAngle, Math.min(a.maxAzimuthAngle, f.theta));
                f.phi = Math.max(a.minPolarAngle, Math.min(a.maxPolarAngle, f.phi));
                f.makeSafe();
                f.radius *= k;
                f.radius = Math.max(a.minDistance, Math.min(a.maxDistance, f.radius));
                a.target.add(x);
                b.setFromSpherical(f);
                b.applyQuaternion(U);
                h.copy(a.target).add(b);
                a.object.lookAt(a.target);
                !0 === a.enableDamping ? (k +=
                    (1 - k) * a.dampingFactor * .6, e.theta *= 1 - a.dampingFactor, e.phi *= 1 - a.dampingFactor, x.multiplyScalar(1 - a.dampingFactor)) : (k = 1, e.set(0, 0, 0), x.set(0, 0, 0));
                return y || P.distanceToSquared(a.object.position) > R || 8 * (1 - Q.dot(a.object.quaternion)) > R ? (a.dispatchEvent(O), P.copy(a.object.position), Q.copy(a.object.quaternion), y = !1, !0) : !1
            }
        }();
        this.dispose = function () {
            a.domElement.removeEventListener("contextmenu", N, !1);
            a.domElement.removeEventListener("mousedown", H, !1);
            a.domElement.removeEventListener("wheel", I, !1);
            a.domElement.removeEventListener("touchstart",
                K, !1);
            a.domElement.removeEventListener("touchend", M, !1);
            a.domElement.removeEventListener("touchmove", L, !1);
            document.removeEventListener("mousemove", B, !1);
            document.removeEventListener("mouseup", C, !1);
            window.removeEventListener("keydown", J, !1)
        };
        var a = this,
            O = {
                type: "change"
            },
            D = {
                type: "start"
            },
            E = {
                type: "end"
            },
            c = {
                NONE: -1,
                ROTATE: 0,
                DOLLY: 1,
                PAN: 2,
                TOUCH_ROTATE: 3,
                TOUCH_DOLLY: 4,
                TOUCH_PAN: 5
            },
            d = c.NONE,
            R = 1E-6,
            f = new THREE.Spherical,
            e = new THREE.Spherical,
            k = 1,
            x = new THREE.Vector3,
            y = !1,
            l = new THREE.Vector2,
            p = new THREE.Vector2,
            q = new THREE.Vector2,
            n = new THREE.Vector2,
            u = new THREE.Vector2,
            v = new THREE.Vector2,
            m = new THREE.Vector2,
            r = new THREE.Vector2,
            t = new THREE.Vector2,
            S = function () {
                var a = new THREE.Vector3;
                return function (b, c) {
                    a.setFromMatrixColumn(c, 0);
                    a.multiplyScalar(-b);
                    x.add(a)
                }
            }(),
            T = function () {
                var a = new THREE.Vector3;
                return function (b, c) {
                    a.setFromMatrixColumn(c, 1);
                    a.multiplyScalar(b);
                    x.add(a)
                }
            }(),
            w = function () {
                var b = new THREE.Vector3;
                return function (c, d) {
                    var e = a.domElement === document ? a.domElement.body : a.domElement;
                    if (a.object instanceof THREE.PerspectiveCamera) {
                        b.copy(a.object.position).sub(a.target);
                        var f = b.length(),
                            f = f * Math.tan(a.object.fov / 2 * Math.PI / 180);
                        S(2 * c * f / e.clientHeight, a.object.matrix);
                        T(2 * d * f / e.clientHeight, a.object.matrix)
                    } else a.object instanceof THREE.OrthographicCamera ? (S(c * (a.object.right - a.object.left) / a.object.zoom / e.clientWidth, a.object.matrix), T(d * (a.object.top - a.object.bottom) / a.object.zoom / e.clientHeight, a.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),
                        a.enablePan = !1)
                }
            }();
        a.domElement.addEventListener("contextmenu", N, !1);
        a.domElement.addEventListener("mousedown", H, !1);
        a.domElement.addEventListener("wheel", I, !1);
        a.domElement.addEventListener("touchstart", K, !1);
        a.domElement.addEventListener("touchend", M, !1);
        a.domElement.addEventListener("touchmove", L, !1);
        window.addEventListener("keydown", J, !1);
        this.update()
    };
    THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
    THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;
}
var JSON_DATA = {
	"lines": [{
		"src": 1,
		"dst": 2,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": 158,
			"y": 0,
			"z": -146
		}, {
			"x": 194,
			"y": 0,
			"z": -298
		}, {
			"x": 300,
			"y": 0,
			"z": -400
		}]
	}, {
		"src": 1,
		"dst": 3,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": 104,
			"y": 0,
			"z": -57
		}, {
			"x": 158,
			"y": 0,
			"z": -108
		}, {
			"x": 300,
			"y": 0,
			"z": -193
		}]
	}, {
		"src": 1,
		"dst": 4,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": 128,
			"y": 0,
			"z": 6
		}, {
			"x": 167,
			"y": 0,
			"z": 6
		}, {
			"x": 247,
			"y": 0,
			"z": -38
		}]
	}, {
		"src": 1,
		"dst": 5,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": 140,
			"y": 0,
			"z": 45
		}, {
			"x": 166,
			"y": 0,
			"z": 103
		}, {
			"x": 285,
			"y": 0,
			"z": 89
		}]
	}, {
		"src": 1,
		"dst": 6,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": 127,
			"y": 0,
			"z": 101
		}, {
			"x": 152,
			"y": 0,
			"z": 187
		}, {
			"x": 252,
			"y": 0,
			"z": 244
		}]
	}, {
		"src": 1,
		"dst": 7,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": 90,
			"y": 0,
			"z": 114
		}, {
			"x": 137,
			"y": 0,
			"z": 259
		}, {
			"x": 280,
			"y": 0,
			"z": 400
		}]
	}, {
		"src": 1,
		"dst": 8,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": 54,
			"y": 0,
			"z": 129
		}, {
			"x": 51,
			"y": 0,
			"z": 222
		}, {
			"x": 143,
			"y": 0,
			"z": 374
		}]
	}, {
		"src": 1,
		"dst": 9,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": -19,
			"y": 0,
			"z": 137
		}, {
			"x": 6,
			"y": 0,
			"z": 253
		}, {
			"x": -1,
			"y": 0,
			"z": 398
		}]
	}, {
		"src": 1,
		"dst": 10,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": -52,
			"y": 0,
			"z": 107
		}, {
			"x": -49,
			"y": 0,
			"z": 208
		}, {
			"x": -149,
			"y": 0,
			"z": 351
		}]
	}, {
		"src": 1,
		"dst": 11,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": -113,
			"y": 0,
			"z": 115
		}, {
			"x": -188,
			"y": 0,
			"z": 335
		}, {
			"x": -300,
			"y": 0,
			"z": 400
		}]
	}, {
		"src": 1,
		"dst": 12,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": -121,
			"y": 0,
			"z": 53
		}, {
			"x": -186,
			"y": 0,
			"z": 175
		}, {
			"x": -321,
			"y": 0,
			"z": 206
		}]
	}, {
		"src": 1,
		"dst": 13,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": -127,
			"y": 0,
			"z": -2
		}, {
			"x": -159,
			"y": 0,
			"z": 13
		}, {
			"x": -249,
			"y": 0,
			"z": 44
		}]
	}, {
		"src": 1,
		"dst": 14,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": -123,
			"y": 0,
			"z": -61
		}, {
			"x": -258,
			"y": 0,
			"z": -54
		}, {
			"x": -351,
			"y": 0,
			"z": -122
		}]
	}, {
		"src": 1,
		"dst": 15,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": -257,
			"y": 0,
			"z": -164
		}, {
			"x": -336,
			"y": 0,
			"z": -318
		}]
	}, {
		"src": 1,
		"dst": 16,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": -77,
			"y": 0,
			"z": -105
		}, {
			"x": -176,
			"y": 0,
			"z": -162
		}, {
			"x": -198,
			"y": 0,
			"z": -255
		}]
	}, {
		"src": 1,
		"dst": 17,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": -82,
			"y": 0,
			"z": -142
		}, {
			"x": -119,
			"y": 0,
			"z": -275
		}, {
			"x": -206,
			"y": 0,
			"z": -400
		}]
	}, {
		"src": 1,
		"dst": 18,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": -27,
			"y": 0,
			"z": -122
		}, {
			"x": -73,
			"y": 0,
			"z": -208
		}, {
			"x": -52,
			"y": 0,
			"z": -261
		}, {
			"x": -69,
			"y": 0,
			"z": -352
		}]
	}, {
		"src": 1,
		"dst": 19,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": -14,
			"y": 0,
			"z": -162
		}, {
			"x": -28,
			"y": 0,
			"z": -226
		}, {
			"x": -3,
			"y": 0,
			"z": -319
		}, {
			"x": 2,
			"y": 0,
			"z": -420
		}]
	}, {
		"src": 1,
		"dst": 20,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": 36,
			"y": 0,
			"z": -146
		}, {
			"x": 38,
			"y": 0,
			"z": -250
		}, {
			"x": 81,
			"y": 0,
			"z": -350
		}]
	}, {
		"src": 1,
		"dst": 21,
		"lines": [{
			"x": 0,
			"y": 0,
			"z": 0
		}, {
			"x": 54,
			"y": 0,
			"z": -140
		}, {
			"x": 103,
			"y": 0,
			"z": -173
		}, {
			"x": 140,
			"y": 0,
			"z": -269
		}]
	}],
	"nodes": [{
		"x": 300,
		"y": 0,
		"z": -400,
		"type": 2,
		"id": 2
	}, {
		"x": 300,
		"y": 0,
		"z": -193,
		"type": 2,
		"id": 3
	}, {
		"x": 247,
		"y": 0,
		"z": -38,
		"type": 2,
		"id": 4
	}, {
		"x": 285,
		"y": 0,
		"z": 89,
		"type": 2,
		"id": 5
	}, {
		"x": 252,
		"y": 0,
		"z": 244,
		"type": 2,
		"id": 6
	}, {
		"x": 280,
		"y": 0,
		"z": 400,
		"type": 2,
		"id": 7
	}, {
		"x": 143,
		"y": 0,
		"z": 374,
		"type": 2,
		"id": 8
	}, {
		"x": -1,
		"y": 0,
		"z": 398,
		"type": 2,
		"id": 9
	}, {
		"x": -149,
		"y": 0,
		"z": 351,
		"type": 2,
		"id": 10
	}, {
		"x": -300,
		"y": 0,
		"z": 400,
		"type": 2,
		"id": 11
	}, {
		"x": -321,
		"y": 0,
		"z": 206,
		"type": 2,
		"id": 12
	}, {
		"x": -249,
		"y": 0,
		"z": 44,
		"type": 2,
		"id": 13
	}, {
		"x": -351,
		"y": 0,
		"z": -122,
		"type": 2,
		"id": 14
	}, {
		"x": -336,
		"y": 0,
		"z": -318,
		"type": 2,
		"id": 15
	}, {
		"x": -198,
		"y": 0,
		"z": -255,
		"type": 2,
		"id": 16
	}, {
		"x": -206,
		"y": 0,
		"z": -400,
		"type": 2,
		"id": 17
	}, {
		"x": -69,
		"y": 0,
		"z": -352,
		"type": 2,
		"id": 18
	}, {
		"x": 2,
		"y": 0,
		"z": -420,
		"type": 2,
		"id": 19
	}, {
		"x": 81,
		"y": 0,
		"z": -350,
		"type": 2,
		"id": 20
	}, {
		"x": 140,
		"y": 0,
		"z": -269,
		"type": 2,
		"id": 21
	}]
}