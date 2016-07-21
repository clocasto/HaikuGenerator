var haiku = require('./haiku');

//User can specify poem structure as a second argument in any punctuation-delimited manner. Spaces/new lines will not work.
var poem_style = process.argv[2] == undefined ? [5,7,5] : process.argv[2];

//The time it takes to write the poem will be recorded. Given how much data is processed, it is important to be aware of.
var time_zero = Date.now();
console.log('\n' + haiku.haikuGenerator(poem_style));
console.log("\nThis poem took me " + (Date.now() - time_zero) + "ms to write.\n")


//NOTE: This program has a bug in it which remains unsolved. Once every ~25 poems 'markovLineMaker()' will try to access a word in the 'markov_library'
//		which does not exist. Given that no words are entered into the 'markov_library' unless they are in the CMU dictionary, have at 
//		least one valid 'next_word', and the program never asks for a word which isn't a property of the 'markov_library',
//		I haven't be able to find it or reproduce it.