"use strict";

// this construction helps avoid polluting the global name space
var Main = Main || {
  // internal stuff
  imageStack: [],

  // how much to offset display of each image on stack:
  imageStackDisplayOffset: 100,

  // print out debug info, namely filter processing time
  debugPrint: true,

  // time in ms after which to pause filter application to update display
  // (can only pause between filters)
  applyRefreshTime: 1000,

  // time in ms before "working..." popup is displayed
  workingDialogDelay: 500,

};

Main.clearDisplay = function() {
  Main.ctx.clearRect(0, 0, Main.canvas.width, Main.canvas.height);
}

Main.displayImage = function(image, offsetX, offsetY, noClear) {
  offsetX = offsetX || 0;
  offsetY = offsetY || 0;

  if (!noClear) {
    // NOTE: changing canvas dimensions clears it
    Main.canvas.width  = image.width + offsetX;
    Main.canvas.height = image.height + offsetY;
  }
  Main.ctx.putImageData(image.getImageData(), offsetX, offsetY);
}

// called when the gui params change and we need to update the image
Main.controlsChangeCallback = function() {
  if (!Main.allImagesLoaded) {
    return;
  }

  Main.filterHistoryData = Gui.getFilterHistoryData();

  Main.totalApplyTimeSinceFirstFilter = 0;
  Main.applyFilters();
};

Main.displayImageStack = function() {
  Main.canvas.width  = 0;
  Main.canvas.height = 0;
  for (var i = 0; i < Main.imageStack.length; i++) {
    // never shrink the canvas, messes with gif creation when using image stack
    Main.canvas.width  = Math.max(Main.canvas.width , Main.imageStack[i].width + i * Main.imageStackDisplayOffset);
    Main.canvas.height = Math.max(Main.canvas.height, Main.imageStack[i].height + i * Main.imageStackDisplayOffset);
  }

  Main.clearDisplay();
  for (var i = 0; i < Main.imageStack.length; i++) {
    Main.displayImage(Main.imageStack[i], i * Main.imageStackDisplayOffset, i * Main.imageStackDisplayOffset, true);
  }
}

Main.pushBrushSplat = function() {
  var filterInsts = Gui.getFilterHistoryData();
  if (filterInsts.length > 0) {
    var topFilter = filterInsts[filterInsts.length - 1];
    if (topFilter.filterDef.name == "Brush") {
      var vertsTextBox = topFilter.filterDef.name == "Brush" ? topFilter.guiControls[2] : topFilter.guiControls[3];
      var imageOffsetInCanvas = Math.max(Main.imageStack.length - 1, 0) * Main.imageStackDisplayOffset;
      vertsTextBox.setValue(vertsTextBox.getValue() + "x" + (Main.mouseX - imageOffsetInCanvas) + "y" + (Main.mouseY - imageOffsetInCanvas));
    }
    else if (topFilter.filterDef.name == "Bucket") {
      var vertsTextBox = topFilter.guiControls[1];
      var imageOffsetInCanvas = Math.max(Main.imageStack.length - 1, 0) * Main.imageStackDisplayOffset;
      vertsTextBox.setValue(vertsTextBox.getValue() + "x" + (Main.mouseX - imageOffsetInCanvas) + "y" + (Main.mouseY - imageOffsetInCanvas));
    }
  }
};


// when HTML is finished loading, do this
window.onload = function() {
  Main.canvas = document.getElementById('canvas');
  Main.ctx    = canvas.getContext('2d');

  Main.canvas.addEventListener( "mousemove", function(event) {
    Main.mouseX = event.offsetX || event.layerX;
    Main.mouseY = event.offsetY || event.layerY;
    if (Main.mousePressed) {
      Main.pushBrushSplat();
    }
  });
  Main.canvas.addEventListener( "mousedown", function(event) {
    Main.mousePressed = true;
    Main.pushBrushSplat();
  });
  Main.canvas.addEventListener( "mouseup", function(event) {
    Main.mousePressed = false;
  });

  // preload all images in list
  Main.images = {};
  Main.imagesToLoad = GuiConfig.imageNames.length;
  for (var i = 0; i < GuiConfig.imageNames.length; i++) {
    var imageName = GuiConfig.imageNames[i];
    var image = document.createElement("img");

    // immediately called closure generating function
    image.onload = function(imageName, image) { return function() {
      Main.ctx.clearRect(0, 0, Main.canvas.width, Main.canvas.height);
      Main.canvas.width = image.width;
      Main.canvas.height = image.height;

      Main.ctx.drawImage(image, 0, 0);
      var imageData = Main.ctx.getImageData(0, 0, image.width, image.height);
      Main.ctx.clearRect(0, 0, Main.canvas.width, Main.canvas.height);

      var imageObj = new Image(image.width, image.height, imageData.data, undefined, imageName);

      Main.imagesToLoad--;
      Main.images[imageName] = imageObj;

      if (Main.imagesToLoad <= 0) {
        Main.allImagesLoaded = true;
        Main.controlsChangeCallback();
      }
    }; }(imageName, image);

    image.src = 'images/' + imageName;
  }

  // initialize the gui with callbacks to handle gui changes
  Gui.init(Main.controlsChangeCallback);
};

// from http://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
// modified to check correctly if colors are equal
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) {
    return false;
  }
  if (a.length != b.length) {
    return false;
  }

  var tf;
  for (var i = 0; i < a.length; ++i) {
    if (typeof Pixel != "undefined" && Pixel.prototype.isPrototypeOf(a) && Pixel.prototype.isPrototypeOf(b)) {
      if (! (a.data[0] === b.data[0] && a.data[1] === b.data[1] && a.data[2] === b.data[2] && a.a === b.a) ) {
        return false;
      }
    }
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};

Main.hideProcessingText = function() {
  var processingText = document.getElementById( 'loading' );
  if (processingText) {
    processingText.style.display = 'none';
  }
};

Main.showErrorText = function(show) {
  assert(show !== undefined, "showErrorText takes a boolean");

  var errorText = document.getElementById( 'error' );
  if (errorText) {
    if (show) {
      errorText.style.display = 'inline';
    }
    else {
      errorText.style.display = 'none';
    }
  }
};

Main.applyFilters = function() {
  clearTimeout(Main.applyTimeout);
  Main.applyTimeout = null;

  var filterHistoryData = Main.filterHistoryData;

  Main.imageCache = Main.imageCache || [];
  var cache = Main.imageCache;

  var imageNum = 0;

  var imageStack = [];
  Main.imageStack = imageStack;

  var totalFilterTime = 0;

  Main.showErrorText(false);

  if (Main.debugPrint) {
    console.log("-------\nBEGINNING FILTER APPLICATION\n------");
  }

  for (var i = 0; i < filterHistoryData.length; i++) {
    var data = filterHistoryData[i];
    if (data !== undefined) {
      var filterName = data.filterDef.name;

      // display "working..." dialog if it's been some time since apply start
      if (Main.totalApplyTimeSinceFirstFilter > Main.workingDialogDelay) {
        Gui.alertOnce("Working... (" + filterName + ")", "alert_div_internal");

        // clearTimeout(Main.applyTimeout);
        // Main.applyTimeout = setTimeout( Main.applyFilters, 0 );
        // Main.displayImageStack();
        // return;
      }

      var args = data.argsList.slice();

      var cachedImageData = cache[i];

      if (data.filterDef.notFilter) { // APPLY NON-FILTER ACTION
        if (data.filterDef.pushImage) {
          var baseImage, imageName;

          if (filterName === "Push Image") {
            imageName = data.argsList[0];

            baseImage = Main.images[imageName];
            assert(baseImage, "image not found (should be preloaded): " + imageName);
            baseImage = baseImage.copyImg();
          }
          else if (filterName === "Push Blank Image") {
            imageName = "Blank";
            var width = parseInt(data.argsList[0]);
            var height = parseInt(data.argsList[1]);
            assert(width, "Push Blank Image: invalid width: " + data.argsList[0]);
            assert(height, "Push Blank Image: invalid height: " + data.argsList[1]);
            var color = data.argsList[2];

            baseImage = new Image(width, height, undefined, imageName);
            baseImage.fill(color);
          }

          // clear cache on image change
          if (cache[i] && cache[i].imageName !== imageName) {
            cache.splice(i+1, cache.length - (i+1));
          }

          cache[i] = {
            imageName: imageName,
            lastFilterName: filterName,
            args: data.argsList.slice(),
            // image: baseImage.copyImg(),
          };
          imageStack.push(baseImage);
        }
      }
      else { // APPLY FILTER
        // use image cache?
        if (cachedImageData !== undefined
          && cachedImageData.lastFilterName === filterName
          && arraysEqual(args, cachedImageData.args)) {

          for (var j = 0; j < (data.filterDef.numImageInputs || 1); j++) {
            imageStack.pop();
          }
          imageStack.push(cache[i].image.copyImg());
          if (Main.debugPrint) {
            console.log(filterName + ' operation (' + (i+1) + ') loaded from cache.');
          }
        }

        // cache invalid from here onward
        else {
          cache.splice(i+1, cache.length - (i+1));

          var argsNoImages = args.slice(); // need to save this for cache

          for (var j = 0; j < (data.filterDef.numImageInputs || 1); j++) {
            var poppedImage = imageStack.pop();
            if (!poppedImage) {
              console.log("ERROR: image stack empty. History must start with Push Image");
              break;
            }
            args.unshift(poppedImage.copyImg());
          }

          var filterFuncName = data.filterDef.funcName || filterName.toLowerCase() + 'Filter';
          var filterFunc = Filters[filterFuncName];

          assert(filterFunc, "ERROR: filter not found: " + filterFuncName + ". Make sure the name in gui.js corresponds to the function name in filters.js.");

          var filterStartTime = performance.now();

          // call the function with the values in args as arguments
          // if it fails or doesn't return an image, break out of the loop
          try {
            var filteredImage = filterFunc.apply(Filters, args);
            assert(filteredImage, "no image returned by filter " + filterFuncName);
            imageStack.push(filteredImage);
          }
          catch(err) {
            Main.hideProcessingText();
            Main.showErrorText(true);
            Main.clearDisplay();
            clearTimeout(Main.applyTimeout);
            console.log(err);
            return;
          }


          var filterTime = Math.round( performance.now() - filterStartTime );
          if (Main.debugPrint) {
            console.log(filterName + ' operation (' + (i+1) + ') took ' + filterTime + ' ms.');
          }

          totalFilterTime += filterTime;
          Main.totalApplyTimeSinceFirstFilter += filterTime;

          cache[i] = {
            // imageName: imageName,
            lastFilterName: filterName,
            args: argsNoImages,
            image: filteredImage.copyImg(),
          };
        }
      }

      // taking too long? halt the application to update the display, then immediately resume
      if (totalFilterTime > Main.applyRefreshTime) {
        clearTimeout(Main.applyTimeout);
        Main.applyTimeout = setTimeout( Main.applyFilters, 0 );
        Main.displayImageStack();
        return;
      }
    }
  }

  // only reach here when final filter application completes

  clearTimeout(Main.applyTimeout);
  Gui.closeAlert("alert_div_internal");

  Main.displayImageStack();

  // GIF Animation
  // if (Gui.animationMode) {
  //   // select the last history filter with one changeable parameter
  //   for (var i = Gui.historyFilters.length-1; i >= 0; i--) {
  //     var historyItemDef = Gui.historyFilters[i].filterDef;
  //     var validParamIdx;
  //     var nVaryingParameter = 0;
  //     var valueRange = {};
  //
  //     for (var validParamIdx = 0; validParamIdx < historyItemDef.paramDefs.length; validParamIdx++) {
  //       if (historyItemDef.paramDefs[validParamIdx].sliderRange) {
  //         nVaryingParameter++;
  //         valueRange = historyItemDef.paramDefs[validParamIdx].sliderRange;
  //       }
  //     }
  //
  //     if (nVaryingParameter == 1) {
  //         if (Main.animatedValFound) {
  //           break;
  //         }
  //
  //         Main.animatedValFound = true;
  //
  //         var defaultOnChangeFunc = function(historyIdx) {
  //           return function(val) {
  //             Gui.historyFilters[historyIdx].argsList[0] = val;
  //             Gui.handleControlsChange();
  //           }
  //         }(i)
  //
  //         Main.animatedValData = {
  //           current: valueRange[0],
  //           start: valueRange[0],
  //           end: valueRange[1],
  //           step: (valueRange[1] - valueRange[0]) / 10,
  //           changeFunc: defaultOnChangeFunc,
  //         };
  //     }
  //   }
  // }
};
