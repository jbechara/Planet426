// Perlin Noise Generator
var PerlinGenerator = function(quality, steps, factor, scale) {
	// Parameters
	this.perlin = new ImprovedNoise();
	this.quality = quality;
	this.steps = steps;
	this.factor = factor;
	this.scale = scale;

	// Generate Displacement
	this.generate = function (x, y, z) {
		var q = 1, d = 0;
    	for (var i = steps; i > 0; i--, q *= quality)
            d += Math.abs(perlin.noise(x/q, y/q, z/q)*q*factor);
		return Math.pow(d, scale);
	}
}
