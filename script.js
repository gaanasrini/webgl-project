// Scene Setup
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
        
        float freq = 4.0;
        float amp = 0.3;
        
        vWave = sin(pos.x * freq + u_time) * amp;
        pos.z += vWave;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

const fragmentShader = `
    varying vec2 vUv;
    varying float vWave;

    void main() {
        vec3 color = vec3(0.0, 0.5 + vWave, 1.0);
        gl_FragColor = vec4(color, 1.0);
    }
`;

const uniforms = {
    u_time: { value: 0.0 }
};

// Create the wave mesh
const geometry = new THREE.PlaneGeometry(5, 5, 100, 100);
const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    wireframe: false
});

const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);
camera.position.set(0, 1.5, 3);
camera.lookAt(0, 0, 0);

// Glowy Particle Effect
const particles = new THREE.BufferGeometry();
const count = 200;
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

for (let i = 0; i < count; i++) {
    let x = (Math.random() - 0.5) * 5;
    let y = Math.random() * 2;
    let z = (Math.random() - 0.5) * 5;
    positions.set([x, y, z], i * 3);
    colors.set([1, 1, Math.random()], i * 3); 
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particleMaterial = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    uniforms.u_time.value += 0.02;
    particleSystem.rotation.y += 0.002; 
    renderer.render(scene, camera);
}

animate();

// Video Capture
const capturer = new CCapture({ format: 'webm', framerate: 60 });

document.getElementById('recordButton').addEventListener('click', () => {
    capturer.start();
    console.log("Recording started...");

    function captureFrame() {
        capturer.capture(renderer.domElement);
        if (capturer._capturing) {
            requestAnimationFrame(captureFrame);
        }
    }
    
    captureFrame();
    
    setTimeout(() => {
        capturer.stop();
        capturer.save();
        console.log("Recording finished!");
    }, 5000); // Captures 5 seconds
});

// Responsive Resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

