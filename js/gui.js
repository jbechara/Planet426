function init_gui() {
    params = {radius: 100, detail: 6, water: 52, water_color: 0x01040c,
        noise_timestep: 0.0};
    perlinNoiseGen = {quality: 0.5, steps: 0, factor: 2.0, scale: 1.0};
    texture = {coloring: 'none', material: 'none', baseColor: 0x010101};
    gui = new dat.GUI();
    var buttons = { color: refreshColor, stop: function() { params.noise_timestep = 0; } };
    var fNoise = gui.addFolder('Planet Topology');
    fNoise.add(params, 'radius', 10, 1000).step(10).name('Radius');
    fNoise.add(params, 'detail', 0, 7).step(1).name('Level of Detail').onChange(refreshPlanet);
    fNoise.add(perlinNoiseGen, 'quality', 0.001, 1).step(0.0001).name('Perlin Quality').onChange(refreshHeight);
    fNoise.add(perlinNoiseGen, 'steps', 0, 20).step(1).name('Perlin Steps').onChange(refreshHeight);
    fNoise.add(perlinNoiseGen, 'factor', 0, 20).name('Perlin Factor').onChange(refreshHeight);
    fNoise.add(perlinNoiseGen, 'scale', 1, 3).name('Perlin Scale').onChange(refreshHeight);
    fNoise.add(params, 'noise_timestep', -0.5001, 0.5001).step(0.001).name('Perlin Speed');
    fNoise.add(buttons, 'stop').name('Stop Animation');
    var fText = gui.addFolder('Planet Texture');
    gui.fText = fText;
    fText.add(texture, 'coloring',
        ['none','earth1','earth2','desert1','desert2','desert3','frost1','frost2','lava1','lava2','nether']
    ).name('Biome').onChange(refreshColor);
    fText.add(texture, 'material', ['none','grass','soil','dirt','sand','redsand','sandstone','carvedlimestone','cave',
                                    'wornstone','redstone','redrock','blackrock','granite','streakedstone','pockedstone','planet','lunar','crateredrock', 'phong', 'toon']).name('Texture').onChange(refreshMaterialType);
    fText.add(buttons, 'color').name('Refresh Texture');
}

function refreshPlanet(value) {
    planet.geometry = new PlanetGeometry(params.radius, params.detail);
    refreshHeight();
    refreshColor();
}

function refreshOcean(value) {
    ocean.geometry = new THREE.SphereGeometry(params.water + 50, 80, 60);
}

function refreshHeight(value) {
    planet.geometry.applyHeightMap(new ModPerlinGenerator(perlinNoiseGen.quality,
        perlinNoiseGen.steps, perlinNoiseGen.factor, perlinNoiseGen.scale));
}

function refreshColor(value) {
    if (texture.coloring != 'none') {
        if (planet.material.vertexColors != THREE.VertexColors) {
            planet.material.vertexColors = THREE.VertexColors;
            planet.material.needsUpdate = true;
        }
        planet.geometry.applyColor(texture.coloring);
    }
    else {
        if (planet.material.vertexColors == THREE.VertexColors && texture.material != 'none') {
            planet.material.vertexColors = 0;
            planet.material.needsUpdate = true;
        }
        refreshMaterialType();
    }
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

function addOceanGui() {
    var fOcean = gui.addFolder("Ocean");
    fOcean.add(params, 'water', 0, 100).name('Sea Level').onChange(refreshOcean);
    var c1 = fOcean.add(ms_Ocean, "size", 100, 5000).name("Size");
	c1.onChange(function(v) {
		this.object.size = v;
		this.object.changed = true;
	});
	var c2 = fOcean.add(ms_Ocean, "choppiness", 0.1, 4).name("Choppiness");
	c2.onChange(function (v) {
		this.object.choppiness = v;
		this.object.changed = true;
	});
	var c3 = fOcean.add(ms_Ocean, "windX",-15, 15).name("Wind X");
	c3.onChange(function (v) {
		this.object.windX = v;
		this.object.changed = true;
	});
	var c4 = fOcean.add(ms_Ocean, "windY", -15, 15).name("Wind Y");
	c4.onChange(function (v) {
		this.object.windY = v;
		this.object.changed = true;
	});
	var c5 = fOcean.add(ms_Ocean, "sunDirectionX", -1.0, 1.0).name("Sun X");
	c5.onChange(function (v) {
		this.object.sunDirectionX = v;
		this.object.changed = true;
	});
	var c6 = fOcean.add(ms_Ocean, "sunDirectionY", -1.0, 1.0).name("Sun Y");
	c6.onChange(function (v) {
		this.object.sunDirectionY = v;
		this.object.changed = true;
	});
	var c7 = fOcean.add(ms_Ocean, "sunDirectionZ", -1.0, 1.0).name("Sun Z");
	c7.onChange(function (v) {
		this.object.sunDirectionZ = v;
		this.object.changed = true;
	});
	var c8 = fOcean.add(ms_Ocean, "exposure", 0.0, 0.5).name("Exposure");
	c8.onChange(function (v) {
		this.object.exposure = v;
		this.object.changed = true;
	});
    var c9 = fOcean.add(ms_Ocean.oceanColor, "x", 0.0, 1.0).step(0.001).name("Water Color R");
    c9.onChange(function (v) {
        this.object.x = v;
        ms_Ocean.changed = true;
    });
    var c10 = fOcean.add(ms_Ocean.oceanColor, "y", 0.0, 1.0).step(0.001).name("Water Color G");
    c10.onChange(function (v) {
        this.object.y = v;
        ms_Ocean.changed = true;
    });
    var c11 = fOcean.add(ms_Ocean.oceanColor, "z", 0.0, 1.0).step(0.001).name("Water Color B");
    c11.onChange(function (v) {
        this.object.z = v;
        ms_Ocean.changed = true;
    });
    var c12 = fOcean.add(ms_Ocean.skyColor, "x", 0.0, 255.0).step(0.1).name("Sky Color R");
    c12.onChange(function (v) {
        this.object.x = v;
        ms_Ocean.changed = true;
    });
    var c13 = fOcean.add(ms_Ocean.skyColor, "y", 0.0, 255.0).step(0.1).name("Sky Color G");
    c13.onChange(function (v) {
        this.object.y = v;
        ms_Ocean.changed = true;
    });
    var c14 = fOcean.add(ms_Ocean.skyColor, "z", 0.0, 255.0).step(0.1).name("Sky Color B");
    c14.onChange(function (v) {
        this.object.z = v;
        ms_Ocean.changed = true;
    });
}

function addRingGui() {
    var fRing = gui.addFolder("Ring");
    var buttons = {ringHide: function() { ring.visible = !ring.visible; }};
    fRing.add(buttons, 'ringHide').name('Toggle Ring');
    var c1 = fRing.add(ring.geometry.parameters, "innerRadius", 100, 200).name("Inner Radius");
	c1.onChange(function(v) {
        ring.geometry = new THREE.XRingGeometry(v,
            ring.geometry.parameters.outerRadius, ring.geometry.parameters.thetaSegments,
            ring.geometry.parameters.phiSegments, ring.geometry.parameters.thetaStart,
            ring.geometry.parameters.thetaLength);
	});
    var c2 = fRing.add(ring.geometry.parameters, "outerRadius", 100, 200).name("Outer Radius");
	c2.onChange(function(v) {
        ring.geometry = new THREE.XRingGeometry(ring.geometry.parameters.innerRadius,
            v, ring.geometry.parameters.thetaSegments,
            ring.geometry.parameters.phiSegments, ring.geometry.parameters.thetaStart,
            ring.geometry.parameters.thetaLength);
	});
    var c3 = fRing.add(ring.rotation, "x", 0.0, 2*Math.PI).name("Rotation X");
	c3.onChange(function(v) {
		this.object.x = v;
		this.object.changed = true;
	});
    var c4 = fRing.add(ring.rotation, "y", 0.0, 2*Math.PI).name("Rotation Y");
	c4.onChange(function(v) {
		this.object.y = v;
		this.object.changed = true;
	});
    var c5 = fRing.add(ring.rotation, "z", 0.0, 2*Math.PI).name("Rotation Z");
	c5.onChange(function(v) {
		this.object.z = v;
		this.object.changed = true;
	});
    var c6 = fRing.add(ring.material.color, "r", 0.0, 1.0).name("Color R");
	c3.onChange(function(v) {
		this.object.r = v;
		this.object.changed = true;
	});
    var c7 = fRing.add(ring.material.color, "g", 0.0, 1.0).name("Color G");
	c4.onChange(function(v) {
		this.object.g = v;
		this.object.changed = true;
	});
    var c8 = fRing.add(ring.material.color, "b", 0.0, 1.0).name("Color B");
	c5.onChange(function(v) {
		this.object.b = v;
		this.object.changed = true;
	});
}

function refreshRing() {

}
