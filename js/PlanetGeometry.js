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

    // Get angle map - format: (theta, phi)
    this.angleMap = this.generateAngleMap();

    return this;
}

PlanetGeometry.prototype = Object.create(THREE.Geometry.prototype);

PlanetGeometry.prototype.generateAngleMap = function() {
	var angleMap = new Float32Array(this.vertices.length*2);
	for (var i = this.vertices.length - 1; i >= 0; i--) {
		angleMap[2*i] = Math.atan(Math.sqrt(this.vertices[i].x**2+this.vertices[i].y**2)/this.vertices[i].z);
		angleMap[2*i+1] = Math.atan(this.vertices[i].y/this.vertices[i].x);
	}
	return angleMap;
}

PlanetGeometry.prototype.applyHeightMap = function() {
    var r = this.parameters.radius;
    var perlin = new PerlinGenerator(1, 4, 1.75);
    for (var i = this.vertices.length - 1; i >= 0; i--) {
        this.vertices[i].normalize().multiplyScalar(r+perlin.generate(this.vertices[i].x, this.vertices[i].y, this.vertices[i].z));
    }
    console.log(this.vertices);
};
