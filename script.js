let scene, camera, renderer, grid, particles, capturer;
const canvas = document.getElementById('webgl-canvas');

function init() {
    // Create Scene
    scene = new THREE.Scene();
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Grid Material
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x8833FF });
    const gridGeometry = new THREE.BufferGeometry();
    const size = 20, divisions = 100;
    let positions = [];

    for (let i = -size; i <= size; i += 0.5) {
        for (let j = -size; j <= size; j += 0.5) {
            const x = i, y = Math.sin(i * 0.5) * 2 + Math.cos(j * 0.5) * 2, z = j;
            positions.push(x, y, z);
        }
    }

    gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    grid = new THREE.LineSegments(gridGeometry, gridMaterial);
    scene.add(grid);

    // Particle System
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    let particlePositions = [];

    for (let i = 0; i < particleCount; i++) {
        let x = (Math.random() - 0.5) * 40;
        let z = (Math.random() - 0.5) * 40;
        let y = Math.sin(x * 0.5) * 2 + Math.cos(z * 0.5) * 2 + 0.5;
        particlePositions.push(x, y, z);
    }

    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({ color: 0x33FFEE, size: 0.2, transparent: true, opacity: 0.9 });
    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Capture Setup
    capturer = new CCapture({ format: 'webm', framerate: 60 });

    // Start Capture
    setTimeout(() => capturer.start(), 1000);

    animate();
}

// Animation
function animate() {
    requestAnimationFrame(animate);

    // Update Wave
    const positions = grid.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        let x = positions[i];
        let z = positions[i + 2];
        positions[i + 1] = Math.sin(x * 0.5 + performance.now() * 0.002) * 2 + Math.cos(z * 0.5 + performance.now() * 0.002) * 2;
    }
    grid.geometry.attributes.position.needsUpdate = true;

    // Update Particles
    const particlePositions = particles.geometry.attributes.position.array;
    for (let i = 0; i < particlePositions.length; i += 3) {
        let x = particlePositions[i];
        let z = particlePositions[i + 2];
        particlePositions[i + 1] = Math.sin(x * 0.5 + performance.now() * 0.002) * 2 + Math.cos(z * 0.5 + performance.now() * 0.002) * 2 + 0.5;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Render & Capture Frame
    renderer.render(scene, camera);
    capturer.capture(renderer.domElement);
}

// Stop Capture After 5 Seconds
setTimeout(() => {
    capturer.stop();
    capturer.save();
}, 5000);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize Scene
init();
