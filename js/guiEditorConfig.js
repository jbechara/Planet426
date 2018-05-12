"use strict";

var GuiConfig = GuiConfig || {

};

GuiConfig.imageNames = [
  'blank.png'
];

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

  // SETPIXEL OPERATIONS
  {
    name: "Fill",
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
    name: "Bucket",
    paramDefs: [
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

  // RESAMPLING OPERATIONS
  {
    name: "Looped Translate",
    funcName: "loopedTranslateFilter",
    paramDefs: [
      {
        name: "x",
        defaultVal: 0,
        sliderRange: [-600, 600],
        isFloat: false,
        step: 1
      },
      {
        name: "y",
        defaultVal: 0,
        sliderRange: [-600, 600],
        isFloat: false,
        step: 1
      },
    ]
  },

];
