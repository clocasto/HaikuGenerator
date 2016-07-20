var haiku = require('./haiku');


//User can specify poem structure as a second argument in any punctuation-delimited manner. Spaces/new lines will not work.
var poem_style = process.argv[2] == undefined ? [5,7,5] : process.argv[2];

var time_zero = Date.now();
console.log('\n' + haiku.haikuGenerator(poem_style));
console.log("\nThis poem took me " + (Date.now() - time_zero) + "ms to write.\n")
