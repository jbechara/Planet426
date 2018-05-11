"use strict";

var GuiConfig = GuiConfig || {

};

GuiConfig.meshFileNames = [
  'cube.obj',
  'tetrahedron.obj',
  'teapot.obj',
  'cow.obj',
  'cheetah.obj',
  'hand.obj',
  'sheep.obj',
  'afrhead.obj',
  'afreye.obj',
  'boggiehead.obj',
  'boggieeyes.obj',
  'boggiebody.obj',
  'diablo.obj'
];

GuiConfig.resolutionOptions = ['320x240', '640x480', '800x600'];
GuiConfig.shaderOptions = ['Wire', 'Flat', 'Gouraud', 'Phong'];
GuiConfig.reflectionModelOptions = ['Diffuse', 'Phong'];

GuiConfig.controlDefs = [{
    name: "Push Mesh",
    type: "button",
    defaultVal: Gui.pushMesh,
    isButton: true,
  },

  {
    name: "Resolution",
    type: "dropdown",
    defaultVal: GuiConfig.resolutionOptions[0],
    dropdownOptions: GuiConfig.resolutionOptions,
  },

  {
    name: "Shading Model",
    type: "dropdown",
    defaultVal: GuiConfig.shaderOptions[0],
    dropdownOptions: GuiConfig.shaderOptions,
  },

  {
    name: "Ambient",
    type: "color",
    defaultVal: [0, 0, 0],
    isColor: true,
  },

  {
    name: "Diffuse",
    type: "color",
    defaultVal: [255, 255, 255],
    isColor: true,
  },

  {
    name: "Specular",
    type: "color",
    defaultVal: [255, 255, 255],
    isColor: true,
  },

  {
    name: "Shininess",
    type: "slider",
    sliderRange: [0, 20],
    defaultVal: 5,
  }

];
