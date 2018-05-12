//////////////////////////////////////////////////////////
// PIXEL
//////////////////////////////////////////////////////////

// color space: lower case string omitting alpha, eg "rgb", "hsl", "xyz"
// can also use Pixel(color), where color is a hex string, or "rgba(r,g,b,a)" eg Pixel("#ff0000")
function Pixel( comp0, comp1, comp2, a, colorSpace ) {
  if (typeof comp0 === "string") {
    this.colorSpace = "rgb";

    if (comp0.match(/rgb/g)) {
      // rgba string
      this.data = comp0.match(/-?\d+\.?\d*/g);
      for (var i = 0; i <= 2; i++) {
        this.data[i] = parseFloat(this.data[i] / 255);
      }
      this.a = (this.data[3] && parseFloat(this.data[3]) / 255) || 1;
      this.data[3] = undefined;
    }
    else {
      // hex string
      var bigint = parseInt( comp0.substring(1), 16 );
      this.data = [
        (( bigint >> 16 ) & 255) / 255,
        (( bigint >> 8  ) & 255) / 255,
        (( bigint       ) & 255) / 255,
      ];
      this.a = 1;
    }
  }
  else {
    if (a === undefined) {
      a = 1;
    }
    this.data = [
      comp0,
      comp1,
      comp2,
    ];
    this.a = a;
    this.colorSpace = colorSpace || "rgb";
  }
}

// make sure pixel values are between 0 and 255
Pixel.prototype.clamp = function() {
  this.data[0] = Math.min( 1, Math.max( this.data[0],  0 ) );
  this.data[1] = Math.min( 1, Math.max( this.data[1],  0 ) );
  this.data[2] = Math.min( 1, Math.max( this.data[2],  0 ) );
  this.a = Math.min( 1, Math.max( this.a,  0 ) );
};

Pixel.prototype.rgbToHsl = function() {
  assert(this.colorSpace === "rgb", "input pixel color space must be rgb");

  var r = this.data[0],
      g = this.data[1],
      b = this.data[2];
  var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if ( max == min ) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch( max ) {
       case r: h = (g - b) / d + (g < b ? 6 : 0); break;
       case g: h = (b - r) / d + 2; break;
       case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return new Pixel(h, s, l, this.a, "hsl");
};

Pixel.prototype.hslToRgb = function() {
  assert(this.colorSpace === "hsl", "input pixel color space must be hsl");

  var h = this.data[0];
  var s = this.data[1];
  var l = this.data[2];

  var m1, m2;
  m2 = (l <= 0.5) ? l * (s + 1) : l + s - l * s;
  m1 = l * 2 - m2;
  var hueToRGB = function( m1, m2, h ) {
    h = ( h < 0 ) ? h + 1 : ((h > 1) ? h - 1 : h);
    if ( h * 6 < 1 ) return m1 + (m2 - m1) * h * 6;
    if ( h * 2 < 1 ) return m2;
    if ( h * 3 < 2 ) return m1 + (m2 - m1) * (0.66666 - h) * 6;
    return m1;
  };

  return new Pixel(
    hueToRGB( m1, m2, h + 1 / 3 ),
    hueToRGB( m1, m2, h         ),
    hueToRGB( m1, m2, h - 1 / 3 ),
    this.a,
    "rgb"
  );
};

Pixel.prototype.rgbToXyz = function() {
  assert(this.colorSpace === "rgb", "input pixel color space must be rgb");

  var p = this;

  var x = 0.4124*p.data[0]+0.3576*p.data[1]+0.1805*p.data[2],
      y = 0.2126*p.data[0]+0.7152*p.data[1]+0.0722*p.data[2],
      z = 0.0193*p.data[0]+0.1192*p.data[1]+0.9502*p.data[2];

  return new Pixel(x, y, z, this.a, "xyz");
};


Pixel.prototype.xyzToRgb = function() {
  assert(this.colorSpace === "xyz", "input pixel color space must be xyz");

  var x = this.data[0];
  var y = this.data[1];
  var z = this.data[2];

  return new Pixel(
    3.240479*x -1.537150*y - 0.498535 * z,
    -0.969256*x+1.875992*y + 0.041556 * z,
    0.055648*x -0.204043*y + 1.057311 * z,
    this.a,
    "rgb"
  )
};


Pixel.prototype.xyzToLms = function() {
  assert(this.colorSpace === "xyz", "input pixel color space must be xyz");

  var x = this.data[0];
  var y = this.data[1];
  var z = this.data[2];

  var l = 0.40024*x + 0.7076*y - 0.08081*z,
      m = -0.2263*x + 1.16532*y + 0.0457*z,
      s = 0.91822*z;

  return new Pixel(l, m, s, this.a, "lms");
};

Pixel.prototype.lmsToXyz = function() {
  assert(this.colorSpace === "lms", "input pixel color space must be lms");

  var l = this.data[0];
  var m = this.data[1];
  var s = this.data[2];

  x =  1.8599364*l - 1.1293816*m +0.2198974*s;
  y = 0.3611914*l + 0.6388125*m- 0.0000064*s;
  z = 1.0890636*s;

  return new Pixel(x, y, z, this.a, "xyz");
};

// adds argument color to this pixel and returns sum in a new pixel
Pixel.prototype.plus = function( p ) {
  var q = new Pixel( 0, 0, 0 );
  q.data[0] = this.data[0] + p.data[0];
  q.data[1] = this.data[1] + p.data[1];
  q.data[2] = this.data[2] + p.data[2];
  q.a = this.a;
  return q;
};

// subtract argument color to this pixel
// returns a new pixel, doesn't affect original
Pixel.prototype.minus = function( p ) {
  var q = new Pixel( 0, 0, 0 );
  q.data[0] = this.data[0] - p.data[0];
  q.data[1] = this.data[1] - p.data[1];
  q.data[2] = this.data[2] - p.data[2];
  q.a = this.a;
  return q;
};

// returns a new pixel, doesn't affect original
Pixel.prototype.multipliedBy = function( m ) {
  var q = new Pixel( 0, 0, 0 );
  q.data[0] = this.data[0] * m;
  q.data[1] = this.data[1] * m;
  q.data[2] = this.data[2] * m;
  q.a = this.a;
  return q;
};

// returns a new pixel, doesn't affect original
Pixel.prototype.dividedBy = function( m ) {
  var q = new Pixel( 0, 0, 0 );
  q.data[0] = this.data[0] / m;
  q.data[1] = this.data[1] / m;
  q.data[2] = this.data[2] / m;
  q.a = this.a;
  return q;
};


//////////////////////////////////////////////////////////
// IMAGE
//////////////////////////////////////////////////////////

function Image( width, height, data, fileName ) {
  this.width    = width;
  this.height   = height;
  this.data     = data || this.createData(width, height);
  this.fileName = fileName;
}

Image.prototype.fill = function( pixel ) {
  for (var x = 0; x < this.width; x++) {
    for (var y = 0; y < this.height; y++) {
      this.setPixel(x, y, pixel);
    }
  }
}

Image.prototype.createData = function( width, height ) {
  return new Uint8ClampedArray( width * height * 4 );
};

Image.prototype.createImg = function( width, height ) {
  var data = this.createData( width, height );
  // initial value of image is white and fully opaque
  for( var i = 0; i < data.length; i++ ) {
    data[i] = 255;
  }
  return new Image( width, height, data );
};

Image.prototype.copyImg = function() {
  var data = this.createData( this.width, this.height );

  for( var i = 0; i < data.length; i++ ) {
    data[i] = this.data[i];
  }
  return new Image( this.width, this.height, data, this.fileName );
};

Image.prototype.getImageData = function() {
  // this function should be this one-liner, but it only works in firefox and safari:
  // return new ImageData( this.data, this.width, this.height );

  // instead here is an ugly way to convert our data to ImageData object
  // this is a workaround because Chrome does not yet implement the constructor above
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  ctx.clearRect( 0, 0, canvas.width, canvas.height );
  var imageData = ctx.createImageData( this.width, this.height );
  imageData.data.set( this.data );
  return imageData;
};

// says how to index into the pixel data of the image to get to pixel (x, y)
Image.prototype.pixelIndex = function( x, y ) {
  // if these are non-integers, indexing gets messed up
  y = Math.round(y);
  x = Math.round(x);
  return 4 * ( y * this.width + x );
};

Image.prototype.getPixel = function( x, y ) {
  if (y < 0 || y >= this.height || x < 0 || x >= this.width) {
    return new Pixel(0, 0, 0, 0);
  }

  var index = this.pixelIndex( x, y );
  var pixel = new Pixel(
    this.data[index] / 255,
    this.data[index+1] / 255,
    this.data[index+2] / 255,
    this.data[index+3] / 255);
  return pixel;
};

// NOTE: pixel must be in rgb colorspace
// TODO: assert here?
Image.prototype.setPixel = function( x, y, pixel ) {
  if (y >= 0 && x >= 0 && y < this.height && x < this.width) {
    var index = this.pixelIndex( x, y );
    this.data[index]   = pixel.data[0] * 255;
    this.data[index+1] = pixel.data[1] * 255;
    this.data[index+2] = pixel.data[2] * 255;
    this.data[index+3] = pixel.a * 255;
  }
};
