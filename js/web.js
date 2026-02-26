const container = document.getElementById('canvas-container');

// Scene Setup
const scene = new THREE.Scene();
// Add fog to fade the lines into the navy background color
scene.fog = new THREE.FogExp2(0x051B38, 0.0015);

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
// Position camera to look slightly down at the horizon
camera.position.set(0, 100, 400);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimization
container.appendChild(renderer.domElement);

// Geometry: Create a large plane instead of a loop of lines
// Width: 4000 (covers screen), Height: 2000 (depth), Segments: 60x50 (for wave resolution)
const planeGeometry = new THREE.PlaneGeometry(4000, 2000, 60, 50);

// Material: Wireframe grid
const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xFBA919,
    wireframe: true,
    transparent: true,
    opacity: 0.15
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);

// Rotate flat to lie like a floor
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Variables for animation
let count = 0;

function animate() {
    requestAnimationFrame(animate);
    count += 0.01;

    // Animate Vertices (Create the wave effect)
    // Access the position attribute of the geometry
    const positionAttribute = planeGeometry.attributes.position;

    // Loop through vertices to adjust Z height (which looks like Y height after rotation)
    for (let i = 0; i < positionAttribute.count; i++) {
        // Get original X and Y (which corresponds to depth in plane geometry)
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i); // This is 'depth' in local space

        // Calculate wave height based on position and time
        // A mix of Sine waves creates a flowing liquid/terrain effect
        const waveX1 = Math.sin(x * 0.002 + count) * 20;
        const waveY1 = Math.sin(y * 0.005 + count) * 20;
        const waveX2 = Math.sin(x * 0.01 + count * 2) * 5; // Smaller detail wave

        // Apply new height (Z in local space is Up in world space relative to the plane face)
        positionAttribute.setZ(i, waveX1 + waveY1 + waveX2);
    }

    // Tell Three.js the vertices have changed
    positionAttribute.needsUpdate = true;

    renderer.render(scene, camera);
}

animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});