// Three.js Scene Setup
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Particles - Network Globe
const geometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 18; // Spread out more
}

geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Neon Cyan Particles
const material = new THREE.PointsMaterial({
    size: 0.03,
    color: 0x64ffda,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(geometry, material);
scene.add(particlesMesh);

// Geometric Shape (Icosahedron) for structure
const geoGeometry = new THREE.IcosahedronGeometry(4, 1);
const geoMaterial = new THREE.MeshBasicMaterial({
    color: 0xbd34fe, // Purple
    wireframe: true,
    transparent: true,
    opacity: 0.15
});
const geoMesh = new THREE.Mesh(geoGeometry, geoMaterial);
scene.add(geoMesh);

camera.position.z = 6;

// Mouse Interaction
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX / window.innerWidth - 0.5;
    mouseY = event.clientY / window.innerHeight - 0.5;
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Rotate entire system
    particlesMesh.rotation.y = elapsedTime * 0.05;
    geoMesh.rotation.y = elapsedTime * 0.1;
    geoMesh.rotation.x = elapsedTime * 0.05;

    // Mouse parallax
    particlesMesh.rotation.x += 0.05 * (mouseY - particlesMesh.rotation.x);
    particlesMesh.rotation.y += 0.05 * (mouseX - particlesMesh.rotation.y);

    // Gentle floating effect
    camera.position.y = Math.sin(elapsedTime * 0.5) * 0.2;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
