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
    const landingContent = document.getElementById('landing-content');

    // Animate only within the first 80% of the landing section
    const scrollPercent = Math.min(scrollY / (window.innerHeight * 0.8), 1);

    // Easing function for a smooth acceleration
    const easedScroll = scrollPercent * scrollPercent; // easeInQuad

    // --- 3D Model Animation ---

    // Move the cup up and slightly back
    model.position.y = -7 + easedScroll * 12;
    model.position.z = -5 - easedScroll * 5;

    // Rotate the cup
    model.rotation.y = easedScroll * Math.PI / 2;
    model.rotation.x = -easedScroll * Math.PI / 8;

    // --- Content Animation ---
    if (landingContent) {
        // Start revealing content after scrolling 40% of the way
        const contentScrollStart = 0.4;
        const contentScrollDuration = 0.4; // animate over 40% of scroll height

        let contentProgress = 0;
        if (scrollPercent >= contentScrollStart) {
            contentProgress = Math.min((scrollPercent - contentScrollStart) / contentScrollDuration, 1);
        }

        // Apply styles
        landingContent.style.opacity = contentProgress;
        landingContent.style.transform = `translateY(${50 - contentProgress * 50}px)`;
    }
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
