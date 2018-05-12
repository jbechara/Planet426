"use strict";

var Filters = Filters || {};

//--------------------------------------------------
// General Utility Functions
//--------------------------------------------------

var pi = 3.14159265359;
// Warp weight constants
var WARP_P = 0.5;
var WARP_A = 0.01;
var WARP_B = 2;

// Clamp val in [min, max]
function clamp(val, min, max) {
    return val < min ? min : (val > max ? max : val);
}

// Extract centers (modular version of the provided code)
function getCenters(vertsString) {
    // extract vertex coordinates from the URL string.
    var centers = [];
    var coordStrings = vertsString.split("x");
    var coordsSoFar = 0;
    for (var i = 0; i < coordStrings.length; i++) {
        var coords = coordStrings[i].split("y");
        var x = parseInt(coords[0]);
        var y = parseInt(coords[1]);
        if (!isNaN(x) && !isNaN(y)) {
            centers.push({
                x: x,
                y: y,
            })
        }
    }

    return centers;
};

// Return euclidian distance between points
function euclidDist(x1, y1, x2, y2) {
    return (((x2 - x1)**2 + (y2 - y1)**2)**(0.5));
};

// Convert RGB directly to LMS
Pixel.prototype.rgbToLms = function() {
    assert(this.colorSpace === "rgb", "input pixel color space must be rgb");
    var pixel = this.rgbToXyz();
    return pixel.xyzToLms()
}

// Convert LMS directly to RGB
Pixel.prototype.lmsToRgb = function() {
    assert(this.colorSpace === "lms", "input pixel color space must be lms");
    var pixel = this.lmsToXyz();
    return pixel.xyzToRgb()
}

// Apply's the over operator to write over a pixel of variable
// alpha with another pixel of variable alpha
Image.prototype.paintOverPixel = function(x, y, topColor) {
    var bottomColor = this.getPixel(x, y);
    var bottomAlpha = bottomColor.a;
    var topAlpha = topColor.a;

    // newColor = (CaAa + CbAb(1 - Aa)) / (Aa + Ab(1 - Ab))
    var newColor = topColor.multipliedBy(topAlpha).plus(bottomColor.multipliedBy(bottomAlpha * (1.0 - topAlpha))).dividedBy(
        topAlpha + bottomAlpha * (1.0 - topAlpha));
    newColor.a = topAlpha + bottomAlpha * (1.0 - topAlpha);
    this.setPixel(x, y, newColor);
};

// Draw a colored circle of r = radius on center coords in image.
// alphaFunc(r, radius) is a function that returns the alpha value
// of a pixel at distance r from center.
Image.prototype.applyBrush = function(center, radius, color, alphaFunc) {
    // image dims
    var w = this.width;
    var h = this.height;
    var x = center.x;
    var y = center.y;

    // traverse (2r + 1)x(2r + 1) square; apply brush to pixel if
    // within distance radius from center
    for (var i = 0; i < radius; i++) {
        for (var j = 0; j < radius; j++) {

            // get distance, apply if within radius
            var r = euclidDist(i, j, 0, 0);
            if (r < radius) {
                // apply in four quadrants; avoid overwriting for alpha
                color.a = alphaFunc(r, radius);
                var r = x + i; // right
                var l = x - i; // left
                var d = y + j; // down
                var u = y - j; // up
                if (r < w ) {
                    if (d < h) { this.paintOverPixel(r, d, color); }
                    if (j != 0 && u >= 0) { this.paintOverPixel(r, u, color); }
                }
                if (l >= 0) {
                    if (i != 0 && d < h) { this.paintOverPixel(l, d, color); }
                    if (i != 0 && j != 0 && u >= 0) { this.paintOverPixel(l, u, color); }
                }
            }
        }
    }
};

// Vector subtraction
function vectSub(Q, P) {
    return [Q[0] - P[0], Q[1] - P[1]];
};

// Vector addition
function vectAdd(Q, P) {
    return [Q[0] + P[0], Q[1] + P[1]];
};

// Scale a vector
function vectScale(a, V) {
    return [a * V[0], a * V[1]];
};

// Return perp vector
function vectPerp(V) {
    return [V[1], -V[0]];
};

// Return dot product of vectors
function vectDot(Q, P) {
    return (Q[0]*P[0] + Q[1]*P[1]);
};

// Return vector magnitude
function vectMag(V) {
    return euclidDist(V[0], V[1], 0, 0);
};

// Warp Function for morph
Filters.warpImage = function(image, aL, bL, sampleMode) {
    var w = image.width;
    var h = image.height;
    var warpedImg = image.createImg(w, h);
    // For each pixel in dest
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var dSum = [0, 0];
            var totalWeight = 0;
            var bX = [x, y];
            // For each line
            for (var k = 0; k < bL.length; k++) {
                var bP = [bL[k].x0, bL[k].y0];
                var bQ = [bL[k].x1, bL[k].y1];
                var aP = [aL[k].x0, aL[k].y0];
                var aQ = [aL[k].x1, aL[k].y1];
                var bXminbP = vectSub(bX, bP);
                var bQminbP = vectSub(bQ, bP);
                var aQminaP = vectSub(aQ, aP);
                // Calculate u,v
                var u = vectDot(bXminbP, bQminbP) / (vectMag(bQminbP)**2);
                var v = vectDot(bXminbP, vectPerp(bQminbP)) / vectMag(bQminbP);
                // Calculate aX (X' in source image)
                var aX = vectAdd(aP, vectAdd(vectScale(u, aQminaP),
                    vectScale(v / vectMag(aQminaP), vectPerp(aQminaP))));
                // Displacement
                var D = vectSub(aX, bX);
                // Shortest distance from bX to bPbQ
                var dist;
                if (u < 0)
                    dist = vectMag(bXminbP);
                else if (u > 1)
                    dist = vectMag(vectSub(bX, bQ));
                else
                    dist = Math.abs(v);
                // Find weight
                var length = vectMag(bQminbP);
                var weight = ((length**WARP_P) / (WARP_A + dist))**WARP_B;
                totalWeight += weight;
                // Add to running total
                dSum = vectAdd(dSum, vectScale(weight, D));
            }
            // Apply warp with resampling
            var aX = vectAdd(bX, vectScale(1.0 / totalWeight, dSum));
            warpedImg.setPixel(x, y, this.samplePixel(image, aX[0], aX[1],
                                                        sampleMode));
        }
    }

    return warpedImg;
};

// Resampling filter (point)
Filters.pointSample = function (image, x, y) {
    y = Math.max(0, Math.min(Math.round(y), image.height - 1));
    x = Math.max(0, Math.min(Math.round(x), image.width - 1));

    return image.getPixel(x, y);
};
//--------------------------------------------------
// Filters
//--------------------------------------------------


// Let's do this the easy way by using the built in function
Filters.fillFilter = function(image, color) {
    image.fill(color);
    return image;
};

// Apply hard brush
Filters.brushFilter = function(image, radius, color, vertsString) {
    // extract vertex coordinates from the URL string.
    var centers = getCenters(vertsString);

    // draw a filled circle centered at every location in centers[].
    // radius and color are specified in function arguments.
    var uniformAlpha = function(r, radius) { return 1; };

    for (var i = 0; i < centers.length; i++) {
        image.applyBrush(centers[i], radius, color, uniformAlpha);
    }

    return image;
};

function colorEq(c1, c2) {
    if (c1.data[0] != c2.data[0]) return false;
    if (c1.data[1] != c2.data[1]) return false;
    if (c1.data[2] != c2.data[2]) return false;
    return true;
}

function dfsFill(image, pixel, oldColor, newColor) {
    var queue = [[pixel.x, pixel.y]];
    while (queue.length > 0) {
        pixel = queue.shift()
        var x = pixel[0];
        var y = pixel[1];
        console.log(x, y)
        if (colorEq(newColor, image.getPixel(x, y))) continue;
        image.setPixel(x, y, newColor);

        // recur on neighbors if necessary
        if (x - 1 >= 0) {
            if (colorEq(oldColor, image.getPixel(x - 1, y))) {
                queue.push([x - 1, y]);
            }
        }
        if (x + 1 < image.width) {
            if (colorEq(oldColor, image.getPixel(x + 1, y))) {
                queue.push([x + 1, y]);
            }
        }
        if (y - 1 >= 0) {
            if (colorEq(oldColor, image.getPixel(x, y - 1))) {
                queue.push([x, y - 1]);
            }
        }
        if (y + 1 < image.height) {
            if (colorEq(oldColor, image.getPixel(x, y + 1))) {
                queue.push([x, y + 1]);
            }
        }
    }
}

// Apply hard brush
Filters.bucketFilter = function(image, newColor, vertsString) {
    // extract vertex coordinates from the URL string.
    var centers = getCenters(vertsString);

    for (var i = 0; i < centers.length; i++) {
        var oldColor = image.getPixel(centers[i].x, centers[i].y);
        if (colorEq(oldColor, newColor)) continue;
        dfsFill(image, centers[i], oldColor, newColor);
    }

    return image;
};

// Translate an image up or down by a number of pixels
Filters.loopedTranslateFilter = function(image, x, y, sampleMode) {
    var w = image.width;
    var h = image.height;
    var newImg = image.createImg(w, h);

    for (var v = 0; v < h; v++) {
        for (var u = 0; u < w; u++) {
            newImg.setPixel(u, v, this.pointSample(image, (u + x) % w, (v + y) % h));
        }
    }

    return newImg;
};
