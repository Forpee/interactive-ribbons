import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import gsap from 'gsap';

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2(0, 0);
let target = new THREE.Vector3(0, 0, 0);

class Ribbon {
    constructor(material) {
        this.width = 1;
        this.speed = 0.02;
        this.position = new THREE.Vector3(0, 0, 0);

        this.geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 300);
        this.material = new THREE.MeshPhysicalMaterial({
            color: 0xff0000,
            side: THREE.DoubleSide,
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    update(time, target) {
        time *= this.speed;
        let rot = [
            Math.sin(time) * this.width / 2,
            Math.cos(time) * this.width / 2
        ];

        // this.position.x = Math.sin(time * 5) * (3 + Math.sin(time * 7));
        // this.position.y = Math.cos(time * 3) * (3 + Math.sin(time * 5));
        this.position = new THREE.Vector3(0, 0, 0).lerpVectors(this.position, target, 0.1);
        this.pp = [...this.geometry.attributes.position.array];

        for (let j = 0; j < 6; j++) {
            this.pp.pop();
        }

        this.pp.unshift(
            this.position.x + rot[0],
            this.position.y + time * 0,
            this.position.z + rot[1],
        );
        this.pp.unshift(
            this.position.x - rot[0],
            this.position.y + time * 0,
            this.position.z - rot[1],
        );

        this.geometry.attributes.position.array = new Float32Array(this.pp);
        // console.log(this.pp);
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.computeVertexNormals();
        // this.geometry.computeFaceNormals();

    }
}

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Test mesh
 */
// Geometry
// const geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 3);

// Material
const material = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide,
    wireframe: true,
});

// Mesh
// const mesh = new THREE.Mesh(geometry, material)
// scene.add(mesh)
const ribbons = [];
let ribbon;
for (let i = 0; i < 1; i++) {

    ribbon = new Ribbon(material);
    scene.add(ribbon.mesh);
    ribbons.push(ribbon);
    // ribbon.update();

}

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};
// ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);
// directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Orthographic camera
// const camera = new THREE.OrthographicCamera(-1/2, 1/2, 1/2, -1/2, 0.1, 100)

// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 15);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
let touchMe = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(20, 20, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
);
scene.add(touchMe);
function onMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([touchMe]);
    if (intersects.length > 0) {
        // console.log(intersects[0].object);
        target = intersects[0].point;

    }
}
window.addEventListener('mousemove', onMouseMove);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x111111, 1);

/**
 * Animate
 */
const clock = new THREE.Clock();
let t = 0;
const tick = () => {
    // Update controls
    controls.update();

    // Get elapsedtime
    const elapsedTime = clock.getElapsedTime();
    if (ribbon) {
        t++;
        ribbon.update(t, target);
    }
    // console.log(elapsedTime);
    // Update uniforms
    material.uniforms.uTime.value = elapsedTime;

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
