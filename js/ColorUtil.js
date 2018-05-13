// Color Utilities
var ColorUtil = function() {
    // Parameters
    this.spline = undefined;

    // Linearly interpolate two colors
    this.lerpColors = function (c1, c2, alpha) {
        return new THREE.Color(c1.r*(1-alpha)+c2.r*alpha,
                               c1.g*(1-alpha)+c2.g*alpha,
                               c1.b*(1-alpha)+c2.b*alpha);
    }

    // Create spline using a Color array
    this.createSpline = function (colors) {
        verts = [];
        for (var i = colors.length - 1; i >= 0; i--)
            verts[i] = new THREE.Vector3(colors[i].r, colors[i].g, colors[i].b);
        this.spline = new THREE.CatmullRomCurve3(verts);
    }

    // Spline interpolate using previously created spline
    this.serpColors = function (alpha) {
        if (this.spline === undefined) return undefined;
        var point = this.spline.getPoint(alpha);
        return new THREE.Color(point.x, point.y, point.z);
    }

    // Linearly interpolate two colors with NoiseGenerator
    this.lerpNoiseColors = function (c1, c2, point, noiseGen) {
        return this.lerpColors(c1, c2,
            noiseGen.generate(point.x, point.y, point.z, true));
    }

    // Spline interpolate using previously created spline with NoiseGenerator
    this.serpNoiseColors = function (point, noiseGen) {
        if (this.spline === undefined) return undefined;
        return this.serpColors(noiseGen.generate(point.x, point.y, point.z, true));
    }

    // Linearly interpolate two colors with turbulence using NoiseGenerator
    this.turbulence = function (c1, c2, point, noiseGen) {
        return this.lerpColors(c1, c2,
            Math.abs(noiseGen.generate(point.x, point.y, point.z, false)));
    }

    // Linearly interpolate two colors with perturbation using NoiseGenerator
    this.perturb = function (c1, c2, point, noiseGen) {
        var p = point.clone()
        .addScalar(noiseGen.generate(point.x, point.y, point.z, true)).normalize();
        return new THREE.Color(c1.r*(1-p.x)+c2.r*p.x,
                               c1.g*(1-p.y)+c2.g*p.y,
                               c1.b*(1-p.z)+c2.b*p.z);
    }
}
