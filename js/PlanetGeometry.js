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
    var verts = this.vertices;
    var r = this.parameters.radius;
    for (var i = 0; i < verts.length; i++) {
        verts[i].normalize().multiplyScalar(r);
    }
    // TODO: Why does this work without update flags? :/
};
