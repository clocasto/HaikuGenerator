//This wrapper function allows the program to store "global" variables. 'haikuGenerator' is accessible as an export.
function haikuGenerator(structure) {

	//This corrects the initial structure to be an array in the event that ini_structure
	//is a string (i.e. when using process.argv to define poem structure). Still requires 
	//numbers to be comma-delimited.
	if (!Array.isArray(structure)) structure = structure.replace(/\b[^0-9]+\b/g,",")
		.split(",").map(function(str) {return Number(str);});

	//Defining "global" variables - book text, dictionary text, etc.
	//These variables are not truly global but are local to the wrapper function, 'haikuGenerator'
	var fs = require('fs'),
		cmuDictFile = fs.readFileSync('./cmudict.txt').toString(),
		library = parseCmuDict(),
		markov_library = markovDict(),
		poem_line = "";
		return_poem = "",
		first_word = wordGrabber(),
		common_words = "the he she it him her mr ms of and the in from to up down when".toUpperCase();

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


	//This function creates the 'markov_library' object. It takes an array of all the words in 'book'
	//(which is generated from the novels) and adds each word to the 'markov_library' if it is also in the 
	//CMU Dictionary: 'library'. Furthermore, if the 'next_word' (the word following the 'current_word') is in
	//the 'library' object, it gets added into the object value of the 'current_word' property of 'markov_library'.

	//The structure of 'markov_library' is an object with a property for each word which appears in both the novels and the 
	//CMU dictionary. The values are 'WordChain()' objects which contain properties of words ('next_word') which appear 
	//after the 'markov_library' property words ('current_word'). The values for the 'next_word' properties are the number of times
	//'next_word' appears after 'current_word'.
	function markovDict() {
		var book = formatBookFile(), return_obj = {};
		
		for (var i = 0; i < book.length; i++) {
			var current_word = book[i],
			next_word = book[i + 1];

			if (library.hasOwnProperty(current_word) && library.hasOwnProperty(next_word)) {
				if (!return_obj.hasOwnProperty(current_word)) return_obj[current_word] = new WordChain();
				if (!return_obj[current_word].hasOwnProperty(next_word)) {
					return_obj[current_word][next_word] = 1;
				} else return_obj[current_word][next_word]++;
			}
		}

		function formatBookFile() {
			var return_array = [],match,word_reg = /\b([\w]+)\b/g;

			function addBook(book_text) {
				while (match = word_reg.exec(book_text)) {
				if(!(/\b[^sai]\b/.test(match[1])))
					return_array.push(match[1].toUpperCase());
				}
			}

			//Markov chain text "predicting" works best with large amounts of language data. As the 
			//number of books increases, the phrases should get more realistic. With only 'A Tale of Two Cities'
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
			//Adds 'Dracula' to the book array input for 'markov_library'
			var drac_text = fs.readFileSync('./pg345.txt').toString();
			addBook(drac_text);
			//Adds 'Alice in Wonderland' to the book array input for 'markov_library'
			var alice_text = fs.readFileSync('./pg11.txt').toString();
			addBook(alice_text);
			//Adds 'Peter Pan' to the book array input for 'markov_library'
			var peter_text = fs.readFileSync('./pg16.txt').toString();
			addBook(peter_text); 
			//Adds 'The Jungle Book' to the book array input for 'markov_library'
			var jungle_text = fs.readFileSync('./pg236.txt').toString();
			addBook(jungle_text);
			//Adds 'The Picture of Dorian Gray' to the book array input for 'markov_library'
			var dorian_text = fs.readFileSync('./pg174.txt').toString();
			addBook(dorian_text);
			//Adds 'Moby Dick' to the book array input for 'markov_library'
			var moby_text = fs.readFileSync('./pg2701.txt').toString();
			addBook(moby_text);
			//Adds 'Sherlock Holmes' to the book array input for 'markov_library'
			var sherlock_text = fs.readFileSync('./pg1661.txt').toString();
			addBook(sherlock_text); 

			return return_array;
		} 

		return return_obj;

	}

	//Constructor for the object values in the 'markov_library'.
	
	//It includes a reference to the 'library' which contains the syllable count for 
	//all word properties given in the 'library' object.
	function WordChain() {
		this.cmuLibrary = library;
	}

	//This function randomly selects the next word from the 'markov_library' property values, which are
	//'WordChain()' objects (i.e. 'next_word').
	
	//If the selected word does not meet the criteria in 'testWord()' it is repicked.
	WordChain.prototype.selectRND = function() {
		var chain_array = [], return_word = "";
		for (var elt in this) {
			if (this.hasOwnProperty(elt)) {
				for (var i = 0; i < this[elt]; i++) {
					chain_array.push(elt);
				}
			}
		}

		return_word = chain_array[Math.floor(Math.random() * chain_array.length)];
		while (testWord(return_word)) {
			return_word = chain_array[Math.floor(Math.random() * chain_array.length)];
		}

		//Prepositions and other common words appear a bit too often. The block below will repick a common word 60% of the time.
		//While not an organic solution, it improves the quality of the poems in spite of the constraints of the haiku structure.
		if (new RegExp(return_word).test(common_words) && (Math.floor(Math.random() * 5) + 1) > 2 ) {
			return_word	= this.selectRND();
		}

		return return_word;
	}

	//This function tests that a 'markov_library' property has a word in its 'WordChain()' object which
	//is both in the 'library' object and meets the syllable requirement of the current poem line.
	WordChain.prototype.hasWord = function(syll_count,test_str) {
		for (var elt in this) {
			if (this.hasOwnProperty(elt) && this.cmuLibrary.hasOwnProperty(elt)) {
				if (this.wordLength(elt) <= syll_count && !(testWord(elt))) return true;
			}
		}
		return false;
	}

	WordChain.prototype.wordLength = function(word) {
		return this.cmuLibrary[word];
	}

	//This function tests if a 'word' is in the current poem or current line. All duplicate words
	//were removed from the poem to produce higher quality poems/words.
	function testWord(word) {
		if (word === "") return false;
		if (new RegExp(word).test(return_poem) || new RegExp(word).test(poem_line)) return true;
		return false;
	}

	function wordGrabber() {
		var keys_array = Object.keys(markov_library);
		return keys_array[Math.floor(Math.random() * keys_array.length)];
	}

	//This function creates the poem lines using Markov Chains. It will start with the 'first_word', which is random for the start
	//of the poem and equal to the last word in the previous line otherwise. From there, it will look up the 'current_word'
	//in the 'markov_library' and select a random word. If the 'line_length' (syllable requirement) of the line would be
	//exceeded by the proposed 'next_word' (stored in 'temp_word' and 'word_length'), then the temp_word is repicked. The 
	//function will never search for a 'next_word' unless it confirms a valid word exists in the 
	//'markov_library[current_word]' ('WordChains()') object through the 'hasWord()' method.
	function markovLineMaker(line_length) {
		var	current_word = first_word,temp_word,word_length = library[first_word];
		poem_line = "";

		while (line_length > 0) {

			if (markov_library[current_word].hasWord(line_length)) {

				var markov_state = false;
				while (markov_state == false) {

					temp_word = markov_library[current_word].selectRND();
					word_length = markov_library[current_word].wordLength(temp_word);
			
					if (line_length - word_length < 0) continue;
					current_word = temp_word;
					markov_state = true;
				}
				
				poem_line += current_word + " ";
				line_length -= word_length;

			} else current_word = wordGrabber();

		}

		first_word = /\b([\w]+)$/.exec(poem_line.slice(0,-1))[1];
		return poem_line.slice(0,-1);
	}  

	//This function assembles the lines according to the specified structure.
	function createHaiku(structure) {
		for (var i = 0; i < structure.length; i++) {
			return_poem += markovLineMaker(structure[i]) + '\n\n';
		}
		return return_poem.slice(0,-2);
	} 

	//Wrapper return statement
	return createHaiku(structure);

}

module.exports = {
	haikuGenerator: haikuGenerator
}