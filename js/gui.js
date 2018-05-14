function init_gui() {
    params = {radius: 100, detail: 6, water: 51};
    perlinNoiseGen = {quality: 0.5, steps: 0, factor: 2.0, scale: 1.0};
    texture = {coloring: "earth1", material: "grass"};
    gui = new dat.GUI();
    var fGeo= gui.addFolder('Geometry');
    fGeo.add(params, 'radius', 10, 1000).step(10).name('Radius');
    fGeo.add(params, 'detail', 0, 7).step(1).name('Level of Detail').onChange(refreshPlanet);
    fGeo.add(params, 'water', 0, 100).step(1).name('Sea Level').onChange(refreshOcean);
    var fNoise = gui.addFolder('Terrain Generation');
    fNoise.add(perlinNoiseGen, 'quality', 0.001, 1).step(0.0001).name('Perlin Quality').onChange(refreshHeight);
    fNoise.add(perlinNoiseGen, 'steps', 0, 20).step(1).name('Perlin Steps').onChange(refreshHeight);
    fNoise.add(perlinNoiseGen, 'factor', 0, 20).name('Perlin Factor').onChange(refreshHeight);
    fNoise.add(perlinNoiseGen, 'scale', 1, 3).name('Perlin Scale').onChange(refreshHeight);
    var fText = gui.addFolder('Texture');
    gui.fText = fText;
    fText.add(texture, 'coloring',
        ['earth1','earth2','desert1','desert2','desert3','frost1','frost2','lava1','lava2','nether']
    ).name('Biome').onChange(refreshColor);
    fText.add(texture, 'material', ['grass','planet','sand','none']).name('Texture').onChange(refreshMaterialType);
}

function refreshPlanet(value) {
    planet.geometry = new PlanetGeometry(params.radius, params.detail);
    refreshHeight();
}

function refreshOcean(value) {
    ocean.geometry = new THREE.SphereGeometry(params.water + 50, 80, 60);
}

function refreshHeight(value) {
    planet.geometry.applyHeightMap(new ModPerlinGenerator(perlinNoiseGen.quality, perlinNoiseGen.steps, perlinNoiseGen.factor, perlinNoiseGen.scale));
}

function refreshColor(value) {
    planet.geometry.applyColor(texture.coloring);
}

function refreshMaterialType(value) {
    planet.material = planetMaterial(texture.material);
}

dat.GUI.prototype.removeFolder = function(name) {
    this.__folders[name].close();
    this.__folders[name].domElement.parentNode.parentNode.removeChild(this.__folders[name].domElement.parentNode);
    this.__folders[name] = undefined;
    this.onResize();
}
