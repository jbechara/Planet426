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
        args: undefined,
      };
      cmd.args = parts[1].split(';').map(function(str) {
        var num = parseFloat(str);
        if (!isNaN(num) && num == str) {
          return num;
        }
        else {
          if (str === "true") {
            return true;
          }
          else if (str === "false") {
            return false;
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
              var isAnimated = str.match(/\(\d+\.?\d*,\s*\d+\.?\d*,\s*\d+\.?\d*\)/);
              if (isAnimated) {
                var animatedVals = str.match(/\d+\.?\d*/g);
                return {
                  isAnimated: true,
                  start: animatedVals[0],
                  end: animatedVals[1],
                  step: animatedVals[2],
                };
              } 

            }
          }
        }

        return str;

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


// OLD SPRING 2015 VERSION


// // this file allows us to use commands in the url for batch processing
// // this is some crazy magic. don't read too closely.

// var Parser = Parser || {};

// // gets commands from URL and separates into an array of objects
// Parser.getCommands = function( url ) {
//     // eliminate anything in string up through '?'
//     var pos = url.lastIndexOf("?");
//     url = url.substr(pos + 1);
    
//     // split the URL by the word 'apply'
//     url = url.replace(/apply/g, '|');
//     var applies = url.split('|');
//     var paramsArray = [];
    
//     for ( var i = 0; i < applies.length; i++ ) {
//         var params = {};
//         var commands = applies[i].split('&');
//         for ( var j = 0; j < commands.length; j++ ) {
//             var command = commands[j];
//             var parts = command.split("=");

//             if (command.length == 0) {
//                 continue;
//             }
//             else if (parts.length == 1) {
//                 params[ parts[0] ] = true;
//             } else {
//                 params[ parts[0] ] = parts[1];
//             }
//         }
//         paramsArray.push( params );
//     }
//     return paramsArray;
// };

// // turns the commands from strings into objects
// Parser.parseCommands = function(applies) {
//     var result = [];
//     for ( var i = 0; i < applies.length; i++ ) {
//         var commands = applies[i];
//         var apply = {};
//         // update values from url using parser
//         for ( var cmd in commands ) {
//             var v = unescape( commands[cmd] ).replace( '+', ' ' );
//             if ( !isNaN( parseFloat(v) ) ) {
//                 v = parseFloat(v);
//             } else if ( v == 'true' ) {
//                 v = true;
//             } else if ( v == 'false' ) {
//                 v = false;
//             }
//             apply[cmd] = v;
//         }
//         result.push(apply);
//     }
//     return result;
// };

// Parser.parseNumbers = function( str ) {
//     var numbers = [];
//     str.split(",").forEach(function(interval) {
//         var parts = interval.split("-");
//         if (parts.length == 1) {
//             numbers.push(parseInt(parts[0]));
//         } else {
//             var start = parseInt(parts[0]);
//             var end   = parseInt(parts[1]);
//             $.merge(numbers, Parser.range(start, end + 1));
//         }
//     } );
//     return numbers;
// };

// Parser.parseJson = function( jsonFile ) {
//     var request = new XMLHttpRequest();
//     request.open("GET", jsonFile, false);
//     request.overrideMimeType("application/json");
//     request.send(null);
//     var obj = JSON.parse( request.responseText );
//     return obj;
// };

