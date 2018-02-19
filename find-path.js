dictionary = require ('./dictionary.tricky.json')

const hammingDistance = (word1,word2) => {

  // return Hamming distance between two strings

  if (typeof word1 !== 'string' || typeof word2 !== 'string')
    throw new Error (`Bad input - not both strings`);
  else
    if (word1.length !== word2.length)
      throw new Error (`${word1}+${word2} Bad input - Hamming distance requires equal lengths`);
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

const hD1neighbours = (subArray, targetWord, blacklist=[]) => {
  // return the subArray filtered down to only members with HammingDistance 1 from targetWord and exclude members of blacklist
  return dictionary.filter (el =>
    !(blacklist.includes(el))
    && hammingDistance(el, targetWord) === 1);
}

const allSharedMembers = (arraySet) => {
  // given array sets of child arrays, return array of all elements which are a member of all child arrays;
  // (it's barely more extra computation or coding than it would be to find one or all shared members from a 2 array set)
  const target = arraySet.length;
  const members = {};
  const result = [];

  arraySet.forEach (elArr => {
    elArr.forEach (el => {
      members[el] = members[el]+1 || 1;
      if (members[el]===target) {
        result.push (el);
      }
    });
  });

  return result;
}

const purgeArraysMutably = (arraySet, purgeList, purgeFirstOccurrenceOnly=false) => {
  // mutate each array in arraySet by purging each occurrence of each member of purgeList.
  // non-ideal implementation - this would be faster with objects, but I'm using useful array methods elsewhere like .filter() and .length
  var idx;
  arraySet.forEach (elArr => {
    purgeList.forEach (purgeable => {
      while (idx= elArr.indexOf (purgable) >= 0) {
        elArr.splice (idx,1);
        if (purgeFirstOccurrenceOnly)
          break;
      }
    });
  });
}


const findPath = (word1,word2, blacklist=[], suppressOutput=true) => {
/// find a path! (don't forget to avoid words on the blacklist)

  /// maybe we have a /reaally/ easy job here?
  if (hammingDistance (word1,word2) === 1)
    return [word1,word2];


  /// maybe it's just a /bit/ easy?
  const possibleStarts = hD1neighbours (dictionary, word1, blacklist);
  const possibleEnds = hD1neighbours (dictionary, word2, blacklist);
  const missingLink = allSharedMembers ([possibleStarts, possibleEnds])[0];
  // if no shared members in the arrays possibleStarts & possibleEnds, missingLink will be undefined,
  // otherwise the missing word in the path (or arbitrary one of possible paths if multiple exist)
  if (missingLink)
    return [word1,missingLink,word2];


  switch (possibleStarts.length * possibleEnds.length ) {
    /// or maybe an impossible job?
    // case 0: there are no possible paths between the given words.
    case 0: {
      if (!suppressOutput) {
        console.log (`No possible path`);
        if (possibleStarts.length === 0 )
          console.log (`${word1} has no neighbours`);
        if (possibleEnds.length === 0 )
          console.log (`${word2} has no neighbours`);
      }
      return undefined;
    }

    // case 1: both the start and end of the list have exactly one neighbour candidate for possible paths
    case 1: {
      const pathMiddle= findPath (possibleStarts[0],possibleEnds[0], blacklist.concat (word1, word2))
      if (pathMiddle)
        return [word1].concat (pathMiddle, word2);
      else {
        if (!suppressOutput) {
          console.log (`Couldn't find path between ${word1} and ${word2}.`);
        }
        return undefined;
      }
    }


    // default case: one or both of start and end have multiple possible paths
    // naive algorithm: try all and compare lengths.
    default: {
      const resultsList = [];
      var pathMiddle;
      const newBlacklist = blacklist.concat (word1, word2);
      possibleStarts.forEach (el1 => {
        possibleEnds.forEach (el2 => {
          pathMiddle= findPath (el1, el2, newBlacklist);
          if (pathMiddle)
            resultsList.push ([word1].concat (pathMiddle, word2));
        });
      });
      if (resultsList.length === 0)
        return undefined;
      else {
        resultsList.sort ((list1,list2) => list1.length-list2.length);
        return resultsList[0];
      }

    }
  };

}

console.log(`Answer to ('lick','lack'): ${findPath('lick','lack')}\n`);
console.log(`Answer to ('lick','hack'): ${findPath('lick','hack')}\n`);
console.log(`Answer to ('sick','hack'): ${findPath('sick','hack')}\n`);
console.log(`Answer to ('sock','hack'): ${findPath('sock','hack')}\n`);
// console.log(`Let's go with ('',''): ${findPath('','')}`);
// console.log(`Let's go with ('',''): ${findPath('','')}`);
