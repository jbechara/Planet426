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

PlanetGeometry.prototype.applyHeightMap = function() {
    var r = this.parameters.radius;
    var perlin = new PerlinGenerator(1, 4, 1.75);
    for (var i = this.vertices.length - 1; i >= 0; i--) {
        this.vertices[i].normalize().multiplyScalar(r+perlin.generate(this.vertices[i].x, this.vertices[i].y, this.vertices[i].z));
    }
};