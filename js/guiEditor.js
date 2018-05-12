"use strict";

// NOTE: requires a version of dat.gui.js with the following additions:
//  - callbacks on folder open/close
//  - guiFolder.removeFolder(folderName)

// from http://stackoverflow.com/questions/15313418/javascript-assert
function assert(condition, message) {
  if (!condition) {
    message = message || "Assertion failed";
    if (typeof Error !== "undefined") {
      throw new Error(message);
    }
    throw message; // Fallback
  }
  return condition;
};

assert(GuiConfig);

var Gui = Gui || {
  hidden: false,
  filterDefs: GuiConfig.filterDefs,
};


Gui.init = function(controlsChangeCallback) {
  var genFuncAddFilter = function(filterDef) {
    return function() {
      Gui.addHistoryEntry(filterDef);
    }
  };

  // save off callbacks for easy access
  this.controlsChangeCallback = controlsChangeCallback;

  if (this.hidden) {
    this.historyFilters = [];

    this.parseUrl();

    this.fullyInitialized = true;
    return;
  }

  // make and save off dat.gui gui objects
  this.historyDatGui = new dat.GUI();
  this.filterListDatGui = new dat.GUI();

  // make a button for each filterDef, in the correct folder
  this.filterFolders = {};
  this.applyFuncs = {};
  for (var filterIdx = 0; filterIdx < this.filterDefs.length; filterIdx++) {
    var filterDef = this.filterDefs[filterIdx];

    // get the gui folder where the button goes (make it if doesn't yet exist)
    var filterFolder = undefined;
    if (filterDef.folderName) {
      filterFolder = this.filterFolders[filterDef.folderName];

      if (filterFolder === undefined) {
        filterFolder = this.filterListDatGui.addFolder(
          filterDef.folderName,
          function() {},
          function() {}
          );
        this.filterFolders[filterDef.folderName] = filterFolder;
      }
    }
    else {
      filterFolder = this.filterListDatGui;
    }

    // generate the button function and make the button
    filterDef.applyFunc = filterDef.applyFunc || genFuncAddFilter(filterDef);
    this.applyFuncs[filterDef.name] = filterDef.applyFunc;
    var filterButton = filterFolder.add(this.applyFuncs, filterDef.name);
  }

  // CONSTRUCT THE HISTORY PANE
  this.historyFolder = this.historyDatGui.addFolder("History");
  this.historyFolder.open();
  this.historyFilters = [];

  this.parseUrl();

  if (GuiConfig.onInit) {
    GuiConfig.onInit(this);
  }

  this.fullyInitialized = true;
};

Gui.handleControlsChange = function() {
  if (Gui.suspendDisplayUpdate) return;
  this.controlsChangeCallback();
  this.updateUrl();
};

Gui.getFilterHistoryData = function() {
  return this.historyFilters;
};

Gui.addHistoryEntry = function(filterDef, argVals) {
  this.suspendDisplayUpdate = true;

  // make the folder for the history entry
  // HACK: number all history entries to keep folder names unique (required by dat.gui)
  if (!Gui.hidden) {
    var folderLabel = (this.historyFilters.length + 1).toString() + ": " + filterDef.name;
    var folder = this.historyFolder.addFolder(folderLabel);
    folder.open();
  }

  // make the filter instance
  var filterInst = {
    filterDef: filterDef,
    paramVals: {},
    argsList: [],
    guiControls: [],
    folder: folder,
  };

  var animatedValFound = false;

  // make param controls in gui folder
  for (var paramIdx = 0; paramIdx < filterDef.paramDefs.length; paramIdx++) {
    var paramDef = filterDef.paramDefs[paramIdx];

    var paramVal = argVals && argVals[paramIdx] || paramDef.defaultVal;

    // HACK(drew): dat.gui needs to be initialized with a float
    filterInst.paramVals[paramDef.name] = paramDef.isFloat ? 0.5 : paramVal;

    filterInst.argsList[paramIdx] = paramVal;

    // mess of nested functions to generate a valid closure
    var defaultOnChangeFunc = function(paramIdx) {
      return function(val) {
        filterInst.argsList[paramIdx] = val;
        Gui.handleControlsChange();
      }
    }(paramIdx)

    if (Gui.hidden) {
      this.suspendDisplayUpdate = false;
      if (paramDef.isColor) {
        defaultOnChangeFunc(new Pixel(paramVal[0] / 255, paramVal[1] / 255, paramVal[2] / 255, 1));
      }
      else {
        if (paramVal.isAnimated) {
          assert(!animatedValFound, "only one animated parameter is allowed at a time");
          animatedValFound = true;

          Main.animatedValData = {
            current: paramVal.start,
            start: paramVal.start,
            end: paramVal.end,
            step: paramVal.step,
            changeFunc: defaultOnChangeFunc,
          };

          paramVal = paramVal.start;
        }
        defaultOnChangeFunc(paramVal);
      }
    }
    else {
      var paramControl = undefined;
      if (paramDef.sliderRange) {
        paramControl = folder.add(filterInst.paramVals, paramDef.name, paramDef.sliderRange[0], paramDef.sliderRange[1]);
        paramControl.step(paramDef.step || !paramDef.isFloat && 1 || (paramDef.sliderRange[1] - paramDef.sliderRange[0]) / 20);

        paramControl.onChange(defaultOnChangeFunc);
      }
      else if (paramDef.dropdownOptions) {
        paramControl = folder.add(filterInst.paramVals, paramDef.name, paramDef.dropdownOptions);
        paramControl.onChange(defaultOnChangeFunc);
      }
      else if (paramDef.isColor) {
        paramControl = folder.addColor(filterInst.paramVals, paramDef.name)
        paramControl.onChange(function(filterInst, paramIdx) {
          return function(val) {
            if (typeof val === "string") {
              // color controller returning a hex string
              var newPixel = new Pixel(val);
            }
            else {
              // color controller returning an rgb array
              var newPixel = new Pixel(val[0] / 255, val[1] / 255, val[2] / 255, 1);
            }
            filterInst.argsList[paramIdx] = newPixel;
            Gui.handleControlsChange();
          }
        }(filterInst, paramIdx));
      }
      else if (paramDef.isString) {
        paramControl = folder.add(filterInst.paramVals, paramDef.name)
        paramControl.onChange(defaultOnChangeFunc);
      }
      else {
        assert(false, "unsupported control type in paramDef: " + paramDef);
      }

      assert(!paramVal.isAnimated, "animated parameters are only allowed in batch mode");

      // in case we initialized with a float dummy value, set default again
      paramControl.setValue(paramVal);

      filterInst.guiControls[paramIdx] = paramControl;
    }
  }

  if (!Gui.hidden) {
    if (filterDef.name === "Push Image") {
      filterInst["Delete Below"] = function() {
        Gui.deleteHistoryBelow(filterInst);
        Gui.deleteHistoryEntry(filterInst);
        Gui.handleControlsChange();
      };
      folder.add(filterInst, "Delete Below")
    }
    else {
      filterInst["Delete"] = function() {
        Gui.deleteHistoryEntry(filterInst);
        Gui.handleControlsChange();
      };
      folder.add(filterInst, "Delete")
    }

    this.historyFolder.open();
  }

  this.historyFilters.push(filterInst);

  this.suspendDisplayUpdate = false;
  Gui.handleControlsChange();

  return filterInst;
};

Gui.deleteHistoryEntry = function(filterInst) {
  for (var i = 0; i < this.historyFilters.length; i++) {
    var maybeInputFilterInst = this.historyFilters[i];

    if (maybeInputFilterInst === filterInst) {
      this.historyFolder.removeFolder(filterInst.folder.name);
      this.historyFilters.splice(i, 1);
      this.updateUrl();
      return;
    }
  }
};

Gui.deleteHistoryBelow = function(filterInst) {
  for (var i = 0; i < this.historyFilters.length; i++) {
    var maybeInputFilterInst = this.historyFilters[i];

    if (maybeInputFilterInst === filterInst) {
      for (var j = i + 1; j < this.historyFilters.length; j++) {
        var filterInstToRemove = this.historyFilters[j];
        this.historyFolder.removeFolder(filterInstToRemove.folder.name);
      }
      this.historyFilters.splice(i+1, this.historyFilters.length - (i+1));
      this.updateUrl();
      return;
    }
  }
};

// gets rid of the ".0000000001" etc when stringifying floats
// from http://stackoverflow.com/questions/1458633/how-to-deal-with-floating-point-number-precision-in-javascript
function stripFloatError(number) {
  if (number && number.toPrecision) {
    return (parseFloat(number.toPrecision(12)));
  }
  else {
    return number;
  }
};

Gui.parseUrl = function() {
  for (var i = 0; i < Parser.commands.length; i++) {
    var cmd = Parser.commands[i];

    if (cmd.name == "imageFile") {
      var fileName = cmd.args[0];
    }
    // else if (cmd.name == "Animation") {
    //   Gui.animationMode = true;
    // }
    else {
      var filterDef = undefined;
      for (var filterIdx = 0; filterIdx < this.filterDefs.length; filterIdx++) {
        var curFilterDef = this.filterDefs[filterIdx];
        if (curFilterDef.name === cmd.name) {
          filterDef = curFilterDef;
          break;
        }
      }

      if (filterDef !== undefined) { // is known command
        this.addHistoryEntry(filterDef, cmd.args);
      }
    }
  }
};

Gui.getUrl = function(enableAnimation) {
  if (enableAnimation === undefined) {
    enableAnimation = false;
  }

  var mostRecentCanAnimateIdx = -1;
  if (enableAnimation) {
    for (var i = 0; i < this.historyFilters.length; i++) {
      if (this.historyFilters[i].filterDef.canAnimate) {
        mostRecentCanAnimateIdx = i;
      }
    }
  }

  var url = "";
  for (var i = 0; i < this.historyFilters.length; i++) {
    var filterInst = this.historyFilters[i];

    url += (i>0 && "&" || "") + filterInst.filterDef.name + "=";

    if (i == mostRecentCanAnimateIdx) {
      var valueRange = filterInst.filterDef.paramDefs[0].sliderRange;
      url += "("+stripFloatError(valueRange[0])+","+stripFloatError(valueRange[1])+","+stripFloatError((valueRange[1]-valueRange[0])/10)+")";
    } else {
      for (var j = 0; j < filterInst.argsList.length; j++) {
        if (j > 0)
          url += ";";
        var val = filterInst.argsList[j];
        if (isNaN(val) || val === "") {
          if (Pixel.prototype.isPrototypeOf(val)) {
            url += "["+stripFloatError(val.data[0])+","+stripFloatError(val.data[1])+","+stripFloatError(val.data[2])+","+stripFloatError(val.a)+"]";
          }
          else {
            url += val;
          }
        }
        else {
          url += stripFloatError(val);
        }
      }
    }
  }
  url = url.replace(/ /g, "_");

  return url;
};

var stateObj = {};
Gui.updateUrl = function() {
  if (Gui.batchMode) return;

  var url = Gui.batchMode && "batch.html?" || "index.html?";
  url += Gui.getUrl();
  history.pushState(stateObj, "", url);
};

Gui.alertOnce = function(msg, divName) {
  divName = divName || "alert_div";
  // NOTE: mainDiv opacity change disabled to allow >1 different alerts
  // var mainDiv = document.getElementById('main_div');
  // mainDiv.style.opacity = "0.3";
  var alertDiv = document.getElementById(divName);
  alertDiv.innerHTML = '<p>'+msg + '</p><button id="ok" onclick="Gui.closeAlert()">ok</button>';
  alertDiv.style.display = 'inline';
};

Gui.closeAlert = function (divName) {
  divName = divName || "alert_div";
  // NOTE: mainDiv opacity change disabled to allow >1 different alerts
  // var mainDiv = document.getElementById('main_div');
  // mainDiv.style.opacity = "1";
  var alertDiv = document.getElementById(divName);
  alertDiv.style.display = 'none';
};
