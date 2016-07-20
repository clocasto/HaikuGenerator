var fs = require('fs');
var cmuDictFile = readDataFile('./cmudict.txt');
var feed_material = fs.readFileSync('./pg98.txt').toString();
//var chains = require('./word_chains');

function readDataFile(file) {
	return fs.readFileSync(file).toString();
}

//Creates a dictionary object with values of syllables
function parseCMUData() {
	var data = cmuDictFile;
	var cmuObj = {};
	var lines = data.toString().split('\n'),cmuObj = {},lineSplit,
		syll_reg = /\d\b/g;
	lines.forEach(function(line) {
		lineSplit = line.split("  ");
		cmuObj[lineSplit[0]] = countRegExp(lineSplit[1],syll_reg)});
	return cmuObj;
}

//Creates a syllable-indexed 2nd order array of dictionary words
function formatCMUData(data) {
	var lines = data.toString().split('\n'),return_array = [],lineSplit,
		syll_reg = /\d\b/g;
	lines.forEach(function(line) {
		lineSplit = line.split("  ");
		var syllables_in_word = countRegExp(lineSplit[1],syll_reg);
		if (this[syllables_in_word] == undefined) {
			this[syllables_in_word] = [lineSplit[0]];
		} else this[syllables_in_word].push(lineSplit[0]);
	},return_array);
	return return_array;
}

function countRegExp(string,pattern) {
	var count = 0;
	while (pattern.exec(string)) {count++};
	return count;
}

function structureModifier(ini_structure,library) {
	
	//This corrects the initial structure to be an array in the event that ini_structure
	//is a string (i.e. when using process.argv to define poem structure). Still requires 
	//numbers to be comma-delimited.
	if (!Array.isArray(ini_structure)) ini_structure = ini_structure.replace(/[^0-9,]/g,"")
		.split(",").map(function(str) {return Number(str);});

	//This determines an array of allowed word choices. Without this, 'structureModifier' will ask for
	//words with syllable counts that do not exist when 'ini_structure[i' is large
	var length_choices = {};
	library.forEach(function (syll,idx) {
		if (typeof syll != undefined) length_choices[idx] = true;
	});
	
	var return_array = [];
	for (var i = 0; i < ini_structure.length; i++) {
		var index_array = [], length_at_index = Number(ini_structure[i]);
		while (length_at_index > 0) {
			var word_length = Math.floor(Math.random() * length_at_index) + 1;
			if(length_choices.hasOwnProperty(word_length)) index_array.push(word_length),
				length_at_index -= word_length;
		}

		return_array.push(index_array);
	}
	return return_array;
}

/*function wordGrabber(length,dictionary,library) {
	var random_word_index = Math.floor(Math.random() * dictionary[length].length);
	var random_word = dictionary[length][random_word_index];
	return countRegExp(random_word,/(\d)\b/g) > 0 ? random_word.slice(0,-3) : random_word;
}*/

function wordGrabber(obj) {
	var keys_array = Object.keys(obj);
	return keys_array[Math.floor(Math.random() * keys_array.length)];
}

	

//WordChain.prototype.syllCount = function(element) {
//	this[element];
//}

				function formatBookFile(data) {
					var return_array = [],match,word_reg = /([A-Za-z]+)[\.\?\! ]/g;
					while (match = word_reg.exec(data)) {
						return_array.push(match[1].toUpperCase());
					}
					return return_array;
				}

				function parseBookFile(txt_data) {
					var dictionary = parseCMUData();
					var book = formatBookFile(txt_data), return_obj = {};

					for (var i = 0; i < book.length; i++) {
						var current_word = book[i],
							next_word = book[i + 1];

							if (dictionary.hasOwnProperty(current_word)) {
								if (!return_obj.hasOwnProperty(current_word)) return_obj[current_word] = new WordChain(dictionary);
								if (dictionary.hasOwnProperty(next_word)) {
									if (!return_obj[current_word].hasOwnProperty(next_word)) {
										return_obj[current_word][next_word] = 1;
									} else return_obj[current_word][next_word]++;
								}
							}
					}
					
					return return_obj;

				}

				function WordChain(library) {
					this.cmuDictionary = library;
				}

				WordChain.prototype.selectRND = function() {
					var chain_array = [];
					for (var elt in this) {
						if (this.hasOwnProperty(elt)) {
							for (var i = 0; i < this[elt]; i++) {
								chain_array.push(elt);
							}
						}
					}

					return chain_array[Math.floor(Math.random() * chain_array.length)];
				}

				WordChain.prototype.hasWord = function(syll_count,test_word,test_str) {
					for (var elt in this) {
						if (this.hasOwnProperty(elt) && this.cmuDictionary.hasOwnProperty(elt) && !(new RegExp(test_word).test(test_str)))
							if (this.cmuDictionary[elt] <= syll_count) return true;
					}

					return false;
				}

				WordChain.prototype.wordLength = function(word) {
					return this.cmuDictionary[word];
				}

				WordChain.prototype.listChildren = function() {
					var return_array = [];
					for (var elt in this) {
						if (this.hasOwnProperty(elt)) return_array.push(elt);
					}

					return return_array;
				}
				function markovDict() {
					return parseBookFile(feed_material);
				}

function markovLineMaker(line_length) {
	var markov_library = markovDict(),
		library = parseCMUData(),
		current_word,
		temp_word,
		word_length,
		return_string = "", i = 0;

	while (line_length > 0) {

		if (current_word == undefined) {
			current_word = wordGrabber(markov_library);
			word_length = library[current_word];
		} else if (markov_library[current_word].hasWord(line_length,current_word,return_string)) {

			var markov_state = false;
			while (markov_state == false) {
				temp_word = markov_library[current_word].selectRND();
				word_length = markov_library[current_word].wordLength(temp_word);
				
				if (line_length - word_length < 0 || new RegExp(current_word).test(return_string)) continue;
				current_word = temp_word;
				markov_state = true;
			}

			return_string += current_word + " ";
			line_length -= word_length;

		} else current_word = wordGrabber(markov_library);

		//console.log("Return_string: " + return_string + "; line_length: " + line_length);

	}

		//console.log("\n\ncurrent_word: ",current_word);
		//console.log("dictionary[word].has(): ",library.hasOwnProperty(current_word));
		//console.log("markov_library[word].inDictionary: ",markov_library[current_word].inLibrary(library));
		/*current_word = markov_library[current_word].selectRND();
		word_length = library[current_word]; */
		//console.log(library[current_word]);
		//console.log(markov_library);
		//console.log("current_word: ",current_word);
		//console.log("markov_library: ",markov_library[current_word]);

		/*try {
			current_word = markov_library[current_word].selectRND();
		} catch(error) {
			console.log("\nERROR: CHILD NOT IN MARKOV LIBRARY\n")
		} finally {
			return return_string.slice(0,-4);
		} 

		if (!markov_library[current_word].inLibrary(library)) {	
			current_word = wordGrabber(word_length,dictionary,library);
			continue;
		} else {

			return_string += current_word + " -> ";
			line_length -= library[current_word];
			current_word = markov_library[current_word] && markov_library[current_word].selectRND();
		} */

	return return_string.slice(0,-1);
}  

function createHaiku(structure) {
	var return_poem = "";
		//formatted_cmu_data = formatCMUData(cmuDictFile),
		//poem_structure = structureModifier(structure,formatted_cmu_data);

	for (var i = 0; i < structure.length; i++) {

		/*
		if (Array.isArray(poem_structure[i])) {
			var poem_line = "";
			for (var j = 0; j < poem_structure[i].length; j++) {
				poem_line += wordGrabber(poem_structure[i][j],formatted_cmu_data) + " ";
			}
			return_poem += poem_line.slice(0,-1);
		} else return_poem += wordGrabber(poem_structure[i][j],formatted_cmu_data); */
		
		return_poem += markovLineMaker(structure[i]) + '\n\n';
	}

	return return_poem.slice(0,-2);
}

module.exports = {
	createHaiku: createHaiku,
	parseCMUData: parseCMUData
}