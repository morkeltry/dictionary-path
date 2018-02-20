const dictionary = require ('./dictionary.tricky.json');
const cache = {};
const log = {
  route : msg => process.stdout.write(`${msg}, `) ,
  failureVerbose : console.log,
  failure : msg => {
    process.stdout.write(`${msg} `);
    pathsNotFound++;
  },

  /// OVERRIDE LOGGING - comment out below to ALLOW logging
    route : msg => {},
  failure : msg => pathsNotFound++,

};

var countPathsCalculated =0;
var countCacheRetrievals =0;
var pathsNotFound =0;

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
  // return the subArray filtered down to only members with HammingDistance 1 from targetWord (and exclude members of blacklist)
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

const addToCache = (route, distance) => {
/// add a route to the cache only if not already there or distance < cached distance of either this route or its reverse
  countPathsCalculated++;

  const start = route[0];
  const end = route[route.length-1];
  if (distance===undefined)
    distance = route.length-1;
  cache[start] = cache[start] || {};
  cache[start][end] = cache[start][end] || {route, distance};
  cache[end] = cache[end] || {};
  cache[end][start] = cache[end][start] || {route: route.slice().reverse(), distance};

  if (distance < cache[start][end].distance && distance < cache[end][start].distance) {
    cache[start][end].distance =  cache[end][start].distance = distance;
    cache[start][end].route = route;
    cache[end][start].route = route.reverse();
  }
};

const addFailureToCache = (start, end) => {
  cache[start] = cache[start] || {};
  cache[start][end] = {failed: true};
  cache[end] = cache[end] || {};
  cache[end][start] = {failed: true};
  log.failure ('#');
}

const findPath = (word1,word2, blacklist=[], suppressOutput=true) => {
/// find a path! (don't forget to avoid words on the blacklist)

  /// is it cached? We trust our cache :)
  if (cache[word1] && cache[word1][word2]) {
    countCacheRetrievals ++;
    if (cache[word1][word2].failed) {
      log.failure ('#');
      return undefined
    }
    log.route (`.${word1}-${word2}.`);
    return cache[word1][word2].route;
  }
  if (cache[word2] && cache[word2][word1]) {
    countCacheRetrievals ++;
    if (cache[word2][word1].failed) {
      log.failure ('#');
      return undefined
    }
    log.route (`.${word1}-${word2}.`);
    return cache[word2][word1].route.reverse();
  }

  log.route (`[${word1}-${word2}]`);


  /// maybe we have a /reaally/ easy job here?
  if (hammingDistance (word1,word2) === 1) {
    addToCache ([word1,word2]);
    return [word1,word2];
  }

  /// maybe it's just a /bit/ easy?
  const possibleStarts = hD1neighbours (dictionary, word1, blacklist);
  const possibleEnds = hD1neighbours (dictionary, word2, blacklist);
  const missingLink = allSharedMembers ([possibleStarts, possibleEnds])[0];
  // if no shared members in the arrays possibleStarts & possibleEnds, missingLink will be undefined,
  // otherwise the missing word in the path (or arbitrary one of possible paths if multiple exist)
  if (missingLink) {
    addToCache ([word1,missingLink,word2]);
    return [word1,missingLink,word2];
  }


  switch (possibleStarts.length * possibleEnds.length ) {
    /// or maybe an impossible job?
    // case 0: there are no possible paths between the given words.
    case 0: {
      if (!suppressOutput) {
        if (possibleStarts.length === 0 )
          log.failureVerbose (`${word1} has no neighbours`);
        if (possibleEnds.length === 0 )
          log.failureVerbose (`${word2} has no neighbours`);
      }
      addFailureToCache (word1,word2);
      return undefined;
    }

    // case 1: both the start and end of the list have exactly one neighbour candidate for possible paths
    case 1: {
      const pathMiddle= findPath (possibleStarts[0],possibleEnds[0], blacklist.concat (word1, word2))
      if (pathMiddle) {
        addToCache ([word1].concat (pathMiddle, word2));
        return [word1].concat (pathMiddle, word2);
      }
      else {
        if (!suppressOutput) {
          log.failureVerbose (`Couldn't find path between ${word1} and ${word2}.`);
        }
        addFailureToCache (word1,word2);
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
          if (pathMiddle) {
            resultsList.push ([word1].concat (pathMiddle, word2));
          }
        });
      });
      if (resultsList.length === 0) {
        addFailureToCache (word1,word2);
        return undefined;
      }
      else {
        resultsList.sort ((list1,list2) => list1.length-list2.length);
        resultsList.forEach (el => addToCache(el));
        return cache[word1][word2].route;
      }

    }
  };

}

console.log (`\nAnswer to ('lick','lack'): ${findPath('lick','lack')}\n`);
console.log (`\nAnswer to ('lick','hack'): ${findPath('lick','hack')}\n`);
console.log (`\nAnswer to ('sick','hack'): ${findPath('sick','hack')}\n`);
console.log (`\nAnswer to ('sock','hack'): ${findPath('sock','hack')}\n`);

console.log (`dictionary length: ${dictionary.length}`);
console.log (`paths calculated: ${countPathsCalculated}`);
console.log (`paths found not to exist: ${pathsNotFound}`);
console.log (`paths/ failures retrieved from cache: ${countCacheRetrievals}`);

// console.log (JSON.stringify (cache));
