import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from "dat.gui";
import SubmarineRotation from "/SubmarineRotation";
import WithdrawalMovement from "/WithdrawalMovement"
// Create the scene
const scene = new THREE.Scene();

// Create and position the camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 7);

// Create and configure the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls for easy navigation
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Load the panoramic skybox image
const textureLoader = new THREE.TextureLoader();
textureLoader.load(
    './textures/panorama.png', // Path to your panoramic image
    (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
    },
    undefined,
    (error) => {
        console.error('An error happened while loading the skybox image', error);
    }
);

// Load the submarine model
const gltfLoader = new GLTFLoader();
var submarine;
gltfLoader.load(
    './models/submarine.glb', // Adjust the path to your GLB file
    (gltf) => {
        submarine = gltf.scene;
        submarine.scale.set(10, 10, 10);
        submarine.position.set(0, 50, 0);
        console.log(submarine.position)
        scene.add(submarine);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('An error happened', error);
    }
);


// Load the underwater terrain model
const terrainLoader = new GLTFLoader();
terrainLoader.load(
    './models/underwater_terrain.glb', // Adjust the path to your terrain model
    (gltf) => {
        const terrainModel = gltf.scene;
        terrainModel.scale.set(100, 100, 100);
        terrainModel.position.set(0, -260, 0);
        scene.add(terrainModel);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('Error loading terrain model:', error);
    }
);

// Load the seaweed model
const seaweedLoader = new GLTFLoader();
seaweedLoader.load(
    './models/seaweed.glb', // Adjust the path to your seaweed model
    (gltf) => {
        const seaweedModel = gltf.scene;
        // Create 200 instances of the seaweed model
        for (let i = 0; i < 200; i++) {
            const seaweedInstance = seaweedModel.clone();
            seaweedInstance.scale.set(5, 5, 5);
            // Randomize the position within a larger cube
            const cubeSize = 1500;
            const x = Math.random() * cubeSize - cubeSize / 2;
            const y = -250;
            const z = Math.random() * cubeSize - cubeSize / 2;
            seaweedInstance.position.set(x, y, z);
            scene.add(seaweedInstance);
        }
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('Error loading seaweed model:', error);
    }
);
// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);
// Submarine rotation object and GUI setup
const submarineRotation = new SubmarineRotation(); // Assuming SubmarineRotation is defined elsewhere
const withdrawalMovement = new WithdrawalMovement();
const SubmarineForcers = {
    F_torque: 0,
    tau_z: 0,
    I_z: 1,
    tau_y: 0,
    I_y: 1,
    tanks_water_volume: 20,
    fan_speed: 0,

};
const AutoMovementVars = {
    desired_depth: 0
};


var gui = new GUI();
var rotationFolder = gui.addFolder('Submarine Rotation:');
rotationFolder.add(SubmarineForcers, 'F_torque', -200, 200).name('Torque (τz)').step(10);
// rotationFolder.add(SubmarineForcers, 'tau_z', -1, 1).name('Torque (τz)').step(0.1);
// rotationFolder.add(SubmarineForcers, 'I_z', 1, 10).name('Inertia (Iz)').step(0.1);
// rotationFolder.add(SubmarineForcers, 'tau_y', -1, 1).name('Torque (τy)').step(0.1);
// rotationFolder.add(SubmarineForcers, 'I_y', 1, 10).name('Inertia (Iy)').step(0.1);
// rotationFolder.open();

//const depthController = gui.add({ text: 'Depth: '+ withdrawalMovement.position.y }, 'text').name('Depth');rotationFolder.open();
var WithdrawalFolder = gui.addFolder('Withdrawal movement :');
WithdrawalFolder.add(SubmarineForcers, 'tanks_water_volume', 0, 100).name('V.tanks_water cm3').step(1);
WithdrawalFolder.add(SubmarineForcers, 'fan_speed', -10, 10).name('fan speed').step(0.1);
WithdrawalFolder.open();

var moveFolder = gui.addFolder('Auto Movement :');
WithdrawalFolder.add(AutoMovementVars, 'desired_depth', 0, 100).name('Desired Depth').step(1);

// Function to update the camera position based on the submarine's position
function updateCamera() {
    if (!submarine) return;
    // console.log(submarine.position);ب
    camera.position.x = submarine.position.x;
    camera.position.y = submarine.position.y;
    camera.position.z = submarine.position.z + 10;
    camera.lookAt(submarine.position);
}
// Animation loop
function animate() {
    requestAnimationFrame(animate);
    if (submarine) {
        submarineRotation.HorizontalAngularMotionInMoment(submarine, SubmarineForcers.F_torque,SubmarineForcers.tanks_water_volume*0.01);

        // Update the submarine's position using the WithdrawalMovement position
        withdrawalMovement.linearMotionInMoment(submarine, SubmarineForcers.tanks_water_volume*0.01, SubmarineForcers.fan_speed);
        withdrawalMovement.autoChangeDepth(SubmarineForcers, AutoMovementVars.desired_depth);

    }
    gui.updateDisplay();
    controls.update();
    updateCamera();
    renderer.render(scene, camera);
}
animate();
// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
