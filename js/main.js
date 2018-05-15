var container, stats, camera, controls, scene, renderer, planet, ocean, gui, params, perlinNoiseGen, ms_Ocean, ring;
var noiseTime = 0.0, lastNoiseTime = 0.0;
var clock = new THREE.Clock();
var worldWidth = 256, worldDepth = 256,
worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;
var lastTime = (new Date()).getTime();

window.onload = function() {
    init();
    animate();
}

function init() {
    init_gui();
    init_scene();
    init_renderer();
    init_light();
    init_geometries();
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

function init_light() {
    var sunlight = new THREE.DirectionalLight(0xffffff);
    sunlight.position.set(-0.3, 1, -1).normalize();
    sunlight.intensity = 1.0;
    scene.add(sunlight);
    var ambientlight = new THREE.AmbientLight(0xffffff);
    ambientlight.intensity = 0.4;
    scene.add(ambientlight);
}

function init_geometries() {
	ms_Ocean = new THREE.Ocean(renderer, camera, scene,
	{
		INITIAL_SIZE : 1536.0,
		INITIAL_WIND : [2.0, 2.0],
		INITIAL_CHOPPINESS : 1.5,
		CLEAR_COLOR : [1.0, 1.0, 1.0, 0.0],
		GEOMETRY_ORIGIN : [-256.0, -256.0],
		SUN_DIRECTION : [-1.0, 1.0, 1.0],
		OCEAN_COLOR: new THREE.Vector3(0.004, 0.016, 0.047),
		SKY_COLOR: new THREE.Vector3(3.2, 9.6, 12.8),
		EXPOSURE : 0.3,
		GEOMETRY_RESOLUTION: 512,
		GEOMETRY_SIZE : 512,
		RESOLUTION : 1024
	});
	ms_Ocean.materialOcean.uniforms.u_projectionMatrix = { value: camera.projectionMatrix };
	ms_Ocean.materialOcean.uniforms.u_viewMatrix = { value: camera.matrixWorldInverse };
	ms_Ocean.materialOcean.uniforms.u_cameraPosition = { value: new THREE.Vector3(200.0, 150.0, 200.0) };
    addOceanGui();
    var planetGeometry = new PlanetGeometry(params.radius, params.detail);
    var planetMat = planetMaterial(texture.material);
    planet = new THREE.Mesh(planetGeometry, planetMat);
    planet.geometry.applyColor(texture.coloring);
    var oceanGeometry = new THREE.SphereGeometry(sealevel(), 80, 60);
    var oceanMat = ms_Ocean.materialOcean;
    ocean = new THREE.Mesh(oceanGeometry, oceanMat);
    var ringGeometry = new THREE.XRingGeometry(110, 150, 80, 5, 0, Math.PI * 2);
    var ringMat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('rings/saturnringcolor.jpg'),
    side: THREE.DoubleSide, transparent: true, alphaMap: new THREE.TextureLoader().load('rings/saturnringpattern.png')});
    ring = new THREE.Mesh(ringGeometry, ringMat);
    ring.visible = false;
    addRingGui();
    scene.add(ocean);
    scene.add(planet);
    scene.add(ring);
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
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    controls.update(clock.getDelta());
    var currentTime = new Date().getTime();
    ms_Ocean.deltaTime = (currentTime - lastTime) / 1000 || 0.0;
    lastTime = currentTime;
    ms_Ocean.render(ms_Ocean.deltaTime);
    ms_Ocean.overrideMaterial = ms_Ocean.materialOcean;
    if (ms_Ocean.changed) {
      ms_Ocean.materialOcean.uniforms.u_size.value = ms_Ocean.size;
      ms_Ocean.materialOcean.uniforms.u_sunDirection.value.set( ms_Ocean.sunDirectionX, ms_Ocean.sunDirectionY, ms_Ocean.sunDirectionZ );
      ms_Ocean.materialOcean.uniforms.u_exposure.value = ms_Ocean.exposure;
      ms_Ocean.changed = false;
    }
    ms_Ocean.materialOcean.uniforms.u_normalMap.value = ms_Ocean.normalMapFramebuffer.texture;
    ms_Ocean.materialOcean.uniforms.u_displacementMap.value = ms_Ocean.displacementMapFramebuffer.texture;
    ms_Ocean.materialOcean.uniforms.u_projectionMatrix.value = camera.projectionMatrix;
    ms_Ocean.materialOcean.uniforms.u_viewMatrix.value = camera.matrixWorldInverse;
    ms_Ocean.materialOcean.depthTest = true;
    if (params.noise_timestep != 0) {
        lastNoiseTime = noiseTime;
        noiseTime += params.noise_timestep;
        refreshHeight();
    } else if (lastNoiseTime != noiseTime) {
        lastNoiseTime = noiseTime;
        if (texture.coloring != 'none') refreshColor();
    }
    renderer.render(scene, camera);
}
