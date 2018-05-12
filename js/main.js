var container, stats;
var camera, controls, scene, renderer;
var mesh, texture;
var worldWidth = 256, worldDepth = 256,
worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;
var clock = new THREE.Clock();
var planet;
var gui;

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

function init_gui() {
    gui = new dat.GUI();
}

function init_scene() {
    container = document.getElementById('container');
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 20000);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);
    controls = new THREE.OrbitControls(camera);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 100;
    controls.maxPolarAngle = Math.PI / 2;
    camera.position.x= 150.0;
    camera.position.y= 150.0;
    camera.position.z= 150.0;
    camera.rotation.x = -22.5*Math.PI/180;
    camera.rotation.y = 45*Math.PI/180;
    camera.rotation.z = 15*Math.PI/180;
}

function init_light() {var data = generateHeight(worldWidth, worldDepth);
    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set(0, 1, 1).normalize();
    light.intensity = 0.9;
    scene.add(light);
}

function init_geometries() {
    planet = new PlanetGeometry(100, 5);
    var material = new THREE.MeshPhongMaterial({color: 0x55ff55, flatShading: true});
    var planetMesh = new THREE.Mesh(planet, material);
    planet.applyHeightMap();
    scene.add(planetMesh);
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
