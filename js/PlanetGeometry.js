// A wrapper of IcosahedronGeometry for planetoids

// PlanetGeometry
function PlanetGeometry(radius, detail) {
    THREE.Geometry.call(this);

    this.type = 'PlanetGeometry';
    this.parameters = {
        radius: radius,
        detail: detail
    };

    this.fromBufferGeometry(new THREE.IcosahedronBufferGeometry(radius, detail));
    this.mergeVertices();

    this.vertexIndices = ['a', 'b', 'c'];
    this.colorUtil = new ColorUtil();

    return this;
}

PlanetGeometry.prototype = Object.create(THREE.Geometry.prototype);

PlanetGeometry.prototype.applyHeightMap = function (noiseGen) {
    var r = this.parameters.radius;
    for (var i = this.vertices.length - 1; i >= 0; i--) {
        this.vertices[i].normalize().multiplyScalar(r +
          noiseGen.generate(this.vertices[i].x, this.vertices[i].y, this.vertices[i].z));
    }
    this.verticesNeedUpdate = true;
    // this.applyLinAltitudeColor(new THREE.Color(0x246024), new THREE.Color(0x471c01), params.water + 50);
    // Lava: this.applyTurbulenceColor(new THREE.Color(0xee7f2d), new THREE.Color(0xff0000), new PerlinGenerator());
    // Earth: this.applySplineAltitudeColor([new THREE.Color(0x246024), new THREE.Color(0x246024), new THREE.Color(0x471c01),
    //     new THREE.Color(0xcccccc), new THREE.Color(0xffffff)], params.water + 50);
    this.applySplineAltitudeColor([new THREE.Color(0xffffff), new THREE.Color(0xdddddd), new THREE.Color(0xbbbbbb),
        new THREE.Color(0xa1d7ec), new THREE.Color(0x8bbbce)], params.water + 50);
};

PlanetGeometry.prototype.applyLinAltitudeColor = function (c1, c2, seaLevel) {
    // For each face
    for (var i = this.faces.length - 1; i >= 0; i--) {
        // For each vertex
        for (var j = 0; j < 3; j++) {
            vertex = this.vertices[this.faces[i][this.vertexIndices[j]]];
            this.faces[i].vertexColors[j] = this.colorUtil.lerpColors(c1, c2, (vertex.length()-seaLevel)/10);
        }
    }
    this.colorsNeedUpdate = true;
}

PlanetGeometry.prototype.applyNoiseColor = function (c1, c2, noiseGen) {
    // For each face
    for (var i = this.faces.length - 1; i >= 0; i--) {
        // For each vertex
        for (var j = 0; j < 3; j++) {
            vertex = this.vertices[this.faces[i][this.vertexIndices[j]]];
            this.faces[i].vertexColors[j] = this.colorUtil.lerpNoiseColors(c1, c2, vertex, noiseGen);
        }
    }
    this.colorsNeedUpdate = true;
}

PlanetGeometry.prototype.applyTurbulenceColor = function (c1, c2, noiseGen) {
    // For each face
    for (var i = this.faces.length - 1; i >= 0; i--) {
        // For each vertex
        for (var j = 0; j < 3; j++) {
            vertex = this.vertices[this.faces[i][this.vertexIndices[j]]];
            this.faces[i].vertexColors[j] = this.colorUtil.turbulence(c1, c2, vertex, noiseGen);
        }
    }
    this.colorsNeedUpdate = true;
}

PlanetGeometry.prototype.applySplineAltitudeColor = function (colors, seaLevel) {
    // Create the spline
    this.colorUtil.createSpline(colors);
    // For each face
    for (var i = this.faces.length - 1; i >= 0; i--) {
        // For each vertex
        for (var j = 0; j < 3; j++) {
            vertex = this.vertices[this.faces[i][this.vertexIndices[j]]];
            this.faces[i].vertexColors[j] = this.colorUtil.serpColors(vertex.length()/this.parameters.radius);
        }
    }
    this.colorsNeedUpdate = true;
}
