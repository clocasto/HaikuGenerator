var haiku = require('./haiku');

var poem_style = process.argv[2] == undefined ? [5,7,5] : process.argv[2];

var time_zero = Date.now();
console.log('\n' + haiku.createHaiku(poem_style));
console.log("This poem took me " + (Date.now() - time_zero) + "ms to write.\n")
