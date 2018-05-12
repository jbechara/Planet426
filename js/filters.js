"use strict";

var Filters = Filters || {};

//--------------------------------------------------
// General Utility Functions
//--------------------------------------------------

var pi = 3.14159265359;

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
    var w = image.width;
    var h = image.height;
    var queue = [[pixel.x, pixel.y]];
    var marked = []
    var color = [];
    marked[pixel.x*w + pixel.y] = true;

    while (queue.length > 0) {
        pixel = queue.pop()
        color.push(pixel);
        var x = pixel[0];
        var y = pixel[1];

        // recur on neighbors if necessary
        if (x - 1 >= 0) {
            if ((marked[(x - 1)*w + y] != true)
                && colorEq(oldColor, image.getPixel(x - 1, y))) {
                queue.push([x - 1, y]);
                marked[(x - 1)*w + y] = true;
            }
        }
        if (x + 1 < w) {
            if ((marked[(x + 1)*w + y] != true)
                && colorEq(oldColor, image.getPixel(x + 1, y))) {
                queue.push([x + 1, y]);
                marked[(x + 1)*w + y] = true;
            }
        }
        if (y - 1 >= 0) {
            if ((marked[x*w + (y - 1)] != true)
                && colorEq(oldColor, image.getPixel(x, y - 1))) {
                queue.push([x, y - 1]);
                marked[x*w + (y - 1)] = true;
            }
        }
        if (y + 1 < h) {
            if ((marked[x*w + (y + 1)] != true)
                && colorEq(oldColor, image.getPixel(x, y + 1))) {
                queue.push([x, y + 1]);
                marked[x*w + (y + 1)] = true;
            }
        }
    }
    // color marked pixels
    for (var i = 0; i < color.length; i++) {
        image.setPixel(color[i][0], color[i][1], newColor);
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
            var p_x = (u - x);
            var p_y = (v - y);
            if (p_x < 0) p_x += w;
            if (p_y < 0) p_y += h;
            newImg.setPixel(u, v, this.pointSample(image, p_x % w, p_y % h));
        }
    }

    return newImg;
};
