// Perlin Noise Generator
var PerlinGenerator = function(time) {
	// Parameters
	this.perlin = new ImprovedNoise();
	this.pto1 = 2/Math.sqrt(3);
	this.time = Math.sqrt(time);

	// Generate displacement
	// (if normalize is true then return perlin
	// noise normalized to [0,1])
	this.generate = function (x, y, z, normalize) {
		if (normalize === undefined || !normalize)
			return perlin.noise(x, y, z);
		else return this.pto1*perlin.noise(x, y, z)/2+1;
	}
}

// Modified Perlin Noise Generator
var ModPerlinGenerator = function(quality, steps, factor, scale) {
	// Parameters
	this.perlin = new ImprovedNoise();
	this.quality = quality;
	this.steps = steps;
	this.factor = factor;
	this.scale = scale;

	// Generate displacement
	this.generate = function (x, y, z, normalize) {
		var q = 1, d = 0;
    	for (var i = steps; i > 0; i--, q *= quality)
            d += Math.abs(perlin.noise(x/q + noiseTime, y/q,
				z/q)*q*factor);
		return Math.pow(d, scale);
	}
}
