// A wrapper of IcosahedronGeometry for planetoids

// PlanetGeometry
function PlanetGeometry(radius, detail, sealevel) {
    THREE.Geometry.call(this);

    this.type = 'PlanetGeometry';
    this.parameters = {
        radius: radius,
        detail: detail,
        sealevel: sealevel
    };

    this.fromBufferGeometry(new THREE.IcosahedronBufferGeometry(radius, detail));
    this.mergeVertices();

    this.vertexIndices = ['a', 'b', 'c'];
    this.colorUtil = new ColorUtil();

    this.peak = this.parameters.radius;

    return this;
}

PlanetGeometry.prototype = Object.create(THREE.Geometry.prototype);

PlanetGeometry.prototype.applyHeightMap = function (noiseGen) {
    var r = this.parameters.radius;
    var max_height = - Infinity;
    for (var i = this.vertices.length - 1; i >= 0; i--) {
        this.vertices[i].normalize();
        var scale = r + noiseGen.generate(this.vertices[i].x, this.vertices[i].y,
                                          this.vertices[i].z, false);
        max_height = Math.max(max_height, scale);
        this.vertices[i].multiplyScalar(scale);
    }
    this.peak = max_height;
    this.verticesNeedUpdate = true;
    // this.applyLinAltColor(new THREE.Color(0x246024), new THREE.Color(0x471c01));
    // this.applyTurbulenceColor(new THREE.Color(0xee7f2d), new THREE.Color(0xff0000), new PerlinGenerator()); // Lava
    // this.applySplineAltColor([new THREE.Color(0x246024), new THREE.Color(0x471c01),
    //     new THREE.Color(0xcccccc), new THREE.Color(0xffffff)]); // Earth
    // this.applySplineAltColor([new THREE.Color(0x766621), new THREE.Color(0x9c4f20),
    //     new THREE.Color(0xdaa46d), new THREE.Color(0xfbe1b6)]); // Kinda Desert
    this.applySplineAltColor([new THREE.Color(0xffffff), new THREE.Color(0xdddddd), new THREE.Color(0xbbbbbb),
        new THREE.Color(0xa1d7ec), new THREE.Color(0x8bbbce)]); // Frost
    // this.applySplineAltColor([new THREE.Color(0x553333), new THREE.Color(0xcc4422), new THREE.Color(0xff6600),
    //     new THREE.Color(0xffff44), new THREE.Color(0xeadab5)]); // Fire Asteroid
    // this.applySplinePerturbColor([new THREE.Color(0xeadab5),
    //     new THREE.Color(0xdaa46d), new THREE.Color(0xfbe1b6)], new PerlinGenerator()); // Kinda Desert Perturb
    // this.applyLinPerturbColor(new THREE.Color(0xff6600), new THREE.Color(0xcc4422), new PerlinGenerator()); // Better Lava?
    // this.applyAltNoiseColor([new THREE.Color(0xffffff), new THREE.Color(0xdddddd), new THREE.Color(0xbbbbbb),
    //     new THREE.Color(0xa1d7ec), new THREE.Color(0x8bbbce)], [new THREE.Color(0x246024), new THREE.Color(0x471c01),
    //     new THREE.Color(0xcccccc), new THREE.Color(0xffffff)], new PerlinGenerator()); // Earth: 8, 7.4, 1.7
    // this.applyLinNoiseColor(new THREE.Color(0xfbe1b6), new THREE.Color(0xdaa46d), new PerlinGenerator()); // Desert
    // this.applySplineNoiseColor([new THREE.Color(0xffffff), new THREE.Color(0xdddddd), new THREE.Color(0xbbbbbb),
    //     new THREE.Color(0xa1d7ec), new THREE.Color(0x8bbbce)], new PerlinGenerator()); // Frost Noise
};

PlanetGeometry.prototype.applyLinAltColor = function (c1, c2) {
    // For each face
    for (var i = this.faces.length - 1; i >= 0; i--) {
        // For each vertex
        for (var j = 0; j < 3; j++) {
            var vertex = this.vertices[this.faces[i][this.vertexIndices[j]]];
            this.faces[i].vertexColors[j] = this.colorUtil.lerpColors(c1, c2,
            (vertex.length()-this.parameters.sealevel)/(this.peak-this.parameters.sealevel));
        }
    }
    this.colorsNeedUpdate = true;
}

PlanetGeometry.prototype.applyLinNoiseColor = function (c1, c2, noiseGen) {
    // For each face
    for (var i = this.faces.length - 1; i >= 0; i--) {
        // For each vertex
        for (var j = 0; j < 3; j++) {
            var vertex = this.vertices[this.faces[i][this.vertexIndices[j]]];
            var scale = (vertex.length()-this.parameters.sealevel)/(this.peak-this.parameters.sealevel);
            this.faces[i].vertexColors[j] = this.colorUtil.lerpNoiseColors(c1, c2,
                vertex.clone().normalize().divideScalar(scale), noiseGen);
        }
    }
    this.colorsNeedUpdate = true;
}

PlanetGeometry.prototype.applyTurbulenceColor = function (c1, c2, noiseGen) {
    // For each face
    for (var i = this.faces.length - 1; i >= 0; i--) {
        // For each vertex
        for (var j = 0; j < 3; j++) {
            var vertex = this.vertices[this.faces[i][this.vertexIndices[j]]];
            this.faces[i].vertexColors[j] = this.colorUtil.turbulence(c1, c2, vertex, noiseGen);
        }
    }
    this.colorsNeedUpdate = true;
}

PlanetGeometry.prototype.applyLinPerturbColor = function (c1, c2, noiseGen) {
    // For each face
    for (var i = this.faces.length - 1; i >= 0; i--) {
        // For each vertex
        for (var j = 0; j < 3; j++) {
            var vertex = this.vertices[this.faces[i][this.vertexIndices[j]]];
            this.faces[i].vertexColors[j] = this.colorUtil.lerpColors(c1, c2,
            (this.colorUtil.perturb(vertex, noiseGen).length()-this.parameters.sealevel)
            /(this.peak-this.parameters.sealevel));
        }
    }
    this.colorsNeedUpdate = true;
}

PlanetGeometry.prototype.applySplineAltColor = function (colors) {
    // Create the spline
    this.colorUtil.createSpline(colors);
    // For each face
    for (var i = this.faces.length - 1; i >= 0; i--) {
        // For each vertex
        for (var j = 0; j < 3; j++) {
            var vertex = this.vertices[this.faces[i][this.vertexIndices[j]]];
            this.faces[i].vertexColors[j] = this.colorUtil.serpColors(
                (vertex.length()-this.parameters.sealevel)/(this.peak-this.parameters.sealevel));
        }
    }
    this.colorsNeedUpdate = true;
}

PlanetGeometry.prototype.applySplineNoiseColor = function (colors, noiseGen) {
    // Create the spline
    this.colorUtil.createSpline(colors);
    // For each face
    for (var i = this.faces.length - 1; i >= 0; i--) {
        // For each vertex
        for (var j = 0; j < 3; j++) {
            var vertex = this.vertices[this.faces[i][this.vertexIndices[j]]];
            var scale = (vertex.length()-this.parameters.sealevel)/(this.peak-this.parameters.sealevel);
            this.faces[i].vertexColors[j] = this.colorUtil.serpNoiseColors(
                vertex.clone().normalize().divideScalar(scale), noiseGen);
        }
    }
    this.colorsNeedUpdate = true;
}

PlanetGeometry.prototype.applySplinePerturbColor = function (colors, noiseGen) {
    // Create the spline
    this.colorUtil.createSpline(colors);
    // For each face
    for (var i = this.faces.length - 1; i >= 0; i--) {
        // For each vertex
        for (var j = 0; j < 3; j++) {
            var vertex = this.vertices[this.faces[i][this.vertexIndices[j]]];
            this.faces[i].vertexColors[j] = this.colorUtil.serpColors(
            (this.colorUtil.perturb(vertex, noiseGen).length()-this.parameters.sealevel)
            /(this.peak-this.parameters.sealevel));
        }
    }
    this.colorsNeedUpdate = true;
}

PlanetGeometry.prototype.applyAltNoiseColor = function (colors1, colors2, noiseGen) {
    // Create two splines
    this.colorUtil.createSpline(colors1);
    this.colorUtil2 = new ColorUtil();
    this.colorUtil2.createSpline(colors2);
    // For each face
    for (var i = this.faces.length - 1; i >= 0; i--) {
        // For each vertex
        for (var j = 0; j < 3; j++) {
            var vertex = this.vertices[this.faces[i][this.vertexIndices[j]]];
            // First, spline interpolate on each color set seperately
            var c1 = this.colorUtil.serpColors((this.colorUtil.perturb(vertex, noiseGen).length()-this.parameters.sealevel)/(this.peak-this.parameters.sealevel));
            var c2 = this.colorUtil2.serpColors((this.colorUtil.perturb(vertex, noiseGen).length()-this.parameters.sealevel)/(this.peak-this.parameters.sealevel));
            // Then, interpolate c1 and c2 using linear noisy interpolation
            this.faces[i].vertexColors[j] = this.colorUtil.lerpNoiseColors(c1, c2, vertex.clone().normalize(), noiseGen);
        }
    }
    this.colorsNeedUpdate = true;
}
