// Perlin Noise Generator
var PerlinGenerator = function(quality, steps, factor, amplitude) {

	// Parameters
	this.amplitude = amplitude;
	this.r = Math.random()*this.amplitude;
	this.perlin = new ImprovedNoise();
	this.quality = quality;
	this.steps = steps;
	this.factor = factor;

	// Generate Displacement
	function generate(x, y) {
		var q = 1, d = 0;
    	for (var i = 0; i < steps; i++, q *= quality)
            d += Math.abs(perlin.noise(x/q, y/q, z)*q*factor);
        return d;
	}

	// Regenerate the seed
	function regenerate() {
		this.r = Math.random()*this.amplitude;
	}

}