import * as THREE from 'https://cdn.skypack.dev/three';

const canvas = document.querySelector(".backdrop");
const scene = new THREE.Scene();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const camera = new THREE.PerspectiveCamera(
    50, sizes.width / sizes.height, 1, 5000
);

const light = new THREE.DirectionalLight(0xffffff, 12);
light.castShadow = true;
light.shadow.bias = -0.0001;
light.shadow.mapSize.width = 1024 * 4;
light.shadow.mapSize.height = 1024 * 4;
scene.add(light);

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


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    light.position.set(
        camera.position.x,
        camera.position.y,
        camera.position.z
    );  
    // HOVER CONTROLS
    stars.rotation.y = mouse.x * 0.25;
    stars.rotation.x = -mouse.y * 0.25;
}

animate();

addEventListener("mousemove", () => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});
