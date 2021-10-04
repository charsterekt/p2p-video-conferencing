import * as THREE from 'https://cdn.skypack.dev/three';
import {GLTFLoader} from 'https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader';
import atmosphereVertexShader from './shaders/atmosphereVertex_glsl.js';
import atmosphereFragmentShader from './shaders/atmosphereFragment_glsl.js';

const canvas = document.querySelector(".earth");
const scene = new THREE.Scene();
const preloader = document.getElementById("loader");
const everything = document.getElementById("everything");

// scene.background = new THREE.Color(0xdddddd);

// Boilerplate
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const camera = new THREE.PerspectiveCamera(
    50, sizes.width / sizes.height, 1, 5000);

const light = new THREE.DirectionalLight(0xffffff, 12);
// light.position.set(1, 1, 1);
light.castShadow = true;
light.shadow.bias = -0.0001;
light.shadow.mapSize.width = 1024 * 4;
light.shadow.mapSize.height = 1024 * 4;
scene.add(light);

const group = new THREE.Group();
group.position.set(0.5, 0, -0.5);

var root;
const loader = new GLTFLoader();
loader.load('public/models/earth_final.gltf', function(gltf){
    console.log(gltf);
    root = gltf.scene;
    root.scale.set(0.1, 0.1, 0.1);
    // root.position.set(0, 0, -0.5);
    root.children[0].traverse(n => {
        if (n.isMesh) {
            n.castShadow = true;
            n.receiveShadow = true;
            if (n.material.map) n.material.map.anisotropy = 16;
        }
    });
    group.add(root);
}, function (xhr) {
    var total = xhr.loaded / xhr.total * 100;
    console.log((total) + " %loaded");
    if (total != 100){
        preloader.style.display = "flex";
        everything.style.display = "none";
    }
    else {
        preloader.style.display = "none";
        everything.style.display = "flex";
    }
}, function (error) {
    console.log(error);
});

scene.add(group);

// Atmosphere
const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50),
    new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    })
);
scene.add(atmosphere);
atmosphere.scale.set(0.1, 0.1, 0.1);
atmosphere.position.set(0.5, 0, -0.5);

// The only media query for any screen under 1800px
function lessWideScreen(e) {
    if (e.matches) {
        group.position.set(0.3, 0, -0.5);
        atmosphere.position.set(0.3, 0, -0.5);
    }
}

const mediaQuery = window.matchMedia("(max-width: 1799px)");
mediaQuery.addListener(lessWideScreen);
lessWideScreen(mediaQuery);

// Stars
var tex = new THREE.TextureLoader().load("https://threejs.org/examples/textures/sprites/disc.png");

const starsGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    map: tex
});

const starVertices = []
for (let i = 0; i < 10000; i++){
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
}

starsGeometry.setAttribute('position', 
    new THREE.Float32BufferAttribute(starVertices, 3));

const stars = new THREE.Points(
    starsGeometry,
    starMaterial
);
stars.position.set(0, 0, -0.5);
scene.add(stars);

/*
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

controls.keys = {
	LEFT: 'ArrowLeft', //left arrow
	UP: 'ArrowUp', // up arrow
	RIGHT: 'ArrowRight', // right arrow
	BOTTOM: 'ArrowDown' // down arrow
}
*/

camera.position.set(0, 0, 1);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 2.5;
renderer.shadowMap.enabled = true;
renderer.antialias = true;

const mouse = {
    x: undefined,
    y: undefined
};
// console.log(mouse);

function animate() {
    requestAnimationFrame(animate);
    atmosphere.lookAt(camera.position);
    renderer.render(scene, camera);
    light.position.set(
        camera.position.x,
        camera.position.y,
        camera.position.z
    );
    if (root){  // Wait for the render to prevent error spam
        root.rotation.y += 0.001;
        
        // HOVER CONTROLS
        stars.rotation.y = mouse.x * 0.25;
        stars.rotation.x = -mouse.y * 0.25;
    }
}

animate();

addEventListener("mousemove", () => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

// GLOBE CONTROLLER

let mouseHold = false;

addEventListener("mousedown", () => {
    mouseHold = true;
    // console.log(mouseHold);
    moveGlobe();
});

addEventListener("mouseup", () => {
    mouseHold = false;
    // console.log(mouseHold);
});

function moveGlobe() {
    if (mouseHold) {
        group.rotation.y = mouse.x * 2;
        group.rotation.x = -mouse.y * 2;

        setTimeout(moveGlobe, 1);
    } else {
        return;
    }
}

// BUTTONS

const broadcast = document.getElementById("broadcast");
const watch = document.getElementById("watch");
const uname = document.getElementById("uname");

broadcast.addEventListener("click", () => {
    if (uname.value === "") {
        alert("Please pick a username")
    } else {
        sessionStorage.setItem("username", uname.value);
        sessionStorage.setItem("isBroadcaster", true);
        window.location.href = "/broadcast/";
    }
});

watch.addEventListener("click", () => {
    if (uname.value === "") {
        alert("Please pick a username")
    } else {
        sessionStorage.setItem("username", uname.value);
        // window.location.href = "/watch/";
        var rid = prompt("Enter a Room ID");
        if (rid != null) {
            if (rid === ""){
                alert("Please enter a valid Room ID");
            } else {
                window.location.href = `/broadcast/${rid}`;
            }
        } else {
            return;
        }
    }
});