function haikuGenerator(structure) {

	//This corrects the initial structure to be an array in the event that ini_structure
	//is a string (i.e. when using process.argv to define poem structure). Still requires 
	//numbers to be comma-delimited.
	if (!Array.isArray(structure)) structure = structure.replace(/\b[^0-9]+\b/g,",").split(",").map(function(str) {return Number(str);});

	//Defining "global" variables - book text, dictionary text, etc.
	//These variables are not truly global but are local to the wrapper function, 'haikuGenerator'
	var fs = require('fs'),
		cmuDictFile = fs.readFileSync('./cmudict.txt').toString(),
		library = parseCmuDict(),
		markov_library = markovDict(),
		return_poem = "",
		first_word = "";

	//Creates a dictionary object with values of syllables
	function parseCmuDict() {
		var lines = cmuDictFile.split('\n'),cmuObj = {},lineSplit,
			syll_reg = /\d\b/g;
		lines.forEach(function(line) {
			lineSplit = line.split("  ");
			cmuObj[lineSplit[0]] = countRegExp(lineSplit[1],syll_reg)});
		return cmuObj;
	} 

	function countRegExp(string,pattern) {
		var count = 0;
		while (pattern.exec(string)) {count++};
		return count;
	}

	function markovDict() {
		var book = formatBookFile(), return_obj = {};
		
		for (var i = 0; i < book.length; i++) {
			var current_word = book[i],
			next_word = book[i + 1];

			if (library.hasOwnProperty(current_word)) {
				if (!return_obj.hasOwnProperty(current_word)) return_obj[current_word] = new WordChain();
				if (library.hasOwnProperty(next_word)) {
					if (!return_obj[current_word].hasOwnProperty(next_word)) {
						return_obj[current_word][next_word] = 1;
					} else return_obj[current_word][next_word]++;
				}
			}
		}

		function formatBookFile() {
			var return_array = [],match,word_reg = /([A-Za-z]+)[\.\?\! ]/g;

			function addBook(book_text) {
				while (match = word_reg.exec(book_text)) {
				if(!(/\b[^ai]\b/.test(match[1])))
					return_array.push(match[1].toUpperCase());
				}
			}

			//Markov chain text "predicting" works best with large amounts of language data. As the 
			//number of books increases, the phrases get more realistic. With only 'A Tale of Two Cities'
			//most of the poem was just prepositions. Now, although non-sensical, the poem is closer to actual English
			//speech patterns.

			//NOTE: Copyright Info/'Boilerplate' paragraphs were removed to reduce the amount of non-fiction language.

			//Adds 'Pride and Prejudice' to the book array input for 'markov_library'
			var pride_text = fs.readFileSync('./pg1342.txt').toString();
			addBook(pride_text);
			//Adds 'A Tale of Two Cities' to the book array input for 'markov_library'
			var tale_text = fs.readFileSync('./pg98.txt').toString();
			addBook(tale_text);
			//Adds 'Metamorphosis' to the book array input for 'markov_library'
			var meta_text = fs.readFileSync('./pg5200.txt').toString();
			addBook(meta_text);
			//Adds 'Huckleberry Finn' to the book array input for 'markov_library'
			var huck_text = fs.readFileSync('./pg76.txt').toString();
			addBook(huck_text);
			//Adds 'Dracula' to the book array input for 'markov_library'
			var drac_text = fs.readFileSync('./pg345.txt').toString();
			addBook(drac_text);
			//Adds 'Alice in Wonderlands' to the book array input for 'markov_library'
			var alice_text = fs.readFileSync('./pg11.txt').toString();
			addBook(drac_text);
			//Adds 'Ulysses' to the book array input for 'markov_library'
			var ulysses_text = fs.readFileSync('./pg11.txt').toString();
			addBook(ulysses_text);
			//Adds 'Peter Pan' to the book array input for 'markov_library'
			var peter_text = fs.readFileSync('./pg11.txt').toString();
			addBook(peter_text);
			//Adds 'The Jungle Book' to the book array input for 'markov_library'
			var jungle_text = fs.readFileSync('./pg236.txt').toString();
			addBook(jungle_text);


			return return_array;
		} 

		return return_obj;

	}

	function WordChain() {
		this.cmuLibrary = library;
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

	WordChain.prototype.hasWord = function(syll_count,test_str) {
		for (var elt in this) {
			if (this.hasOwnProperty(elt) && this.cmuLibrary.hasOwnProperty(elt))
				if (this.wordLength(elt) <= syll_count) return true;
		}

		return false;
	}

	WordChain.prototype.wordLength = function(word) {
		return this.cmuLibrary[word];
	}

	function wordGrabber() {
		var keys_array = Object.keys(markov_library);
		return keys_array[Math.floor(Math.random() * keys_array.length)];
	}

	function markovLineMaker(line_length,first_word) {
		var	current_word = first_word,temp_word,word_length = library[first_word],
			return_string = "";

		while (line_length > 0) {

			if (markov_library[current_word].hasWord(line_length,return_string)) {

				var markov_state = false;
				while (markov_state == false) {

					temp_word = markov_library[current_word].selectRND();
					word_length = markov_library[current_word].wordLength(temp_word);
					if (line_length - word_length < 0 || (new RegExp(temp_word).test(return_string))) continue;
					current_word = temp_word;
					markov_state = true;
				}

				return_string += current_word + " ";
				line_length -= word_length;

			} else current_word = wordGrabber();

		}

		first_word = return_string.slice(0,-1).search(/\b[\W]+$/);
		return return_string.slice(0,-1);
	}  

	function createHaiku(structure) {
	
		for (var i = 0; i < structure.length; i++) {
	
			return_poem += markovLineMaker(structure[i],
				first_word === "" ? wordGrabber() : first_word) + '\n\n';
		}

		return return_poem.slice(0,-2);
	} 

	return createHaiku(structure);

}

module.exports = {
	haikuGenerator: haikuGenerator
}