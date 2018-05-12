// Perlin Noise Generator
var PerlinGenerator = function(quality, steps, factor) {

	// Parameters
	this.perlin = new ImprovedNoise();
	this.quality = quality;
	this.steps = steps;
	this.factor = factor;

	// Generate Displacement
	this.generate = function (x, y, z) {
		var q = 1, d = 0;
    	for (var i = 0; i < steps; i++, q *= quality)
            d += Math.abs(perlin.noise(x/q, y/q, z/q)*q*factor);
        return d;
	}

}