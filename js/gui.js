function init_gui() {
    params = {radius: 100, detail: 6};
    perlinNoiseGen = {quality: 0.5, steps: 0, factor: 1.75, scale: 1};

    gui = new dat.GUI();
    gui.add(params, 'radius', 10, 1000).step(10).name('Radius').onChange(refreshGeometry);
    gui.add(params, 'detail', 0, 7).step(1).name('Level of Detail').onChange(refreshGeometry);
    gui.add(perlinNoiseGen, 'quality', 0.001, 1).step(0.001).name('Perlin Quality').onChange(refreshHeight);
    gui.add(perlinNoiseGen, 'steps', 0, 10).step(1).name('Perlin Steps').onChange(refreshHeight);
    gui.add(perlinNoiseGen, 'factor', 0, 10).name('Perlin Factor').onChange(refreshHeight);
    gui.add(perlinNoiseGen, 'scale', 0, 10).name('Perlin Scale').onChange(refreshHeight);
}

function refreshGeometry(value) {
    planet.geometry = new PlanetGeometry(params.radius, params.detail);
}

function refreshHeight(value) {
    planet.geometry.applyHeightMap(new PerlinGenerator(perlinNoiseGen.quality, perlinNoiseGen.steps, perlinNoiseGen.factor, perlinNoiseGen.scale));
}
