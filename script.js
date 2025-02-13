// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Wave Shader
const vertexShader = `
    varying vec2 vUv;
    varying float vWave;
    uniform float u_time;

    void main() {
        vUv = uv;
        vec3 pos = position;

        float frequency = 2.0;
        float amplitude = 0.5;
        
        vWave = sin(pos.x * frequency + u_time) * amplitude + sin(pos.y * frequency + u_time) * amplitude;
        pos.z += vWave;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

const fragmentShader = `
    varying vec2 vUv;
    varying float vWave;

    void main() {
        vec3 color = vec3(0.5 + vWave, 0.0, 1.0); // Purple tones
        gl_FragColor = vec4(color, 1.0);
    }
`;

const uniforms = {
    u_time: { value: 0.0 }
};

// Create wave grid
const geometry = new THREE.PlaneGeometry(10, 10, 100, 100);
const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    wireframe: true // Grid effect
});

const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);
camera.position.set(0, 3, 5);
camera.lookAt(0, 0, 0);

// Glowing Green Particles
const particleCount = 200;
const particleGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    let x = (Math.random() - 0.5) * 10;
    let y = Math.random() * 1.5;
    let z = (Math.random() - 0.5) * 10;
    positions.set([x, y, z], i * 3);
    colors.set([0, 1, 0], i * 3); // Glowy green
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particleMaterial = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleSystem);

// Video Recording Setup
let capturer = new CCapture({ format: 'webm', framerate: 60 });
let recording = false;

// UI Button for Recording
const recordButton = document.getElementById('recordButton');
recordButton.addEventListener('click', () => {
    if (!recording) {
        capturer.start();
        recordButton.textContent = '⏹ Stop Recording';
        recording = true;
    } else {
        capturer.stop();
        capturer.save();
        recordButton.textContent = '🎥 Start Recording';
        recording = false;
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    uniforms.u_time.value += 0.02;
    particleSystem.rotation.y += 0.001;
    renderer.render(scene, camera);
    
    if (recording) capturer.capture(renderer.domElement);
}

animate();

// Responsive resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
