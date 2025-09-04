// Three.js scene setup
let scene, camera, renderer, model;
let idleAnimationId;

function init3D() {
    // Scene
    scene = new THREE.Scene();
    scene.background = null; // Make background transparent

    // Camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Renderer
    const canvas = document.getElementById('3d-canvas');
    renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    // Lighting
    const hemisphereLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 2.5);
    scene.add(hemisphereLight);

    const spotLight = new THREE.SpotLight(0xffa95c, 4);
    spotLight.position.set(-10, 20, 20);
    spotLight.angle = 0.2;
    spotLight.penumbra = 1;
    spotLight.castShadow = true;
    scene.add(spotLight);

    // Load model
    loadModel();

    // Event listeners
    window.addEventListener('resize', onWindowResize, false);

    // Initial call to onScroll to set the initial position
    onScroll();
}

function loadModel() {
    const loader = new THREE.GLTFLoader();
    loader.load(
        'base_basic_shaded.glb',
        function (gltf) {
            model = gltf.scene;

            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);

            model.scale.set(12, 12, 12);
            model.position.y = -7;
            scene.add(model);

            document.addEventListener('scroll', onScroll, false);

            // Start the animation loop only after the model is loaded
            if (!idleAnimationId) {
                animate();
            }
        },
        undefined,
        function (error) {
            console.error('An error happened while loading the model:', error);
        }
    );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onScroll() {
    if (!model) return;

    const scrollY = window.scrollY;
    // Animate only within the landing section (first viewport height)
    const scrollPercent = Math.min(scrollY / window.innerHeight, 1);

    // Use easing function for smoother transition
    const easedScroll = 1 - Math.pow(1 - scrollPercent, 3); // easeOutCubic

    // Animate position
    model.position.x = -20 + easedScroll * 40; // Move from left to right across the screen
    model.position.z = -5 + easedScroll * 5;  // Move slightly forward

    // Animate rotation
    model.rotation.y = -Math.PI / 4 + easedScroll * (Math.PI * 1.5); // Rotate 270 degrees
    model.rotation.x = easedScroll * Math.PI / 8; // Tilt slightly
}

function animate() {
    idleAnimationId = requestAnimationFrame(animate);

    // Add a very subtle idle bobbing animation
    if (model) {
        const time = Date.now() * 0.0005;
        model.position.y = -7 + Math.sin(time) * 0.2;
    }

    renderer.render(scene, camera);
}

export { init3D };
