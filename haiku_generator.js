var haiku = require('./haiku');

var poem_style = process.argv[2];

var time_zero = Date.now();
console.log('\n' + haiku.createHaiku(poem_style));
console.log("This poem took " + (Date.now() - time_zero) + " ms to write.\n")
