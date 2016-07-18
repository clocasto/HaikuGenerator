var fs = require('fs');
var cmuDictFile = readDataFile('./cmudict.txt');

function readDataFile(file) {
	return fs.readFileSync(file).toString();
}


//Creates a dictionary object - not sure if actually useful
/*function formatFileData(data) {
	var lines = data.toString().split('\n'),cmuObj = {},lineSplit,
		syll_reg = /\d\b/g;
	lines.forEach(function(line) {
		lineSplit = line.split("  ");
		this[lineSplit[0]] = [lineSplit[1],countRegExp(lineSplit[1],syll_reg)];},cmuObj);
	console.log(cmuObj)
}  */

function formatFileData(data) {
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

function wordGrabber(length,library) {
	var random_word_index = Math.floor(Math.random() * library[length].length);
	var random_word = library[length][random_word_index];
	return countRegExp(random_word,/(\d)\b/g) > 0 ? random_word.slice(0,-3) : random_word;
}

function createHaiku(structure) {
	var return_poem = "",
		formatted_cmu_data = formatFileData(cmuDictFile),
		poem_structure = structureModifier(structure,formatted_cmu_data);

	for (var i = 0; i < poem_structure.length; i++) {
		if (Array.isArray(poem_structure[i])) {
			var poem_line = "";
			for (var j = 0; j < poem_structure[i].length; j++) {
				poem_line += wordGrabber(poem_structure[i][j],formatted_cmu_data) + " ";
			}
			return_poem += poem_line.slice(0,-1);
		} else return_poem += wordGrabber(poem_structure[i][j],formatted_cmu_data);
		
		return_poem += '\n\n';
	}

	return return_poem.slice(0,-1);
}

module.exports = {
	createHaiku: createHaiku
}