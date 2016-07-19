var feed_material = fs.readFileSync('./pg98.txt').toString();

function formatDataFile(data,dictionary) {
	var return_array = [],match,word_reg = /([A-Za-z]+)[\.\?\! ]/g;
	while (match = word_reg.exec(data)) {
		if (dictionary.hasOwnProperty(match[1])) {
			return_array.push(match[1].toLowerCase());
		}
	}
	return return_array;
}

function WordChain() {
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

//WordChain.prototype.syllCount = function(element) {
//	this[element];
//}

function parseDataFile(txt_data,library) {
	var dictionary = haiku.parseCMUData();
	var book = formatDataFile(txt_data,dictionary), return_obj = {};

	for (var i = 0; i < book.length; i++) {
		var current_word = book[i],
			next_word = book[i + 1];

			if (!return_obj.hasOwnProperty(current_word)) return_obj[current_word] = new WordChain();
			if (!return_obj[current_word].hasOwnProperty(next_word)) {
				return_obj[current_word][next_word] = 1;
			} else return_obj[current_word][next_word]++;
	}

	return return_obj;

}

function wordSelector(parent,syll) {
	var dictionary = markovDict();

	return dictionary[parent].selectRND();

}

function markovDict() {
	return parseDataFile(feed_material);
}

module.exports = {
	wordSelector: wordSelector,
	markovDict: markovDict
}
