"use strict";

var GuiConfig = GuiConfig || {

};

GuiConfig.meshNames = [
  "cube.obj",
  "tetrahedron.obj",
  "dodecahedron.obj",
  "cylinder.obj",
  "sphere.obj",
  "sphere-2res.obj",
  "large-cube.obj",
  "teapot.obj",
  "hand.obj",
  "hand-simple.obj",
  "cheetah.obj",
  "cow.obj",
  "horse.obj",
  "octopus.obj",
  "bunny.obj",
  "armadillo.obj",
  "custom.obj",
];

var sampleDropdownOptions = ['point', 'bilinear', 'gaussian'];
var morphLinesDropdownOptions = ['marker.json'];

GuiConfig.onInit = function() {
  // starter mesh
  if (Gui.historyFilters.length == 0) {
    Gui.addHistoryEntry(GuiConfig.filterDefs[0], [GuiConfig.meshNames[0]]);
  }
  // display settings
  if (Gui.historyFilters.length == 1) {
    Gui.addHistoryEntry(GuiConfig.filterDefs[2]);
  }
};

// NOTE(drew): filter names must correspond to names of filter functions unless funcName is supplied
GuiConfig.filterDefs = [
  // INTERNAL
  {
    name: "Base Mesh",
    folderName: undefined,
    notFilter: true,
    baseMesh: true,
    permanent: true,
    hidden: true,
    paramDefs: [
      {
        name: "mesh",
        defaultVal: GuiConfig.meshNames[0],
        dropdownOptions: GuiConfig.meshNames,
      },
    ]
  },
  {
    name: "Selection",
    folderName: undefined,
    hidden: true,
    paramDefs: [
      {
        name: "verts",
        defaultVal: "",
        isString: true,
      },
      {
        name: "faces",
        defaultVal: "",
        isString: true,
      },
    ]
  },
  {
    name: "Display Settings",
    funcName: "displaySettings",
    folderName: undefined,
    permanent: true,
    hidden: true,
    paramDefs: [
      {
        name: "show labels",
        defaultVal: true,
        isBoolean: true,
      },
      {
        name: "show halfedge",
        defaultVal: true,
        isBoolean: true,
      },
      {
        name: "shading",
        defaultVal: "flat",
        dropdownOptions: ["flat", "smooth"],
      },
      {
        name: "vert normals",
        defaultVal: false,
        isBoolean: true,
      },
      {
        name: "face normals",
        defaultVal: false,
        isBoolean: true,
      },
      {
        name: "show grid",
        defaultVal: true,
        isBoolean: true,
      },
      {
        name: "show all verts",
        defaultVal: false,
        isBoolean: true,
      },
      {
        name: "show axes",
        defaultVal: true,
        isBoolean: true,
      },
      {
        name: "vert colors",
        defaultVal: false,
        isBoolean: true,
      },
      // {
      //   name: "mesh color",
      //   defaultVal: [0.5, 0.5, 1],
      //   isColor: true,
      // },
    ]
  },

  {
    name: "Batch Mode",
    notFilter: true,
    folderName: undefined,
    applyFunc: function() {
      // TODO put url stuff here
      window.open("batch.html?" + Gui.getUrl());
    },
    paramDefs: [
    ]
  },
  
  // TRANSFORMS
  {
    name: "Translation",
    folderName: "Transformations",
    paramDefs: [
      {
        name: "x",
        defaultVal: 0,
        sliderRange: [-10, 10],
        isFloat: true,
      },
      {
        name: "y",
        defaultVal: 0,
        sliderRange: [-10, 10],
        isFloat: true,
      },
      {
        name: "z",
        defaultVal: 0,
        sliderRange: [-10, 10],
        isFloat: true,
      },
    ]
  },
  {
    name: "Rotation",
    folderName: "Transformations",
    paramDefs: [
    {
      name: "x",
      defaultVal: 0,
      sliderRange: [-Math.PI, Math.PI],
      isFloat: true,
    },
    {
      name: "y",
      defaultVal: 0,
      sliderRange: [-Math.PI, Math.PI],
      isFloat: true,
    },
    {
      name: "z",
      defaultVal: 0,
      sliderRange: [-Math.PI, Math.PI],
      isFloat: true,
    },
    ]
  },
  {
    name: "Scale",
    folderName: "Transformations",
    paramDefs: [
      {
        name: "scale",
        defaultVal: 1,
        sliderRange: [0, 2],
        isFloat: true,
      },
    ]
  },

  // WARPS
  {
    name: "Twist",
    folderName: "Warps",
    paramDefs: [
      {
        name: "amount",
        defaultVal: 0.5,
        sliderRange: [0, 4],
        isFloat: true,
      },
    ]
  },
  {
    name: "Inflate",
    folderName: "Warps",
    paramDefs: [
      {
        name: "amount",
        defaultVal: 0.5,
        sliderRange: [-1, 1],
        isFloat: true,
      },
    ]
  },
  {
    name: "Wacky",
    folderName: "Warps",
    paramDefs: [
      {
        name: "amount",
        defaultVal: 0.5,
        sliderRange: [0, 1],
        isFloat: true,
      },
    ]
  },

  // FILTERS
  {
    name: "Noise",
    folderName: "Filters",
    paramDefs: [
      {
        name: "amount",
        defaultVal: 0.5,
        sliderRange: [0, 1],
        isFloat: true,
      },
    ]
  },
  {
    name: "Smooth",
    folderName: "Filters",
    paramDefs: [
      {
        name: "Iterations",
        defaultVal: 1,
        sliderRange: [1, 3000],
        isFloat: false,
      },
      {
        name: "Delta",
        defaultVal: 1.0,
        sliderRange: [0, 30],
		step: 0.01,
        isFloat: true,
      },
      {
        name: "Curvature_flow",
        defaultVal: false,
        isBoolean: true,
      },
      {
        name: "Scale_dependent",
        defaultVal: false,
        isBoolean: true,
      },
      {
        name: "Implicit",
        defaultVal: false,
        isBoolean: true,
      },

    ]
  },
  {
    name: "Sharpen",
    folderName: "Filters",
    paramDefs: [
      {
        name: "Iterations",
        defaultVal: 1,
        sliderRange: [1, 3000],
        isFloat: false,
      },
      {
        name: "Delta",
        defaultVal: 1.0,
        sliderRange: [0, 30],
		step: 0.01,
        isFloat: true,
      }
    ]
  },
  {
    name: "Curvature",
    folderName: "Filters",
    paramDefs: [
    ]
  },

  // TOPOLOGY OPS
  {
    name: "Split Edge",
    folderName: "Topology",
    funcName: "splitEdge",
    paramDefs: [
    ]
  },
  {
    name: "Join Edges",
    folderName: "Topology",
    funcName: "joinEdges",
    paramDefs: [
    ]
  },
  {
    name: "Split Face",
    folderName: "Topology",
    funcName: "splitFace",
    paramDefs: [
    ]
  },
  {
    name: "Join Faces",
    folderName: "Topology",
    funcName: "joinFaces",
    paramDefs: [
    ]
  },
  {
    name: "Triangulate",
    folderName: "Topology",
    paramDefs: [
    ]
  },
  {
    name: "Truncate",
    folderName: "Topology",
    paramDefs: [
      {
        name: "amount",
        defaultVal: 0,
        sliderRange: [0.05, 0.45],
        isFloat: true,
      },
    ]
  },
  {
    name: "Extrude",
    folderName: "Topology",
    paramDefs: [
      {
        name: "amount",
        defaultVal: 0,
        sliderRange: [0, 1],
        isFloat: true,
      },
    ]
  },
  {
    name: "Split Long Edges",
    funcName: "splitLong",
    folderName: "Topology",
    paramDefs: [
      {
        name: "amount",
        defaultVal: 0,
        sliderRange: [0, 1],
        isFloat: true,
      },
    ]
  },


  // SUBDIVISION OPS
  {
    name: "Tri Topology",
    funcName: "triSubdiv",
    folderName: "Subdivision",
    paramDefs: [
      {
        name: "iterations",
        defaultVal: 1,
        sliderRange: [0, 6],
        isFloat: false,
      },
    ]
  },
  {
    name: "Loop Subdivision",
    funcName: "loop",
    folderName: "Subdivision",
    paramDefs: [
      {
        name: "iterations",
        defaultVal: 1,
        sliderRange: [0, 6],
        isFloat: false,
      },
    ]
  },
  {
    name: "Quad Topology",
    funcName: "quadSubdiv",
    folderName: "Subdivision",
    paramDefs: [
      {
        name: "iterations",
        defaultVal: 1,
        sliderRange: [0, 6],
        isFloat: false,
      },
    ]
  },
  {
    name: "Catmull-Clark",
    funcName: "catmullClark",
    folderName: "Subdivision",
    paramDefs: [
      {
        name: "iterations",
        defaultVal: 1,
        sliderRange: [0, 6],
        isFloat: false,
      },
    ]
  },


  // TODO: display
  
];
