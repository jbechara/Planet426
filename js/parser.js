// parses commands in the url and makes them available

var Parser = Parser || {};

// format: [ {name: name, args: [argVals]} ]
Parser.parseCommands = function() {
  var url = document.URL;
  url = url.replace(/_/g, " ");
  // trim off everything before "?"
  var pos = url.lastIndexOf('?');
  if (pos === -1) { // no commands found
    return [];
  }
  url = url.substr(pos + 1);

  url = decodeURI(url);

  var cmds = [];
  url.split('&').forEach(function(item) {
    var parts = item.split('=');
    if (parts.length == 1) { // boolean filter
      cmds.push({
        name: parts[0],
        args: {enabled: true},
      });
    }
    else {  // args list
      var cmd = {
        name: parts[0],
        args: parts[1].split(';'),
      };
      cmd.args = cmd.args.map(function(str) {
        var num = parseFloat(str);
        if (!isNaN(num)) {
          return num;
        }
        else {
          var isPixel = str.match(/\[\d+\.?\d*,\s*\d+\.?\d*,\s*\d+\.?\d*,\s*\d+\.?\d*\]/);
          if (isPixel) {
            var pixelComponents = str.match(/\d+\.?\d*/g);
            // HACK: replicate gui input by giving components in range [0, 255]
            pixelComponents = pixelComponents.map(function(comp) { return comp * 255; });
            return pixelComponents;
          }
          else {
            // regex for (start,end,step), where each value is a float, with optional whitespace between values
            var isAnimated = str.match(/\(\s*-?\d+\.?\d*\s*,\s*-?\d+\.?\d*\s*,\s*-?\d+\.?\d*\s*\)/);
            if (isAnimated) {
              var animatedVals = str.match(/-?\d+\.?\d*/g);
              return {
                isAnimated: true,
                start: parseFloat(animatedVals[0]),
                end: parseFloat(animatedVals[1]),
                step: parseFloat(animatedVals[2]),
              };
            }

            return str;
          }
        }
      });
      cmds.push(cmd);
    }
  });
  return cmds;
};

Parser.commands = Parser.parseCommands();

Parser.parseNumbers = function( str ) {
  var numbers = [];
  str.split(',').forEach(function(interval) {
    var parts = interval.split('-');
    if (parts.length == 1) {
      numbers.push(parseInt(parts[0]));
    } else {
      var start = parseInt(parts[0]);
      var end   = parseInt(parts[1]);
      $.merge(numbers, Parser.range(start, end + 1));
    }
  });
  return numbers;
}

Parser.parseJson = function( jsonFile ) {
  var request = new XMLHttpRequest();
  request.open("GET", jsonFile, false);
  request.overrideMimeType("application/json");
  request.send(null);
  var obj = JSON.parse( request.responseText );
  return obj;
}
