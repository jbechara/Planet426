var container, stats;
var camera, controls, scene, renderer;
var mesh, texture;
var worldWidth = 256, worldDepth = 256,
worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;
var clock = new THREE.Clock();

window.onload = function() {
    init();
    animate();
}

function init() {
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
    var geometry = new PlanetGeometry(100, 5);
    var material = new THREE.MeshPhongMaterial({color: 0x55ff55, flatShading: true});
    var planet = new THREE.Mesh(geometry, material);
    geometry.applyHeightMap();
    console.log(geometry);
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

function generateHeight( width, height ) {
    var size = width * height, data = new Uint8Array( size );
    perlin = new ImprovedNoise(), quality = 1, z = Math.random() * 100;
    for ( var j = 0; j < 4; j ++ ) {
        for ( var i = 0; i < size; i ++ ) {
            var x = i % width, y = ~~ ( i / width );
            data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );
        }
        quality *= 5;
    }
    return data;
}

function generateTexture( data, width, height ) {
    var canvas, canvasScaled, context, image, imageData,
    level, diff, vector3, sun, shade;
    vector3 = new THREE.Vector3( 0, 0, 0 );
    sun = new THREE.Vector3( 1, 1, 1 );
    sun.normalize();
    canvas = document.createElement( 'canvas' );
    canvas.width = width;
    canvas.height = height;
    context = canvas.getContext( '2d' );
    context.fillStyle = '#000';
    context.fillRect( 0, 0, width, height );
    image = context.getImageData( 0, 0, canvas.width, canvas.height );
    imageData = image.data;
    for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {
        vector3.x = data[ j - 2 ] - data[ j + 2 ];
        vector3.y = 2;
        vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
        vector3.normalize();
        shade = vector3.dot( sun );
        imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
        imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
        imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
    }
    context.putImageData( image, 0, 0 );
    // Scaled 4x
    canvasScaled = document.createElement( 'canvas' );
    canvasScaled.width = width * 4;
    canvasScaled.height = height * 4;
    context = canvasScaled.getContext( '2d' );
    context.scale( 4, 4 );
    context.drawImage( canvas, 0, 0 );
    image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
    imageData = image.data;
    for ( var i = 0, l = imageData.length; i < l; i += 4 ) {
        var v = ~~ ( Math.random() * 5 );
        imageData[ i ] += v;
        imageData[ i + 1 ] += v;
        imageData[ i + 2 ] += v;
    }
    context.putImageData( image, 0, 0 );
    return canvasScaled;
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    controls.update(clock.getDelta());
    renderer.render(scene, camera);
}
