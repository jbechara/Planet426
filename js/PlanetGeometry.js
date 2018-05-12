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

    return this;
}

PlanetGeometry.prototype = Object.create(THREE.Geometry.prototype);

PlanetGeometry.prototype.applyHeightMap = function(noiseGen) {
    var r = this.parameters.radius;
    for (var i = this.vertices.length - 1; i >= 0; i--) {
        var noise =
        this.vertices[i].normalize().multiplyScalar(r +
          noiseGen.generate(this.vertices[i].x, this.vertices[i].y, this.vertices[i].z));
    }
    this.verticesNeedUpdate = true;
};
