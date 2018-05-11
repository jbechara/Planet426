"use strict";
var Reflection = Reflection || {
  ambient: new Pixel(0, 0, 0),
  diffuse: new Pixel(1.0, 1.0, 1.0),
  specular: new Pixel(1.0, 1.0, 1.0),
  shininess: 20,
};


Reflection.phongReflectionModel = function(vertex, view, normal, lightPos, phongMaterial) {
  var color = new Pixel(0, 0, 0);
  normal.normalize();

  // Diffuse
  var light_dir = (new THREE.Vector3()).subVectors(lightPos, vertex).normalize();
  var ndotl = normal.dot(light_dir);
  color.plus(phongMaterial.diffuse.copy().multipliedBy(ndotl));

  // ----------- STUDENT CODE BEGIN ------------
  // Ambient Light
  color.plus(phongMaterial.ambient.copy());
  // Viewer vector
  var view_dir = view.clone().sub(vertex).normalize();
  // Reflection Vector
  var R = normal.clone().multiplyScalar(-2*ndotl).add(light_dir).multiplyScalar(-1);
  // cos Angle between view and reflection
  var alpha = view_dir.dot(R);
  var coeff = (alpha > 0) ? Math.pow(alpha, phongMaterial.shininess) : 0;
  // Phong term calculation
  color.plus(phongMaterial.specular.copy().multipliedBy(coeff));
  // // ----------- STUDENT CODE END ------------

  return color;
}

var Renderer = Renderer || {
  meshInstances: new Set(),
  width: 320,
  height: 240,
  negNear: 0.3,
  negFar: 1000,
  fov: 45,
  lightPos: new THREE.Vector3(10, 10, -10),
  shaderMode: "",
  cameraLookAtVector: new THREE.Vector3(0, 0, 0),
  cameraPosition: new THREE.Vector3(0, 0, -10),
  cameraUpVector: new THREE.Vector3(0, -1, 0),
  cameraUpdated: true
};

Renderer.updateCameraParameters = function() {
  this.camera.position.copy(this.cameraPosition);
  this.camera.up.copy(this.cameraUpVector);
  this.camera.lookAt(this.cameraLookAtVector);
};


Renderer.initialize = function() {
  this.buffer = new Image(this.width, this.height);
  this.zBuffer = [];

  // set camera
  this.camera = new THREE.PerspectiveCamera(this.fov, this.width / this.height, this.negNear, this.negFar);
  this.updateCameraParameters();

  this.clearZBuffer();
  this.buffer.display(); // initialize canvas
};

Renderer.clearZBuffer = function() {
  for (var x = 0; x < this.width; x++) {
    this.zBuffer[x] = new Float32Array(this.height);
    for (var y = 0; y < this.height; y++) {
      this.zBuffer[x][y] = 1; // z value is in [-1 1];
    }
  }
};

Renderer.addMeshInstance = function(meshInstance) {
  assert(meshInstance.mesh, "meshInstance must have mesh to be added to renderer");
  this.meshInstances.add(meshInstance);
};

Renderer.removeMeshInstance = function(meshInstance) {
  this.meshInstances.delete(meshInstance);
};

Renderer.clear = function() {
  this.buffer.clear();
  this.clearZBuffer();
  Main.context.clearRect(0, 0, Main.canvas.width, Main.canvas.height);
};

Renderer.displayImage = function() {
  this.buffer.display();
};

Renderer.render = function() {
  this.clear();

  var eps = 0.01;
  if (!(this.cameraUpVector.distanceTo(this.camera.up) < eps &&
      this.cameraPosition.distanceTo(this.camera.position) < eps &&
      this.cameraLookAtVector.distanceTo(Main.controls.target) < eps)) {
    this.cameraUpdated = false;
    // update camera position
    this.cameraLookAtVector.copy(Main.controls.target);
    this.cameraPosition.copy(this.camera.position);
    this.cameraUpVector.copy(this.camera.up);
  } else { // camera's stable, update url once
    if (!this.cameraUpdated) {
      Gui.updateUrl();
      this.cameraUpdated = true; //update one time
    }
  }

  this.camera.updateMatrixWorld();
  this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld);

  // light goes with the camera, COMMENT this line for debugging if you want
  this.lightPos = this.camera.position;

  for (var meshInst of this.meshInstances) {
    var mesh = meshInst.mesh;
    if (mesh !== undefined) {
      for (var faceIdx = 0; faceIdx < mesh.faces.length; faceIdx++) {
        var face = mesh.faces[faceIdx];
        var verts = [mesh.vertices[face.a], mesh.vertices[face.b], mesh.vertices[face.c]];
        var vert_normals = [mesh.vertex_normals[face.a], mesh.vertex_normals[face.b], mesh.vertex_normals[face.c]];

        // camera's view matrix = K * [R | t] where K is the projection matrix and [R | t] is the inverse of the camera pose
        var viewMat = (new THREE.Matrix4()).multiplyMatrices(this.camera.projectionMatrix,
          this.camera.matrixWorldInverse);


        Renderer.drawTriangle(verts, vert_normals, mesh.uvs[faceIdx], meshInst.material, viewMat);
      }
    }
  }

  this.displayImage();
};

Renderer.getPhongMaterial = function(uv_here, material) {
  var phongMaterial = {};
  phongMaterial.ambient = Reflection.ambient;

  if (material.diffuse === undefined || uv_here === undefined) {
    phongMaterial.diffuse = Reflection.diffuse;
  } else if (Pixel.prototype.isPrototypeOf(material.diffuse)) {
    phongMaterial.diffuse = material.diffuse;
  } else {
    // note that this function uses point sampling. it would be better to use bilinear
    // subsampling and mipmaps for area sampling, but this good enough for now...
    phongMaterial.diffuse = material.diffuse.getPixel(Math.floor(uv_here.x * material.diffuse.width),
      Math.floor(uv_here.y * material.diffuse.height));
  }

  if (material.specular === undefined || uv_here === undefined) {
    phongMaterial.specular = Reflection.specular;
  } else if (Pixel.prototype.isPrototypeOf(material.specular)) {
    phongMaterial.specular = material.specular;
  } else {
    phongMaterial.specular = material.specular.getPixel(Math.floor(uv_here.x * material.specular.width),
      Math.floor(uv_here.y * material.specular.height));
  }

  phongMaterial.shininess = Reflection.shininess;

  return phongMaterial;
};

Renderer.projectVerticesNaive = function(verts) {
  // this is a naive orthogonal projection that does not even consider camera pose
  var projectedVerts = [];

  var orthogonalScale = 5;
  for (var i = 0; i < 3; i++) {
    projectedVerts[i] = new THREE.Vector4(verts[i].x, verts[i].y, verts[i].z, 1.0);

    projectedVerts[i].x /= orthogonalScale;
    projectedVerts[i].y /= orthogonalScale * this.height / this.width;

    projectedVerts[i].x = projectedVerts[i].x * this.width / 2 + this.width / 2;
    projectedVerts[i].y = projectedVerts[i].y * this.height / 2 + this.height / 2;
  }

  return projectedVerts;
};


Renderer.projectVertices = function(verts, viewMat) {
  var projectedVerts = []; // Vector3/Vector4 array (you need z for z buffering)

  // ----------- STUDENT CODE BEGIN ------------
  // For every vertex
  for (var i = 0; i < 3; i++) {
    // Map onto 4D homogneous coordinates
    projectedVerts[i] = new THREE.Vector4(verts[i].x, verts[i].y, verts[i].z, 1.0);
    // Apply viewMat (inverse camera then projection transformations)
    projectedVerts[i].applyMatrix4(viewMat);
    // If triangle outside of frustum, don't show it
    if (projectedVerts[i].w < this.negNear || projectedVerts[i].w > this.negFar)
      return undefined;
    // Convert back to 3D
    projectedVerts[i] = projectedVerts[i].divideScalar(projectedVerts[i].w);
    // Map to window space
    projectedVerts[i].x = projectedVerts[i].x * this.width / 2 + this.width / 2;
    projectedVerts[i].y = projectedVerts[i].y * this.height / 2 + this.height / 2;
  }
  // ----------- STUDENT CODE END ------------

  return projectedVerts;
};

Renderer.computeBoundingBox = function(projectedVerts) {
  // Compute the screen-space bounding box for the triangle defined in projectedVerts[0-2]
  var box = {};
  box.minX = projectedVerts[0].x;
  box.minY = projectedVerts[0].y;
  box.maxX = projectedVerts[0].x;
  box.maxY = projectedVerts[0].y;

  // ----------- STUDENT CODE BEGIN ------------
  // Check for minX
  if (projectedVerts[1].x < box.minX) box.minX = projectedVerts[1].x;
  if (projectedVerts[2].x < box.minX) box.minX = projectedVerts[2].x;
  // Check for minY
  if (projectedVerts[1].y < box.minY) box.minY = projectedVerts[1].y;
  if (projectedVerts[2].y < box.minY) box.minY = projectedVerts[2].y;
  // Check for maxX
  if (projectedVerts[1].x > box.maxX) box.maxX = projectedVerts[1].x;
  if (projectedVerts[2].x > box.maxX) box.maxX = projectedVerts[2].x;
  // Check for maxY
  if (projectedVerts[1].y > box.maxY) box.maxY = projectedVerts[1].y;
  if (projectedVerts[2].y > box.maxY) box.maxY = projectedVerts[2].y;
  // Round coordinates to nearest pixel
  box.minX = Math.round(box.minX);
  box.minY = Math.round(box.minY);
  box.maxX = Math.round(box.maxX);
  box.maxY = Math.round(box.maxY);
  // Clamp to screen width and height
  if (box.minX < 0) box.minX = 0;
  if (box.minY < 0) box.minY = 0;
  if (box.maxX > this.width - 1) box.maxX = this.width - 1;
  if (box.maxY > this.height - 1) box.maxY = this.height - 1;
  // ----------- STUDENT CODE END ------------

  return box;
};

Renderer.computeEdgeFunction = function(v, w, x, y) {
  return (w.x-v.x)*(y-v.y)-(w.y-v.y)*(x-v.x);
}

Renderer.computeBarycentric = function(projectedVerts, x, y) {
  var triCoords = [];
  // (see https://fgiesen.wordpress.com/2013/02/06/the-barycentric-conspirac/)
  // return undefined if (x,y) is outside the triangle
  // ----------- STUDENT CODE BEGIN ------------
  // Calculate the three edge functions
  var f01 = Renderer.computeEdgeFunction(projectedVerts[0], projectedVerts[1], x, y);
  var f12 = Renderer.computeEdgeFunction(projectedVerts[1], projectedVerts[2], x, y);
  var f20 = Renderer.computeEdgeFunction(projectedVerts[2], projectedVerts[0], x, y);
  // Return undefined if point is outside the triangle
  if (f01 < 0 || f12 < 0 || f20 < 0) return undefined;
  // Calculate normalized barycentric coordinates
  var s = f01 + f12 + f20;
  triCoords[0] = f12/s;
  triCoords[1] = f20/s;
  triCoords[2] = f01/s;
  // ----------- STUDENT CODE END ------------
  return triCoords;
};

Renderer.drawTriangleWire = function(projectedVerts) {
  var color = new Pixel(1.0, 0, 0);
  for (var i = 0; i < 3; i++) {
    var va = projectedVerts[(i + 1) % 3];
    var vb = projectedVerts[(i + 2) % 3];

    var ba = new THREE.Vector2(vb.x - va.x, vb.y - va.y);
    var len_ab = ba.length();
    ba.normalize();
    // draw line
    for (var j = 0; j < len_ab; j += 0.5) {
      var x = Math.round(va.x + ba.x * j);
      var y = Math.round(va.y + ba.y * j);
      this.buffer.setPixel(x, y, color);
    }
  }
};

Renderer.drawTriangleFlat = function(verts, projectedVerts, normals, uvs, material) {
  // ----------- STUDENT CODE BEGIN ------------
  // Get bounding box of triangle
  var bbox = this.computeBoundingBox(projectedVerts);
  // Signed z-differences
  var z1 = projectedVerts[1].z - projectedVerts[0].z;
  var z2 = projectedVerts[2].z - projectedVerts[0].z;
  // Get normal at centroid of triangle
  var norm = normals[0].clone().add(normals[1]).add(normals[2]);
  // Get position of centroid of triangle
  var pos = (verts[0].clone().add(verts[1]).add(verts[2])).multiplyScalar(1/3);
  // Get material and color for rendering
  var phongMat = Renderer.getPhongMaterial(uvs, material);
  var color = Reflection.phongReflectionModel
              (pos, this.cameraPosition, norm, this.lightPos, phongMat);
  // For every pixel in the bounding box
  for (var j = bbox.minY; j <= bbox.maxY; j++) {
    for (var i = bbox.minX; i <= bbox.maxX; i++) {
      // Get barycentric coordinates of pixel
      var bary = this.computeBarycentric(projectedVerts, i, j);
      // Skip pixels outside of the triangle
      if (bary === undefined) continue;
      // Interpolate z-coord
      var z = projectedVerts[0].z + bary[1]*z1 + bary[2]*z2;
      // Skip pixel if z > zBuffer[x][y]
      if (z > this.zBuffer[i][j]) continue;
      // Update the z-buffer
      this.zBuffer[i][j] = z;
      // Render the pixel
      this.buffer.setPixel(i, j, color);
    }
  }
  // ----------- STUDENT CODE END ------------
};


Renderer.drawTriangleGouraud = function(verts, projectedVerts, normals, uvs, material) {
  // ----------- STUDENT CODE BEGIN ------------
  // Get bounding box of triangle
  var bbox = this.computeBoundingBox(projectedVerts);
  // Signed z-differences
  var z1 = projectedVerts[1].z - projectedVerts[0].z;
  var z2 = projectedVerts[2].z - projectedVerts[0].z;
  // Get material for rendering
  var phongMat = Renderer.getPhongMaterial(uvs, material);
  // Get colors at each vertex
  var color0 = Reflection.phongReflectionModel
              (verts[0], this.cameraPosition, normals[0], this.lightPos, phongMat);
  var color1 = Reflection.phongReflectionModel
              (verts[1], this.cameraPosition, normals[1], this.lightPos, phongMat);
  var color2 = Reflection.phongReflectionModel
              (verts[2], this.cameraPosition, normals[2], this.lightPos, phongMat);
  // Color differences
  var color10 = color1.copySub(color0);
  var color20 = color2.copySub(color0);
  // For every pixel in the bounding box
  for (var j = bbox.minY; j <= bbox.maxY; j++) {
    for (var i = bbox.minX; i <= bbox.maxX; i++) {
      // Get barycentric coordinates of pixel
      var bary = this.computeBarycentric(projectedVerts, i, j);
      // Skip pixels outside of the triangle
      if (bary === undefined) continue;
      // Interpolate z-coord
      var z = projectedVerts[0].z + bary[1]*z1 + bary[2]*z2;
      // Skip pixel if z > zBuffer[x][y]
      if (z > this.zBuffer[i][j]) continue;
      // Update the z-buffer
      this.zBuffer[i][j] = z;
      // Interpolate color
      var color = color0.copyAdd(color10.copyMultiplyScalar(bary[1]))
                        .copyAdd(color20.copyMultiplyScalar(bary[2]));
      // Render the pixel
      this.buffer.setPixel(i, j, color);
    }
  }
  // ----------- STUDENT CODE END ------------
};


Renderer.drawTrianglePhong = function(verts, projectedVerts, normals, uvs, material) {
  // ----------- STUDENT CODE BEGIN ------------
  // Get bounding box of triangle
  var bbox = this.computeBoundingBox(projectedVerts);
  // z-differences
  var z1 = projectedVerts[1].z - projectedVerts[0].z;
  var z2 = projectedVerts[2].z - projectedVerts[0].z;
  // pos-differences
  var p1 = verts[1].clone().sub(verts[0]);
  var p2 = verts[2].clone().sub(verts[0]);
  // normal-differences
  var n1 = normals[1].clone().sub(normals[0]);
  var n2 = normals[2].clone().sub(normals[0]);
  // For every pixel in the bounding box
  for (var j = bbox.minY; j <= bbox.maxY; j++) {
    for (var i = bbox.minX; i <= bbox.maxX; i++) {
      // Get barycentric coordinates of pixel
      var bary = this.computeBarycentric(projectedVerts, i, j);
      // Skip pixels outside of the triangle
      if (bary === undefined) continue;
      // Interpolate z-coord
      var z = projectedVerts[0].z + bary[1]*z1 + bary[2]*z2;
      // Skip pixel if z > zBuffer[x][y]
      if (z > this.zBuffer[i][j]) continue;
      // Update the z-buffer
      this.zBuffer[i][j] = z;
      // Interpolate position
      var pos = p1.clone().multiplyScalar(bary[1])
                .add(p2.clone().multiplyScalar(bary[2])).add(verts[0]);
      // Interpolate normal
      var norm = n1.clone().multiplyScalar(bary[1])
                .add(n2.clone().multiplyScalar(bary[2])).add(normals[0]);
      // Check for texture mapping
      if (uvs === undefined) {
        var phongMat = Renderer.getPhongMaterial(uvs, material);
        var color = Reflection.phongReflectionModel
              (pos, this.cameraPosition, norm, this.lightPos, phongMat);
        // Render the pixel
        this.buffer.setPixel(i, j, color);
      } else {
        // Texture Mapping
        var uv = uvs[0].clone().multiplyScalar(bary[0])
                .add(uvs[1].clone().multiplyScalar(bary[1]))
                .add(uvs[2].clone().multiplyScalar(bary[2]));
        var phongMat = Renderer.getPhongMaterial(uv, material);
        if (material.xyzNormal === undefined) { // No XYZ mapping
          var color = Reflection.phongReflectionModel
                      (pos, this.cameraPosition, norm, this.lightPos, phongMat);
          // Render the pixel
          this.buffer.setPixel(i, j, color);
        } else { // XYZ Normal Mapping
          var pix = material.xyzNormal.getPixel(Math.floor(uv.x * material.xyzNormal.width),
                                                Math.floor(uv.y * material.xyzNormal.height));
          var bump = new THREE.Vector3(2*pix.r-1, 2*pix.g-1, 2*pix.b-1).normalize();
          var color = Reflection.phongReflectionModel
                      (pos, this.cameraPosition, bump, this.lightPos, phongMat);
          // Render the pixel
          this.buffer.setPixel(i, j, color);
        }
      }
    }
  }
  // ----------- STUDENT CODE END ------------
};


Renderer.drawTriangle = function(verts, normals, uvs, material, viewMat) {

  var projectedVerts = this.projectVertices(verts, viewMat);
  if (projectedVerts === undefined) { // not within near and far plane
    return;
  } else if (projectedVerts.length <= 0){
    projectedVerts = this.projectVerticesNaive(verts);
  }

  switch (this.shaderMode) {
    case "Wire":
      this.drawTriangleWire(projectedVerts);
      break;
    case "Flat":
      this.drawTriangleFlat(verts, projectedVerts, normals, uvs, material);
      break;
    case "Gouraud":
      this.drawTriangleGouraud(verts, projectedVerts, normals, uvs, material);
      break;
    case "Phong":
      this.drawTrianglePhong(verts, projectedVerts, normals, uvs, material);
      break;
    default:
  }
};
