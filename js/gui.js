function init_gui() {
    params = {radius: 100, detail: 6, water: 52, water_color: 0x01040c, noise_timestep: 0.0};
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
    gui.add(params, 'noise_timestep', -0.5, 0.5).step(0.001).name('Perlin Speed');
    gui.add(texture, 'type',
        ['earth1','earth2','desert1','desert2','desert3','frost1','frost2','lava1','lava2','nether']
    ).name('Biome').onChange(refreshColor);
    var buttons = { color: refreshColor, stop: function() {params.noise_timestep = 0;} };
    gui.add(buttons,'stop').name('Stop Animation');
    gui.add(buttons,'color').name('Refresh Texture');
}

function refreshPlanet(value) {
    planet.geometry = new PlanetGeometry(params.radius, params.detail);
    refreshHeight();
}

function refreshOcean(value) {
    ocean.geometry = new THREE.SphereGeometry(params.water + 50, 80, 60);
}

function refreshHeight(value) {
    planet.geometry.applyHeightMap(new ModPerlinGenerator(perlinNoiseGen.quality,
        perlinNoiseGen.steps, perlinNoiseGen.factor, perlinNoiseGen.scale));
}

function refreshColor(value) {
    planet.geometry.applyColor(texture.type);
}

function addOceanGui() {
    var c1 = gui.add(ms_Ocean, "size", 100, 5000);
	c1.onChange(function(v) {
		this.object.size = v;
		this.object.changed = true;
	});
	var c2 = gui.add(ms_Ocean, "choppiness", 0.1, 4);
	c2.onChange(function (v) {
		this.object.choppiness = v;
		this.object.changed = true;
	});
	var c3 = gui.add(ms_Ocean, "windX",-15, 15);
	c3.onChange(function (v) {
		this.object.windX = v;
		this.object.changed = true;
	});
	var c4 = gui.add(ms_Ocean, "windY", -15, 15);
	c4.onChange(function (v) {
		this.object.windY = v;
		this.object.changed = true;
	});
	var c5 = gui.add(ms_Ocean, "sunDirectionX", -1.0, 1.0);
	c5.onChange(function (v) {
		this.object.sunDirectionX = v;
		this.object.changed = true;
	});
	var c6 = gui.add(ms_Ocean, "sunDirectionY", -1.0, 1.0);
	c6.onChange(function (v) {
		this.object.sunDirectionY = v;
		this.object.changed = true;
	});
	var c7 = gui.add(ms_Ocean, "sunDirectionZ", -1.0, 1.0);
	c7.onChange(function (v) {
		this.object.sunDirectionZ = v;
		this.object.changed = true;
	});
	var c8 = gui.add(ms_Ocean, "exposure", 0.0, 0.5);
	c8.onChange(function (v) {
		this.object.exposure = v;
		this.object.changed = true;
	});
    var c9 = gui.add(ms_Ocean.oceanColor, "x", 0.0, 1.0).step(0.001).name("Water Color R");
    c9.onChange(function (v) {
        this.object.x = v;
        ms_Ocean.changed = true;
    });
    var c10 = gui.add(ms_Ocean.oceanColor, "y", 0.0, 1.0).step(0.001).name("Water Color G");
    c10.onChange(function (v) {
        this.object.y = v;
        ms_Ocean.changed = true;
    });
    var c11 = gui.add(ms_Ocean.oceanColor, "z", 0.0, 1.0).step(0.001).name("Water Color B");
    c11.onChange(function (v) {
        this.object.z = v;
        ms_Ocean.changed = true;
    });
    var c12 = gui.add(ms_Ocean.skyColor, "x", 0.0, 255.0).step(0.1).name("Sky Color R");
    c12.onChange(function (v) {
        this.object.x = v;
        ms_Ocean.changed = true;
    });
    var c13 = gui.add(ms_Ocean.skyColor, "y", 0.0, 255.0).step(0.1).name("Sky Color G");
    c13.onChange(function (v) {
        this.object.y = v;
        ms_Ocean.changed = true;
    });
    var c14 = gui.add(ms_Ocean.skyColor, "z", 0.0, 255.0).step(0.1).name("Sky Color B");
    c14.onChange(function (v) {
        this.object.z = v;
        ms_Ocean.changed = true;
    });
}
