function init_gui() {
    params = {radius: 100, detail: 6, water: 52};
    perlinNoiseGen = {quality: 0.5, steps: 0, factor: 2.0, scale: 1.0};
    texture = {type: "earth1"};

    gui = new dat.GUI();
    gui.add(params, 'radius', 10, 1000).step(10).name('Radius');
    gui.add(params, 'detail', 0, 7).step(1).name('Level of Detail').onChange(refreshPlanet);
    gui.add(params, 'water', 0, 100).step(1).name('Sea Level').onChange(refreshOcean);
    gui.add(perlinNoiseGen, 'quality', 0.001, 1).step(0.0001).name('Perlin Quality').onChange(refreshHeight);
    gui.add(perlinNoiseGen, 'steps', 0, 20).step(1).name('Perlin Steps').onChange(refreshHeight);
    gui.add(perlinNoiseGen, 'factor', 0, 20).name('Perlin Factor').onChange(refreshHeight);
    gui.add(perlinNoiseGen, 'scale', 1, 3).name('Perlin Scale').onChange(refreshHeight);
    gui.add(texture, 'type',
        ['earth1','earth2','desert1','desert2','desert3','frost1','frost2','lava1','lava2','nether']
    ).name('Biome').onChange(refreshColor);
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
    planet.geometry.applyColor(texture.type);
}
