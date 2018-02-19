dictionary = require ('./dictionary.easy.json')

const hammingDistance = (word1,word2) => {

  // return Hamming distance between two strings

  if (typeof word1 !== 'string' || typeof word2 !== 'string')
    throw new Error ('Bad input - not both strings');
  else
    if (word1.length !== word2.length)
      throw new Error ('Bad input - Hamming distance requires equal lengths');
    else {

      switch (word1.length) {
        case 0 : return 0;
            //case 1: only one character? Then return 1 if different, 0 if same
        case 1 : return 1* (word1 !== word2);
            // default case: more than one character? Then recurse, coerce and add 1 if first charcter same
        default :
            return hammingDistance(word1.slice(1), word2.slice(1)) + (word1[0] !== word2[0]);
      }
    }
}

console.log(hammingDistance('biscuits','briskety'));
