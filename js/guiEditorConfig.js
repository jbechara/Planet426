"use strict";

var GuiConfig = GuiConfig || {

};

GuiConfig.imageNames = [
  'flower.jpg',
  'goldengate.jpg',
  'leaves.jpg',
  'woman.jpg',
  'man.jpg',
  'town.jpg',
  'mesa.jpg',
  'trump1.jpg',
  'trump2.jpg',
  'doge.jpg',
  'alpha.png',
  'silence.png',
  'kylo.png',
  'andyfront.png',
  'caesar.png',
  'andyside.png',
  'snoke.png',
  'kenobi.png',
  'oldBen.png'
];

var sampleDropdownOptions = ['point', 'bilinear', 'gaussian'];
var morphLinesDropdownOptions = ['marker.json', 'driver.json', 'ape.json', 'sith.json', 'jedi.json'];

GuiConfig.onInit = function() {
  // starter image, if none loaded from url
  if (Gui.historyFilters.length === 0) {
    Gui.addHistoryEntry(Gui.filterDefs[0], [GuiConfig.imageNames[0]]);
  }
};

// NOTE(drew): filter names must correspond to names of filter functions unless funcName is supplied
GuiConfig.filterDefs = [
  // GENERAL
  {
    name: "Push Image",
    folderName: undefined,
    notFilter: true,
    pushImage: true,
    paramDefs: [
      {
        name: "image name",
        defaultVal: GuiConfig.imageNames[0],
        dropdownOptions: GuiConfig.imageNames,
      },
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

  {
    name: "Animation",
    notFilter: true,
    folderName: undefined,
    applyFunc: function() {
      var enableAnimation = true;
      window.open("batch.html?" + Gui.getUrl(enableAnimation));
    },
    paramDefs: [
    ]
  },

  {
    name: "MorphLines",
    notFilter: true,
    folderName: undefined,
    applyFunc: function() {
      // TODO put url stuff here
      var cache = Main.imageCache;
      var lastTwoImages = [];
      for (var i = cache.length-1; i >= 0; i--) {
        if (cache[i].imageName) {
          lastTwoImages.push(cache[i].imageName);
        }
      }
      if (lastTwoImages.length >= 2) {
        window.open("morphLines.html?initialFile=" + lastTwoImages[1] +
                  "&finalFile=" + lastTwoImages[0] + "&marker=images/marker.json")
      }
    },
    paramDefs: [
    ]
  },
  // SETPIXEL OPERATIONS
  {
    name: "Fill",
    folderName: 'SetPixels',
    paramDefs: [
      {
        name: "color",
        defaultVal: [0, 0, 0],
        isColor: true,
      },
    ]
  },
  {
    name: "Brush",
    folderName: 'SetPixels',
    paramDefs: [
      {
        name: "radius",
        defaultVal: 10,
        sliderRange: [1, 100],
        isFloat: false,
      },
      {
        name: "color",
        defaultVal: [255, 255, 255],
        isColor: true,
      },
      {
        name: "verts",
        defaultVal: "",
        isString: true,
      },
    ]
  },
  {
    name: "Soft Brush",
    folderName: 'SetPixels',
    funcName: "softBrushFilter",
    paramDefs: [
      {
        name: "radius",
        defaultVal: 10,
        sliderRange: [1, 100],
        isFloat: false,
      },
      {
        name: "color",
        defaultVal: [255, 255, 255],
        isColor: true,
      },
      {
        name: "alpha at center",
        defaultVal: 1.0,
        sliderRange: [0, 1.0],
        isFloat: true,
      },
      {
        name: "verts",
        defaultVal: "",
        isString: true,
      },
    ]
  },

  // LUMINANCE OPERATIONS
  {
    name: "Brightness",
    folderName: "Luminance",
    canAnimate: true,
    paramDefs: [
      {
        name: "brightness",
        defaultVal: 0,
        sliderRange: [-1, 1],
        isFloat: true,
      },
    ]
  },
  {
    name: "Contrast",
    folderName: "Luminance",
    canAnimate: true,
    paramDefs: [
      {
        name: "contrast",
        defaultVal: 0,
        sliderRange: [-1, 1],
        isFloat: true,
      },
    ]
  },
  {
    name: "Gamma",
    folderName: "Luminance",
    canAnimate: true,
    paramDefs: [
      {
        name: "gamma",
        defaultVal: 0,
        sliderRange: [-2, 2],
        isFloat: true,
      },
    ]
  },
  {
    name: "Vignette",
    folderName: "Luminance",
    paramDefs: [
      {
        name: "innerRadius",
        defaultVal: 0.25,
        sliderRange: [0.1, 1],
        isFloat: true,
      },
      {
        name: "outerRadius",
        defaultVal: 0.75,
        sliderRange: [0.1, 1],
        isFloat: true,
      },
    ]
  },
  {
    name: "Histogram Equalization",
    funcName: "histogramEqualizationFilter",
    folderName: "Luminance",
    paramDefs: [
    ]
  },

  // COLOR OPERATIONS
  {
    name: "Grayscale",
    folderName: "Color",
    paramDefs: [
    ]
  },
  {
    name: "Saturation",
    folderName: "Color",
    canAnimate: true,
    paramDefs: [
      {
        name: "saturation",
        defaultVal: 0,
        sliderRange: [-1, 1],
        isFloat: true,
      },
    ]
  },
  {
    name: "White Balance",
    funcName: "whiteBalanceFilter",
    folderName: "Color",
    paramDefs: [
      {
        name: "white",
        defaultVal: [255, 255, 255],
        isColor: true,
      }
    ]
  },
  {
    name: "Histogram Match",
    funcName: "histogramMatchFilter",
    folderName: "Color",
    numImageInputs: 2,
    paramDefs: [
      // {
      //   name: "value",
      //   defaultVal: 0.5,
      //   sliderRange: [0, 1],
      //   isFloat: true,
      // }
    ]
  },

  // FILTER OPERATIONS
  {
    name: "Gaussian",
    folderName: "Filters",
    canAnimate: true,
    paramDefs: [
      {
        name: "sigma",
        defaultVal: 4,
        sliderRange: [1, 8],
        isFloat: false,
      },
    ]
  },
  {
    name: "Sharpen",
    folderName: "Filters",
    paramDefs: [
    ]
  },
  {
    name: "Edge",
    folderName: "Filters",
    paramDefs: [
    ]
  },
  {
    name: "Median",
    folderName: "Filters",
    paramDefs: [
      {
        name: "window radius",
        defaultVal: 1,
        sliderRange: [1, 6],
        isFloat: false,
      },
    ]
  },
  {
    name: "Bilateral",
    folderName: "Filters",
    paramDefs: [
      {
        name: "sigmaR",
        defaultVal: 1,
        sliderRange: [1, 6],
        isFloat: false,
      },
      {
        name: "sigmaS",
        defaultVal: 1,
        sliderRange: [1, 18],
        isFloat: false,
      },
    ]
  },

  // DITHERING OPERATIONS
  {
    name: "Quantize",
    folderName: "Dithering",
    paramDefs: [
    ]
  },
  {
    name: "Random",
    folderName: "Dithering",
    paramDefs: [
    ]
  },
  {
    name: "Floyd-Steinberg",
    funcName: "floydFilter",
    folderName: "Dithering",
    paramDefs: [
    ]
  },
  {
    name: "Ordered",
    folderName: "Dithering",
    paramDefs: [
    ]
  },

  // RESAMPLING OPERATIONS

  // TODO: figure out how to handle sampling dropdown
  {
    name: "Scale",
    folderName: "Resampling",
    paramDefs: [
      {
        name: "ratio",
        defaultVal: 1,
        sliderRange: [0.1, 3],
        isFloat: true,
      },
      {
        name: "sampleMode",
        defaultVal: sampleDropdownOptions[0],
        dropdownOptions: sampleDropdownOptions,
      },
    ]
  },
  {
    name: "Translate",
    folderName: "Resampling",
    paramDefs: [
      {
        name: "x",
        defaultVal: 0,
        sliderRange: [-600, 600],
        isFloat: false,
      },
      {
        name: "y",
        defaultVal: 0,
        sliderRange: [-600, 600],
        isFloat: false,
      },
      {
        name: "sampleMode",
        defaultVal: sampleDropdownOptions[0],
        dropdownOptions: sampleDropdownOptions,
      },
    ]
  },
  {
    name: "Rotate",
    folderName: "Resampling",
    paramDefs: [
      {
        name: "radians",
        defaultVal: 1,
        sliderRange: [0, Math.PI * 2],
        isFloat: true,
      },
      {
        name: "sampleMode",
        defaultVal: sampleDropdownOptions[0],
        dropdownOptions: sampleDropdownOptions,
      },
    ]
  },
  {
    name: "Swirl",
    folderName: "Resampling",
    canAnimate: true,
    paramDefs: [
      {
        name: "radians",
        defaultVal: 1,
        sliderRange: [0, Math.PI * 2],
        isFloat: true,
      },
      {
        name: "sampleMode",
        defaultVal: sampleDropdownOptions[0],
        dropdownOptions: sampleDropdownOptions,
      },
    ]
  },

  // COMPOSITE OPERATIONS
  {
    name: "Get Alpha",
    funcName: "getAlphaFilter",
    folderName: "Composite",
    numImageInputs: 2,
    paramDefs: [
    ]
  },
  {
    name: "Composite",
    folderName: "Composite",
    numImageInputs: 2,
    paramDefs: [
    ]
  },
  {
    name: "Morph",
    folderName: "Composite",
    numImageInputs: 2,
    canAnimate: true,
    paramDefs: [
      {
        name: "alpha",
        defaultVal: 0.5,
        sliderRange: [0, 1],
        isFloat: true,
      },
      {
        name: "sampleMode",
        defaultVal: sampleDropdownOptions[0],
        dropdownOptions: sampleDropdownOptions,
      },
      {
        name: "linesFile",
        defaultVal: morphLinesDropdownOptions[0],
        dropdownOptions: morphLinesDropdownOptions,
      },
    ]
  },


  // MISC OPERATIONS
  {
    name: "Palette",
    folderName: "Misc",
    paramDefs: [
      {
        name: "num colors",
        defaultVal: 3,
        sliderRange: [1, 6],
        isFloat: false,
      },
    ]
  },
  {
    name: "Paint",
    folderName: "Misc",
    paramDefs: [
      {
        name: "input value",
        defaultVal: 0.5,
        sliderRange: [0, 1],
        isFloat: true,
      },
    ]
  },
  {
    name: "XDoG",
    funcName: "xDoGFilter",
    folderName: "Misc",
    paramDefs: [
      {
        name: "input value",
        defaultVal: 0.5,
        sliderRange: [0, 1],
        isFloat: true,
      },
    ]
  },

  {
    name: "CustomFilter",
    funcName: "customFilter",
    folderName: "Misc",
    canAnimate: true,
    paramDefs: [
      {
        name: "input value",
        defaultVal: 0.5,
        sliderRange: [0, 1],
        isFloat: true,
      },
    ]
  },

];
