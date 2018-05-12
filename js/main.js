var container, stats, camera, controls, scene, renderer, planet, ocean, gui, params, perlinNoiseGen;
var clock = new THREE.Clock();
var worldWidth = 256, worldDepth = 256,
worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;

window.onload = function() {
    init();
    animate();
}

function init() {
    init_gui();
    init_scene();
    init_light();
    init_geometries();
    init_renderer();
}

function init_scene() {
    container = document.getElementById('container');
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 20000);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);
    controls = new THREE.OrbitControls(camera, container);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 100;
    camera.position.x= 150.0;
    camera.position.y= 150.0;
    camera.position.z= 150.0;
    camera.rotation.x = -22.5*Math.PI/180;
    camera.rotation.y = 45*Math.PI/180;
    camera.rotation.z = 15*Math.PI/180;
}

function init_light() {var data = generateHeight(worldWidth, worldDepth);
    var sunlight = new THREE.DirectionalLight(0xffffff);
    sunlight.position.set(0, 1, 1).normalize();
    sunlight.intensity = 1.0;
    scene.add(sunlight);
    var ambientlight = new THREE.AmbientLight(0xffffff);
    ambientlight.intensity = 1.0;
    scene.add(ambientlight);
}

function init_geometries() {
    var oceanGeometry = new THREE.SphereGeometry(params.water + 50, 80, 60);
    var oceanMaterial = new THREE.MeshPhongMaterial({color: 0x141163});
    var planetGeometry = new PlanetGeometry(params.radius, params.detail);
    var planetMaterial = new THREE.MeshBasicMaterial({color: 0x33cc33});
    ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    planet = new THREE.Mesh(planetGeometry, planetMaterial);
    scene.add(ocean);
    scene.add(planet);
}

function init_renderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    controls.handleResize();
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    controls.update(clock.getDelta());
    renderer.render(scene, camera);
}
