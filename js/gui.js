"use strict";


var Gui = Gui || {
  controlParamsStruct: {},
  meshList: [],
  meshID: 0, // we increment this id every time we push mesh
};


Gui.init = function() {

  this.meshListDatGui = new dat.GUI();
  this.controlListDatGui = new dat.GUI();

  for (var controlIdx = 0; controlIdx < GuiConfig.controlDefs.length; controlIdx++) {
    var controlDef = GuiConfig.controlDefs[controlIdx];
    this.controlParamsStruct[controlDef.name] = controlDef.defaultVal;
    // }
    this.controlListDatGui.open();
  }
  this.parseUrl();

  for (var controlIdx = 0; controlIdx < GuiConfig.controlDefs.length; controlIdx++) {
    var controlDef = GuiConfig.controlDefs[controlIdx];
    var paramControl = undefined;

    switch (controlDef.type) {
      case "slider":
        paramControl = this.controlListDatGui.add(this.controlParamsStruct, controlDef.name, controlDef.sliderRange[0], controlDef.sliderRange[1]);
        paramControl.step(controlDef.step || controlDef.isFloat && 1 || (controlDef.sliderRange[1] - controlDef.sliderRange[0]) / 20);
        break;
      case "dropdown":
        paramControl = this.controlListDatGui.add(this.controlParamsStruct, controlDef.name, controlDef.dropdownOptions);
        break
      case "color":
        paramControl = this.controlListDatGui.addColor(this.controlParamsStruct, controlDef.name);
        break
      case "string":
        paramControl = this.controlListDatGui.add(this.controlParamsStruct, controlDef.name);
        break
      case "button":
        paramControl = this.controlListDatGui.add(this.controlParamsStruct, controlDef.name);
        break
      default:
    }
    paramControl.onChange(Gui.handleControlsChange);
  }

  this.meshListDatGui.open();

  if (this.meshList.length == 0) {
    this.pushMesh();
  }

  this.handleControlsChange();

  this.fullyInitialized = true;
};

Gui.pushMesh = function(newMesh) {
  if (newMesh == undefined) {
    var newMesh = {
      name: "Mesh " + (Gui.meshID++).toString(),
      meshName: GuiConfig.meshFileNames[0],
      useMaterial: false,
    }
  }

  newMesh.meshInstance = new MeshInstance(newMesh.meshName, newMesh.useMaterial),

    newMesh.delete = function() {
      Renderer.removeMeshInstance(this.meshInstance);
      for (var meshIdx = 0; meshIdx < Gui.meshList.length; meshIdx++) {
        if (Gui.meshList[meshIdx].name == this.name) {
          Gui.meshList.splice(meshIdx, 1);
        }
      }
      Gui.meshListDatGui.removeFolder(this.name);
      Gui.updateUrl();
    };

  newMesh.updateMesh = function() {
    Renderer.removeMeshInstance(this.meshInstance);
    this.meshInstance = new MeshInstance(this.meshName, newMesh.useMaterial);
    Renderer.addMeshInstance(this.meshInstance);
    Gui.updateUrl();
  }

  var meshFolder = Gui.meshListDatGui.addFolder(newMesh.name);
  Gui.meshList.push(newMesh);
  var handler = undefined;
  handler = meshFolder.add(newMesh, 'meshName', GuiConfig.meshFileNames).name("Mesh File");
  handler.onChange(function(newMesh) {
    return function() {
      newMesh.updateMesh();
    }
  }(newMesh));

  handler = meshFolder.add(newMesh, 'useMaterial').name("Use Material");
  handler.onChange(function(newMesh) {
    return function() {
      newMesh.updateMesh();
    }
  }(newMesh));


  Renderer.addMeshInstance(newMesh.meshInstance);

  meshFolder.add(newMesh, 'delete').name("Delete");
  meshFolder.open();
  Gui.updateUrl();
};


Gui.handleControlsChange = function() {
  if (Gui.suspendDisplayUpdate) return;

  for (var controlIdx = 0; controlIdx < GuiConfig.controlDefs.length; controlIdx++) {
    var controlDef = GuiConfig.controlDefs[controlIdx];
    var val = Gui.controlParamsStruct[controlDef.name];
    var converted_val = undefined;


    if (controlDef.type == "color") {
      converted_val = [];
      if (typeof val === "string") {
        var bigint = parseInt(val.substring(1), 16);
        converted_val[0] = ((bigint >> 16) & 255)
        converted_val[1] = ((bigint >> 8) & 255);
        converted_val[2] = ((bigint) & 255);
      } else {
        converted_val = val;
      }
      converted_val = new Pixel(converted_val[0] / 255, converted_val[1] / 255, converted_val[2] / 255);
    } else {
      converted_val = val;
    }

    switch (controlDef.name) {
      case "Resolution":
        var prevW = Renderer.width;
        var prevH = Renderer.height;

        if (converted_val == 'full') {
          var newW = window.innerWidth;
          var newH = window.innerHeight;
        } else {
          var parts = converted_val.split('x');
          var newW = parts[0];
          var newH = parts[1];
        }
        if (prevH != newH && prevW != newW) {
          Renderer.width = newW;
          Renderer.height = newH;
          Renderer.initialize(); // requires reinitialization for trackball to work
          Main.controls = new THREE.TrackballControls(Renderer.camera, Main.canvas);
        }

        break;
      case "Shading Model":
        Renderer.shaderMode = converted_val;
        break;
      case "Ambient":
        Reflection.ambient = converted_val;
        break;
      case "Diffuse":
        Reflection.diffuse = converted_val;
        break;
      case "Specular":
        Reflection.specular = converted_val;
        break;
      case "Shininess":
        Reflection.shininess = converted_val;
        break;
      default:
    }
  }
  Gui.updateUrl();
}

Gui.getFilterHistoryData = function() {
  return this.historyFilters;
};

// gets rid of the ".0000000001" etc when stringifying floats
// from http://stackoverflow.com/questions/1458633/how-to-deal-with-floating-point-number-precision-in-javascript
function stripFloatError(number) {
  if (number && number.toPrecision) {
    return (parseFloat(number.toPrecision(5)));
  } else {
    return number;
  }
};

Gui.parseUrl = function() {
  for (var i = 0; i < Parser.commands.length; i++) {
    var cmd = Parser.commands[i];

    if (cmd.name == "Mesh") {
      var newMesh = {
        name: "Mesh " + (Gui.meshID++).toString(),
        meshName: cmd.args[0],
        useMaterial: cmd.args[1] == "true" ? true : false,
      }
      this.pushMesh(newMesh);
    } else if (cmd.name == "Camera") {
      Renderer.cameraPosition.set(cmd.args[0][0], cmd.args[0][1], cmd.args[0][2]);
      Renderer.cameraUpVector.set(cmd.args[1][0], cmd.args[1][1], cmd.args[1][2]);
      Renderer.cameraLookAtVector.set(cmd.args[2][0], cmd.args[2][1], cmd.args[2][2]);
      Renderer.updateCameraParameters();
    } else {
      this.controlParamsStruct[cmd.name] = cmd.args[0];
    }
  }
};

Gui.getUrl = function() {
  var url = "";

  // camera pose
  url += "Camera=";
  url += "[" + stripFloatError(Renderer.cameraPosition.x) + "," + stripFloatError(Renderer.cameraPosition.y) + "," + stripFloatError(Renderer.cameraPosition.z) + "];";
  url += "[" + stripFloatError(Renderer.cameraUpVector.x) + "," + stripFloatError(Renderer.cameraUpVector.y) + "," + stripFloatError(Renderer.cameraUpVector.z) + "];";
  url += "[" + stripFloatError(Renderer.cameraLookAtVector.x) + "," + stripFloatError(Renderer.cameraLookAtVector.y) + "," + stripFloatError(Renderer.cameraLookAtVector.z) + "]";


  for (var meshIdx = 0; meshIdx < this.meshList.length; meshIdx++) {
    var thisMesh = this.meshList[meshIdx];
    url += "&" + "Mesh=" + thisMesh.meshName + ";" + (thisMesh.useMaterial ? "true" : "false");
  }

  for (var controlIdx = 0; controlIdx < GuiConfig.controlDefs.length; controlIdx++) {
    var controlDef = GuiConfig.controlDefs[controlIdx];
    if (controlDef.type == "button") {
      continue;
    }
    url += "&" + controlDef.name + "=";
    var val = this.controlParamsStruct[controlDef.name];

    if (val.constructor === Array) {
      url += "[";
      for (var j = 0; j < val.length; j++) {
        url += (j > 0 && "," || "") + stripFloatError(val[j]);
      }
      url += "]";
    } else {
      url += val;
    }
  }

  url = url.replace(/ /g, "_");

  return url;
};

Gui.updateUrl = function() {
  if (Gui.batchMode) return;

  var url = Gui.batchMode && "batch.html?" || "index.html?";
  url += Gui.getUrl();
  history.pushState({}, "", url);
};

Gui.alertOnce = function(msg, divName) {
  divName = divName || "alert_div";
  // NOTE: mainDiv opacity change disabled to allow >1 different alerts
  // var mainDiv = document.getElementById('main_div');
  // mainDiv.style.opacity = "0.3";
  var alertDiv = document.getElementById(divName);
  alertDiv.innerHTML = '<p>' + msg + '</p><button id="ok" onclick="Gui.closeAlert()">ok</button>';
  alertDiv.style.display = 'inline';
};

Gui.closeAlert = function(divName) {
  divName = divName || "alert_div";
  // NOTE: mainDiv opacity change disabled to allow >1 different alerts
  // var mainDiv = document.getElementById('main_div');
  // mainDiv.style.opacity = "1";
  var alertDiv = document.getElementById(divName);
  alertDiv.style.display = 'none';
};
