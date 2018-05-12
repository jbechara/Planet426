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

// Resampling filters (bilinear, gaussian, and point)
Filters.samplePixel = function (image, x, y, mode) {
    // Let's clamp just in case
    x = clamp(x, 0, image.width - 1);
    y = clamp(y, 0, image.height - 1);

    if (mode == 'bilinear') {
        var u1 = Math.floor(x);
        var u2 = Math.min(Math.ceil(x), image.width - 1);
        var v1 = Math.floor(y);
        var v2 = Math.min(Math.ceil(y), image.height - 1);

        // Idea from lecture notes
        var linearInterpol = function(valueLo, valueHi, lo, hi, s) {
            var alpha = 1.0 - (s - lo) * 1.0; // Weight for lo value
            return (alpha * valueLo + (1.0 - alpha) * valueHi);
        }

        var q11 = image.getPixel(u1, v1);
        var q12 = image.getPixel(u1, v2);
        var q21 = image.getPixel(u2, v1);
        var q22 = image.getPixel(u2, v2);

        var a = new Pixel("#000000"); // Just need a new pixel object
        var b = new Pixel("#000000"); // Just need a new pixel object
        var result = new Pixel("#000000"); // Just need a new pixel object
        for (var c = 0; c < 3; c++) {
            a.data[c] = linearInterpol(q11.data[c], q21.data[c], u1, u2, x);
            b.data[c] = linearInterpol(q12.data[c], q22.data[c], u1, u2, x);
            result.data[c] = linearInterpol(a.data[c], b.data[c], v1, v2, y);
        }
        result.clamp();
        return result;
    }
    else if (mode == 'gaussian') {
        var w = image.width;
        var h = image.height;
        var v = y;
        var u = x;
        y = Math.max(0, Math.min(Math.round(y), h - 1));
        x = Math.max(0, Math.min(Math.round(x), w - 1));
        var weightTotal = 0.0;
        var r = 0;
        var g = 0;
        var b = 0;
        var sigma = 1.0;
        var winR = 3.0 * sigma;
        // Applying within our window
        for (var j = -winR; (j <= winR) && (j + y < h); j++) {
            if (y + j < 0)
                continue;
            for (var i = -winR; (i <= winR) && (i + x < w); i++) {
                if (x + i < 0)
                    continue;

                var pixel = image.getPixel(x + i, y + j);
                var radius = euclidDist(x + i, y + j, u , v);
                var weight = Math.exp(((radius/sigma)**2) / -2.0);
                weightTotal += weight;
                r += pixel.data[0] * weight;
                g += pixel.data[1] * weight;
                b += pixel.data[2] * weight;
            }
        }

        var result = image.getPixel(x, y);
        result.data[0] = r / weightTotal;
        result.data[1] = g / weightTotal;
        result.data[2] = b / weightTotal;
        result.clamp();
        return result;

    } else { // point sampling

        y = Math.max(0, Math.min(Math.round(y), image.height - 1));
        x = Math.max(0, Math.min(Math.round(x), image.width - 1));
        return image.getPixel(x, y);
    }
};

// Let's do this the easy way by using the built in function
Filters.fillFilter = function(image, color) {
    image.fill(color);
    return image;
};


//--------------------------------------------------
// Filters
//--------------------------------------------------

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

// Apply soft brush
Filters.softBrushFilter = function(image, radius, color, alpha_at_center, vertsString) {
    // extract vertex coordinates from the URL string.
    var centers = getCenters(vertsString);
  
    // draw a filled circle with opacity equals to alpha_at_center at the center of each circle
    // the opacity decreases linearly along the radius and becomes zero at the edge of the circle
    // radius and color are specified in function arguments.
    alpha_at_center = clamp(alpha_at_center, 0, 1);
    var linearAlpha = function(r, radius) { return alpha_at_center * (1.0 - (r / radius)); };

    for (var i = 0; i < centers.length; i++) {
        image.applyBrush(centers[i], radius, color, linearAlpha);
    }

    return image;
};

// Brighten Image
Filters.brightnessFilter = function(image, ratio) {
    var alpha, dirLuminance;

    // Determine the "background"
    if (ratio < 0.0) {
        alpha = 1 + ratio;
        dirLuminance = 0;   // blend with black
    } else {
        alpha = 1 - ratio;
        dirLuminance = 1; // blend with white
    }

    // Apply to each pixel in image
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            var pixel = image.getPixel(x, y);

            pixel.data[0] = alpha * pixel.data[0] + (1-alpha) * dirLuminance;
            pixel.data[1] = alpha * pixel.data[1] + (1-alpha) * dirLuminance;
            pixel.data[2] = alpha * pixel.data[2] + (1-alpha) * dirLuminance;

            image.setPixel(x, y, pixel);
        }
    }

    return image;
};

// Adjust Image Contrast
Filters.contrastFilter = function(image, ratio) {
    // GIMP Reference: https://en.wikipedia.org/wiki/Image_editing#Contrast_change_and_brightening
    // contrastFactor = (tan ((contrast + 1) * PI/4) )
    var contrastFactor = Math.tan((ratio + 1) * Math.PI/4);

    // Apply to each pixel in image
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            var pixel = image.getPixel(x, y);

            // value = (value - 0.5) * (tan ((contrast + 1) * PI/4) ) + 0.5;
            pixel.data[0] = (pixel.data[0] - 0.5) * contrastFactor + 0.5;
            pixel.data[1] = (pixel.data[1] - 0.5) * contrastFactor + 0.5;
            pixel.data[2] = (pixel.data[2] - 0.5) * contrastFactor + 0.5;

            pixel.clamp();
            image.setPixel(x, y, pixel);
        }
    }

    return image;
};

// Adjust Image Gamma
Filters.gammaFilter = function(image, logOfGamma) {
    var gamma = Math.exp(logOfGamma);
  
    // Apply to each pixel in image
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            var pixel = image.getPixel(x, y);

            pixel.data[0] = pixel.data[0]**gamma;
            pixel.data[1] = pixel.data[1]**gamma;
            pixel.data[2] = pixel.data[2]**gamma;

            pixel.clamp();
            image.setPixel(x, y, pixel);
        }
    }

    return image;
};

// Applies Vignette Filter onto Image
Filters.vignetteFilter = function(image, innerR, outerR) {
    // InnerR should be at least 0.1 smaller than outerR
    innerR = clamp(innerR, 0, outerR-0.1);

    // Image dims
    var w = image.width;
    var h = image.height;
    var halfdiag = euclidDist(w, h, 0, 0) / 2.0;
    var xCen = Math.floor(w/2);
    var yCen = Math.floor(h/2);

    // Function that determines the alpha as a function of r's normalized distance
    // from the center of the image
    var vignetteAlpha = function(r) {
        if (r <= innerR)
            return 1;
        else if (r >= outerR)
            return 0;
        else
            return 1 - (r - innerR) / (outerR - innerR);
    };

    // For each pixel, adjust brightness based on distance from center
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {

            // Find alpha as a function of normalized distance from the center
            var r = euclidDist(x, y, xCen, yCen) / halfdiag;
            var alpha = vignetteAlpha(r);

            // Adjust pixel alpha (over black background)
            var pixel = image.getPixel(x, y);
            pixel.data[0] = alpha * pixel.data[0];
            pixel.data[1] = alpha * pixel.data[1];
            pixel.data[2] = alpha * pixel.data[2];

            pixel.clamp();
            image.setPixel(x, y, pixel);
        } 
    } 

    return image;
};

// Equalize the histogram of the image
Filters.histogramEqualizationFilter = function( image ) {
    // Reference: https://en.wikipedia.org/wiki/Histogram_equalization#Small_image
    // Note that HSL lightness can take up to 512 values in RGB space (since it
    // is the average of two values in [0, 255])
    var L = 511;
    var histogram = new Int32Array(L);
    var w = image.width;
    var h = image.height;

    // Let's populate our histogram
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var pixel = image.getPixel(x, y).rgbToHsl();
            var lightness = clamp(Math.floor(pixel.data[2] * (L - 1)), 0, L - 1);
            histogram[lightness] += 1;
        } 
    }

    // Now let's equalize our histogram (overwrites it with a maoping)
    var minCDF = 0; // minimum non-zero value of the lightness CDF
    var tally = 0; // running sum
    var normalizationFactor = (L - 1) * 1.0 / (w * h - 1);
    for (var i = 0; i < L; i++) {
        // skip initial non-zero entries
        if (minCDF == 0 && histogram[i] == 0)
            continue;
        // set minCDF
        if (minCDF == 0)
            minCDF =  histogram[i];
        // equalize histogram
        tally += histogram[i];
        histogram[i] = Math.round((tally - minCDF) * normalizationFactor);
    }

    // Finally, apply our new histogram to the image
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var pixel = image.getPixel(x, y).rgbToHsl();
            var lightness = clamp(Math.floor(pixel.data[2] * (L - 1)), 0, L - 1);
            pixel.data[2] = histogram[lightness] * 1.0 / (L - 1);

            pixel = pixel.hslToRgb();
            pixel.clamp();
            image.setPixel(x, y, pixel);
        } 
    }
    
    return image;
};

// Convert the image to Grayscale
Filters.grayscaleFilter = function( image ) {
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            var pixel = image.getPixel(x, y);
            // Compute Luminance
            var luminance = 0.2126 * pixel.data[0]
                            + 0.7152 * pixel.data[1]
                            + 0.0722 * pixel.data[2];
            pixel.data[0] = luminance;
            pixel.data[1] = luminance;
            pixel.data[2] = luminance;

            image.setPixel(x, y, pixel);
        }
    }

    return image;
};

// Adjust saturation values of filter
Filters.saturationFilter = function(image, ratio) {
    // Reference: http://www.graficaobscura.com/interp/index.html
    // (Using the method of grayscale interpolation)
    
    // Grayscale version of omage
    var grayImage = Filters.grayscaleFilter(image.copyImg());

    // Linear interpolation
    var alpha = 1 + ratio;
    var w = image.width;
    var h = image.height;
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var pixel = image.getPixel(x, y);
            var grayVal = grayImage.getPixel(x, y).data[0];

            pixel.data[0] = alpha * pixel.data[0] + (1 - alpha) * grayVal;
            pixel.data[1] = alpha * pixel.data[1] + (1 - alpha) * grayVal;
            pixel.data[2] = alpha * pixel.data[2] + (1 - alpha) * grayVal;

            pixel.clamp();
            image.setPixel(x, y, pixel);
        } 
    } 

    return image;
};

// Adjust image white balance 
Filters.whiteBalanceFilter = function(image, white) {
    // Reference: https://en.wikipedia.org/wiki/Color_balance#Von_Kries's_method
    var whiteLms = white.rgbToLms();
    var w = image.width;
    var h = image.height;
    
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var pixel = image.getPixel(x, y).rgbToLms();

            pixel.data[0] /= whiteLms.data[0];
            pixel.data[1] /= whiteLms.data[1];
            pixel.data[2] /= whiteLms.data[2];

            pixel = pixel.lmsToRgb();
            pixel.clamp();
            image.setPixel(x, y, pixel);
        } 
    } 

    return image;
};

// Match the lightness histogram of image to refImg
Filters.histogramMatchFilter = function(image, refImg) {
    // Reference: https://en.wikipedia.org/wiki/Histogram_equalization#Small_image
    // Reference: https://en.wikipedia.org/wiki/Histogram_matching
    // Reference: http://paulbourke.net/miscellaneous/equalisation/
    // Note that HSL lightness can take up to 512 values in RGB space (since it
    // is the average of two values in [0, 255])
    var L = 511;
    var histogramOld = new Int32Array(L);
    var histogramNew = new Int32Array(L);
    var h = image.height;
    var w = image.width;

    // Let's populate our histograms
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var pixel = image.getPixel(x, y).rgbToHsl();
            var lightness = clamp(Math.floor(pixel.data[2] * (L - 1)), 0, L - 1);
            histogramOld[lightness] += 1;
        } 
    }
    for (var y = 0; y < refImg.height; y++) {
        for (var x = 0; x < refImg.width; x++) {
            var pixel = refImg.getPixel(x, y).rgbToHsl();
            var lightness = clamp(Math.floor(pixel.data[2] * (L - 1)), 0, L - 1);
            histogramNew[lightness] += 1;
        } 
    }

    // Now let's remap our old histogram to the new one
    var mapping = new Int32Array(L); // Could also rewrite over old to save memory
    var oldCDF = 0;
    var newCDF = 0;
    var oldScale = 1.0 / (w * h);
    var newScale = 1.0 / (refImg.width * refImg.height);
    var j = 0;
    for (var i = 0; i < L; i++) {
        oldCDF += histogramOld[i] * oldScale;
        while (oldCDF > (newCDF + histogramNew[j] * newScale) && j < L) {
            newCDF += histogramNew[j] * newScale;
            j++;
        }

        mapping[i] = j;
    }

    // Finally, apply our new histogram to the image
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var pixel = image.getPixel(x, y).rgbToHsl();
            var lightness = clamp(Math.floor(pixel.data[2] * (L - 1)), 0, L - 1);
            pixel.data[2] = mapping[lightness] * 1.0 / (L - 1);

            pixel = pixel.hslToRgb();
            pixel.clamp();
            image.setPixel(x, y, pixel);
        } 
    }

    return image;
};

// Applies a Gaussian Blur to the entire image
Filters.gaussianFilter = function(image, sigma) {
    // note: this function needs to work in a new copy of the image
    //       to avoid overwriting original pixels values needed later
    // create a new image with the same size as the input image
    var h = image.height;
    var w = image.width;
    var newImg = image.createImg(w, h);
    // the filter window will be [-winR, winR];
    var winR = Math.round(sigma*3);
    // Horizontal convolve
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var weightTotal = 0.0; // Recomputed for edge behavior
            var r = 0;
            var g = 0;
            var b = 0;
            // Convolution in 1D with normalization
            for (var i = -winR; (i <= winR) && (i + x < w); i++) {
                if (i + x < 0)
                    continue;

                var weight = Math.exp(((i/sigma)**2) / -2.0);
                weightTotal += weight;
                var pixel = image.getPixel(i + x, y);
                r += pixel.data[0] * weight;
                g += pixel.data[1] * weight;
                b += pixel.data[2] * weight;
            }
            
            var newPixel = newImg.getPixel(x, y);
            newPixel.data[0] = r / weightTotal;
            newPixel.data[1] = g / weightTotal;
            newPixel.data[2] = b / weightTotal;
            newImg.setPixel(x, y, newPixel);
        } 
    }

    // Vertical convolve
    for (var x = 0; x < w; x++) {
        for (var y = 0; y < h; y++) {
            var weightTotal = 0.0; // Recomputed for edge behavior
            var r = 0;
            var g = 0;
            var b = 0;
            // Convolution in 1D with normalization
            for (var j = -winR; (j <= winR) && (j + y < h); j++) {
                if (j + y < 0)
                    continue;

                var weight = Math.exp(((j/sigma)**2) / -2.0);
                weightTotal += weight;
                var pixel = newImg.getPixel(x, y + j);
                r += pixel.data[0] * weight;
                g += pixel.data[1] * weight;
                b += pixel.data[2] * weight;
            }
            
            var newPixel = newImg.getPixel(x, y);
            newPixel.data[0] = r / weightTotal;
            newPixel.data[1] = g / weightTotal;
            newPixel.data[2] = b / weightTotal;
            newImg.setPixel(x, y, newPixel);
        } 
    }

    return newImg;
};

// Apply Edge Filter to the image
Filters.edgeFilter = function(image) {
    // note: this function needs to work in a new copy of the image
    //       to avoid overwriting original pixels values needed later
    // create a new image with the same size as the input image
    var h = image.height;
    var w = image.width;
    var newImg = image.createImg(w, h);
    // Convolve
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            // The center weight should be the number of kernel pixels
            // within the image. This is not always 8 along edges
            var count = 0;
            var r = 0;
            var g = 0;
            var b = 0;
            // Convolution in 2D for 3x3 window (excluding center)
            for (var j = -1; (j <= 1) && (j + y < h); j++) {
                if (y + j < 0)
                    continue;
                for (var i = -1; (i <= 1) && (i + x < w); i++) {
                    if (x + i < 0)
                        continue;
                    if (i == 0 && j == 0) // skip center
                        continue;

                    count += 1;
                    var pixel = image.getPixel(x + i, y + j);
                    r += pixel.data[0] * -1;
                    g += pixel.data[1] * -1;
                    b += pixel.data[2] * -1;
                }
            }

            // Center case
            var pixel = image.getPixel(x, y);
            // Return pixel = 1 - pixel
            pixel.data[0] = 1.0 - (r + pixel.data[0] * count);
            pixel.data[1] = 1.0 - (g + pixel.data[1] * count);
            pixel.data[2] = 1.0 - (b + pixel.data[2] * count);

            pixel.clamp();
            newImg.setPixel(x, y, pixel);
        } 
    }

    return newImg;
};

Filters.sharpenFilter = function( image ) {
    // note: this function needs to work in a new copy of the image
    //       to avoid overwriting original pixels values needed later
    // create a new image with the same size as the input image
    var h = image.height;
    var w = image.width;
    var newImg = image.createImg(w, h);
    // Convolve
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            // The center weight should be the number of kernel pixels
            // within the image. This is not always 8 along edges
            var count = 0;
            var r = 0;
            var g = 0;
            var b = 0;
            // Convolution in 2D for 3x3 window (excluding center)
            for (var j = -1; (j <= 1) && (j + y < h); j++) {
                if (y + j < 0)
                    continue;
                for (var i = -1; (i <= 1) && (i + x < w); i++) {
                    if (x + i < 0)
                        continue;
                    if (i == 0 && j == 0) // skip center
                        continue;

                    count += 1;
                    var pixel = image.getPixel(x + i, y + j);
                    r += pixel.data[0] * -1;
                    g += pixel.data[1] * -1;
                    b += pixel.data[2] * -1;
                }
            }

            // Center case
            var pixel = image.getPixel(x, y);
            pixel.data[0] += r + pixel.data[0] * count;
            pixel.data[1] += g + pixel.data[1] * count;
            pixel.data[2] += b + pixel.data[2] * count;

            pixel.clamp();
            newImg.setPixel(x, y, pixel);
        } 
    }

    return newImg;
};

// Apply median-luuminance filter with window size winR
Filters.medianFilter = function(image, winR) {
    // note: this function needs to work in a new copy of the image
    //       to avoid overwriting original pixels values needed later
    // create a new image with the same size as the input image
    var h = image.height;
    var w = image.width;
    var newImg = image.createImg(w, h);

    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            // Population window for sorting
            //var pixelWindow = []; 
            var rWindow = [];
            var gWindow = [];
            var bWindow = [];
            // Convolution in 2D window
            for (var j = -winR; (j <= winR) && (j + y < h); j++) {
                if (y + j < 0)
                    continue;
                for (var i = -winR; (i <= winR) && (i + x < w); i++) {
                    if (x + i < 0)
                        continue;

                    var pixel = image.getPixel(x + i, y + j);
                    rWindow.push(pixel.data[0]);
                    gWindow.push(pixel.data[1]);
                    bWindow.push(pixel.data[2]);
                }
            }

            // Sort, recover median, and set
            var medianPixel = image.getPixel(x, y);
            rWindow.sort();
            gWindow.sort();
            bWindow.sort();
            medianPixel.data[0] = rWindow[Math.floor((rWindow.length - 1) / 2)];
            medianPixel.data[1] = gWindow[Math.floor((gWindow.length - 1) / 2)];
            medianPixel.data[2] = bWindow[Math.floor((bWindow.length - 1) / 2)];
            newImg.setPixel(x, y, medianPixel);
        } 
    }

    return newImg;
};

// Apply Bilateral Filter to image
Filters.bilateralFilter = function( image, sigmaR, sigmaS ) {
    // reference: https://en.wikipedia.org/wiki/Bilateral_filter
    // we first compute window size and preprocess sigmaR
    var winR = Math.round((sigmaR + sigmaS) * 1.5);
    sigmaR = sigmaR * (Math.sqrt(2) * winR);

    // The bilateral filter weight function
    var bilatWeight = function(i, j, k, l, thatPix, thisPix) {
        var spatialDist = ((i - k)**2 + (j - l)**2);
        var spatialDistFactor = (spatialDist / (-2.0 * (sigmaS**2)));
        var colorDist = ((thatPix.data[0] - thisPix.data[0])**2
                        + (thatPix.data[1] - thisPix.data[1])**2
                        + (thatPix.data[2] - thisPix.data[2])**2);
        var colorDistFactor = (colorDist / (-2.0 * ((sigmaR/255)**2)));
        return Math.exp(spatialDistFactor + colorDistFactor);
    };

    // note: this function needs to work in a new copy of the image
    //       to avoid overwriting original pixels values needed later
    // create a new image with the same size as the input image
    var h = image.height;
    var w = image.width;
    var newImg = image.createImg(w, h);
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var thisPix = image.getPixel(x, y);
            var weightTotal = 0.0;
            var r = 0;
            var g = 0;
            var b = 0;
            // Applying within our window
            for (var j = -winR; (j <= winR) && (j + y < h); j++) {
                if (y + j < 0)
                    continue;
                for (var i = -winR; (i <= winR) && (i + x < w); i++) {
                    if (x + i < 0)
                        continue;

                    var thatPix = image.getPixel(x + i, y + j);
                    var weight = bilatWeight(x + i, y + j, x, y, thatPix, thisPix);
                    weightTotal += weight;
                    r += thatPix.data[0] * weight;
                    g += thatPix.data[1] * weight;
                    b += thatPix.data[2] * weight;
                }
            }
            
            thisPix.data[0] = r / weightTotal;
            thisPix.data[1] = g / weightTotal;
            thisPix.data[2] = b / weightTotal;
            newImg.setPixel(x, y, thisPix);
        } 
    }

    return newImg;
};

// Quantize the pixel to a 1-bit image
Filters.quantizeFilter = function(image) {
    // convert to grayscale
    image = Filters.grayscaleFilter(image);

    // use center color
    var h = image.height;
    var w = image.width;
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var pixel = image.getPixel(x, y);
            for (var c = 0; c < 3; c++) {
                pixel.data[c] = Math.round(pixel.data[c]);
            }
            pixel.clamp();
            image.setPixel(x, y, pixel);
        }
    }

    return image;
};

// Dither the pixel with random noise before quantization
Filters.randomFilter = function( image ) {
    // convert to grayscale
    image = Filters.grayscaleFilter(image);

    // use center color with random noise
    var h = image.height;
    var w = image.width;
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var pixel = image.getPixel(x, y);
            var rand = Math.random() - 0.5;
            for (var c = 0; c < 3; c++) {
                pixel.data[c] = Math.round(pixel.data[c] + rand);
            }
            pixel.clamp();
            image.setPixel(x, y, pixel);
        }
    }

    return image;
};

// Apply Floyd–Steinberg dithering to the image to quantize
Filters.floydFilter = function( image ) {
    // Reference: https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering
    // convert to grayscale
    image = Filters.grayscaleFilter(image);
    var h = image.height;
    var w = image.width;
    // 1D array for error of previous row
    var errors = new Float64Array(w);
    for (var y = 0; y < h; y++) {
        // image(x + 1, y + 1) error
        var nextRowError = 0;
        for (var x = 0; x < w; x++) {
            // Find new value
            var pixel = image.getPixel(x, y);
            var oldVal = pixel.data[0] + errors[x];
            var newVal = Math.round(oldVal);

            // Handle quantization error
            var quantError = oldVal - newVal;
            if (x > 0)
                errors[x - 1] += quantError * 3.0 / 16.0;
            if (x < w - 1)
                errors[x + 1] += quantError * 7.0 / 16.0;
            errors[x] = quantError * 5.0 / 16.0 + nextRowError;
            nextRowError = quantError * 1.0 / 16.0;

            // Overwrite image with new value
            for (var c = 0; c < 3; c++) {
                pixel.data[c] = newVal;
            }
            pixel.clamp();
            image.setPixel(x, y, pixel);
        }
    }

    return image;
};

// Applies an ordered dither on the image to quantize
Filters.orderedFilter = function( image ) {
    // convert to gray scale
    image = Filters.grayscaleFilter(image);
    var h = image.height;
    var w = image.width;
    // 1D array for pattern
    var pattern = [1, 9, 3, 11, 13, 5, 15, 7, 4, 12, 2, 10, 16, 8, 14, 6];
    // Apply to image
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            // Following precept pseudocode....
            var pixel = image.getPixel(x, y);
            var i = x % 4;
            var j = y % 4;

            // Determine new value
            var quantError = pixel.data[0] - Math.floor(pixel.data[0]);
            var threshold = pattern[4 * i + j] / (4**2 + 1);
            var newVal = 0;
            if (quantError > threshold)
                newVal = Math.ceil(pixel.data[0]);
            else
                newVal = Math.floor(pixel.data[0]);

            // Overwrite image with new value
            for (var c = 0; c < 3; c++) {
                pixel.data[c] = newVal;
            }
            pixel.clamp();
            image.setPixel(x, y, pixel);
        }
    }

    return image;
};

// Scale image to new size proportional to ratio using sampleMode
Filters.scaleFilter = function(image, ratio, sampleMode) {
    // Create new image
    var w = Math.ceil(image.width * ratio);
    var h = Math.ceil(image.height * ratio);
    var newImg = image.createImg(w, h);

    // Scale with resampling
    for (var v = 0; v < h; v++) {
        var y = v / ratio;
        for (var u = 0; u < w; u++) {
            var x = u / ratio;
            newImg.setPixel(u, v, this.samplePixel(image, x, y, sampleMode));
        }
    }

    return newImg;
};

// Translate an image up or down by a number of pixels
Filters.translateFilter = function(image, x, y, sampleMode) {
    var w = image.width;
    var h = image.height;
    var newImg = image.createImg(w, h);

    for (var v = 0; v < h; v++) {
        for (var u = 0; u < w; u++) {
            // If outside, pad with rgba(0, 0, 0, 0)
            if (u - x < 0 || v - y < 0 || u - x >= w || v - y >= h)
                newImg.setPixel(u, v, new Pixel(0, 0, 0, 0));
            else
                newImg.setPixel(u, v, this.samplePixel(image, u - x, v - y, sampleMode));
        }
    }

    return newImg;
};

// Scale an image up or down in resolution by a real valued factor
Filters.rotateFilter = function(image, radians, sampleMode) {
    var w = image.width;
    var h = image.height;
    var xCen = Math.floor(w/2);
    var yCen = Math.floor(h/2);

    // Let's find the new image size
    var xTL = (0 - xCen) * Math.cos(-radians) - (0 - yCen) * Math.sin(-radians);
    var yTL = (0 - xCen) * Math.sin(-radians) + (0 - yCen) * Math.cos(-radians);
    var xTR = (w - 1 - xCen) * Math.cos(-radians) - (0 - yCen) * Math.sin(-radians);
    var yTR = (w - 1 - xCen) * Math.sin(-radians) + (0 - yCen) * Math.cos(-radians);
    var xBL = (0 - xCen) * Math.cos(-radians) - (h - 1 - yCen) * Math.sin(-radians);
    var yBL = (0 - xCen) * Math.sin(-radians) + (h - 1 - yCen) * Math.cos(-radians);
    var xBR = (w - 1 - xCen) * Math.cos(-radians) - (h - 1 - yCen) * Math.sin(-radians);
    var yBR = (w - 1 - xCen) * Math.sin(-radians) + (h - 1 - yCen) * Math.cos(-radians);
    var newWidth = Math.floor(Math.max(Math.abs(xBR - xTL), Math.abs(xTR - xBL))) + 1;
    var newHeight = Math.floor(Math.max(Math.abs(yBR - yTL), Math.abs(yBL - yTR))) + 1;
    var newImg = image.createImg(newWidth, newHeight);
    var newXCen = Math.floor(newWidth/2);
    var newYCen = Math.floor(newHeight/2);

    // Rotate with resampling
    for (var v = 0; v < newHeight; v++) {
        for (var u = 0; u < newWidth; u++) {
            var x = (u - newXCen) * Math.cos(-radians) - (v - newYCen) * Math.sin(-radians) + xCen;
            var y = (u - newXCen) * Math.sin(-radians) + (v - newYCen) * Math.cos(-radians) + yCen;

            if (x < 0 || y < 0 || x >= w || y >= h)
                newImg.setPixel(u, v, new Pixel(0, 0, 0, 0));
            else
                newImg.setPixel(u, v, this.samplePixel(image, x, y, sampleMode));
        }
    }

    return newImg;
};

// Swirls the image about its center
Filters.swirlFilter = function( image, radians, sampleMode ) {
    var w = image.width;
    var h = image.height;
    var xCen = Math.floor(w/2);
    var yCen = Math.floor(h/2);
    var maxR = Math.max(xCen, yCen) + 1;

    // Let's find the new image size
    var newImg = image.createImg(w, h);

    // Swirl with resampling
    for (var v = 0; v < h; v++) {
        for (var u = 0; u < w; u++) {
            var r = euclidDist(u, v, xCen, yCen);
            var theta = radians * (r / maxR) * 2;
            var x = (u - xCen) * Math.cos(theta) - (v - yCen) * Math.sin(theta) + xCen;
            var y = (u - xCen) * Math.sin(theta) + (v - yCen) * Math.cos(theta) + yCen;

            newImg.setPixel(u, v, this.samplePixel(image, x, y, sampleMode));
        }
    }

    return newImg;
};

// Convert foreground to alpha channel for background.
Filters.getAlphaFilter = function( backgroundImg, foregroundImg) {
    for (var i = 0; i < backgroundImg.height; i++) {
        for (var j = 0; j < backgroundImg.width; j++) {
            var pixelBg = backgroundImg.getPixel(j, i);
            var pixelFg = foregroundImg.getPixel(j, i);
            var luminance = 0.2126 * pixelFg.data[0] + 0.7152 * pixelFg.data[1] + 0.0722 * pixelFg.data[2];
            pixelBg.a = luminance;
            backgroundImg.setPixel(j, i, pixelBg);
        }
    }

    return backgroundImg;
};

// Blend the second image with the first image using the alpha channel of the third
Filters.compositeFilter = function(backgroundImg, foregroundImg) {
    var w = backgroundImg.width;
    var h = backgroundImg.height;

    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var forePixel = foregroundImg.getPixel(x, y);
            var backPixel = backgroundImg.getPixel(x, y);
            var alpha = forePixel.a;
            for (var c = 0; c < 3; c++) {
                backPixel.data[c] = alpha*forePixel.data[c]
                                    + (1.0 - alpha)*backPixel.data[c];
            }

            backgroundImg.setPixel(x, y, backPixel);
        }
    }

    return backgroundImg;
};


// Warp between images
Filters.morphFilter = function(initialImg, finalImg, alpha, sampleMode, linesFile) {
    var lines = Parser.parseJson( "images/" + linesFile );
    var w = initialImg.width;
    var h = initialImg.height;

    // TODO: temporarily fixing the swtched x, y coordinates
    for (var i = 0; i < lines.initial.length; i++) {
        [lines.initial[i].x0, lines.initial[i].y0] = [lines.initial[i].y0, lines.initial[i].x0];
        [lines.initial[i].x1, lines.initial[i].y1] = [lines.initial[i].y1, lines.initial[i].x1];
        [lines.final[i].x0, lines.final[i].y0] = [lines.final[i].y0, lines.final[i].x0];
        [lines.final[i].x1, lines.final[i].y1] = [lines.final[i].y1, lines.final[i].x1];
    }
  
    // Line interpolation
    lines.intermed = [];
    for (var i = 0; i < lines.initial.length; i++) {
        var x0val = (1 - alpha) * lines.initial[i].x0 + alpha * lines.final[i].x0;
        var x1val = (1 - alpha) * lines.initial[i].x1 + alpha * lines.final[i].x1;
        var y0val = (1 - alpha) * lines.initial[i].y0 + alpha * lines.final[i].y0;
        var y1val = (1 - alpha) * lines.initial[i].y1 + alpha * lines.final[i].y1;
        lines.intermed.push({x0: x0val, y0: y0val, x1: x1val, y1: y1val});
    }

    var initialWarp = this.warpImage(initialImg, lines.initial,
                                    lines.intermed, sampleMode);
    var finalWarp = this.warpImage(finalImg, lines.final,
                                    lines.intermed, sampleMode);
    // Crossblend
    var result = initialImg.createImg(w, h);
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var initPixel = initialWarp.getPixel(x, y);
            var finPixel = finalWarp.getPixel(x, y);
            for (var c = 0; c < 3; c++) {
                finPixel.data[c] = alpha*finPixel.data[c]
                                    + (1.0 - alpha)*initPixel.data[c];
            } 
            result.setPixel(x, y, finPixel);
        }
    }

    return result;
};


Filters.paletteFilter = function(image, colorNum) {
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 83 lines of code.
  // ----------- STUDENT CODE END ------------
  Gui.alertOnce ('paletteFilter is not implemented yet');
  return image;
};

Filters.paintFilter = function(image, value) {
  // http://mrl.nyu.edu/publications/painterly98/hertzmann-siggraph98.pdf
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 54 lines of code.
  // ----------- STUDENT CODE END ------------
  Gui.alertOnce ('paintFilter is not implemented yet');
  return image;
};

Filters.xDoGFilter = function(image, value) {
  // value could be an array
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 60 lines of code.
  // ----------- STUDENT CODE END ------------
  Gui.alertOnce ('xDoGFilter is not implemented yet');
  return image;
};

Filters.customFilter = function( image, value ) {
  // You can use this filter to do whatever you want, for example
  // trying out some new idea or implementing something for the
  // art contest.
  // Currently the 'value' argument will be 1 or whatever else you set
  // it to in the URL. You could use this value to switch between
  // a bunch of different versions of your code if you want to
  // code up a bunch of different things for the art contest.
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 0 lines of code.
  // ----------- STUDENT CODE END ------------
  Gui.alertOnce ('customFilter is not implemented yet');
  return image;
};
