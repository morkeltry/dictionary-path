# dictionary-path

A module to find the shortest path, changing one letter at a time, between a given two words through a dictionary (array) of same-length words.

## How to use
 ```
 git clone https://github.com/morkeltry/dictionary-path.git
 cd dictionary-path
 ```

Place a dictionary, as a .json containing an array of unique, same-length strings into the folder.
`require` it in, by changing the filename in line 1 of `find-path.js`.

Pass two words from the dictionary to the `findPath()` function, eg following the format at the end of  `find-path.js`:
```
console.log (`\nAnswer to ('sock','hack'): ${findPath('sock','hack')}\n`);
```
and running `node find-path.js`, or by using `module.exports` to export `findPath()` to be used by your own .js file.




### v1:
Searches for paths recursively and naively (ie in the order that it comes across the path, which is dictionary order). Possible paths are then sorted by length and the first in the sorted list is returned. Not computationally efficient.

 ### v2:
 Includes caching, so that the shortest path between two words, once found, is cached and is not subsequently recalculated when the same pair's shortest path is needed.

 ### v3:
 Add logging- to give an idea of how efficiently the search performs. The first thing I noticed once this feature was complete is that (in the small dictionaries I used), far more computation is used on duplicating searches for paths which do not exist than was used in duplicating finding existent paths

 ### v4+ (not implemented) :
 The cache is so far a simple object. An additional efficiency would be to use the OO paradigm and give the cache a prototype so that words and word pairs not yet added to the cache would have default behaviours (eg check the reverse of the route, log the failure) which is currently being performed by findPath().

 The search algorithm could also be improved (which would be simpler if a cache prototype existed) in that meandering paths could be identified by comparing the number of steps in the current path to the Hamming distance from the start. Paths meandering more than a threshold could be aborted without returning failure so that they can be retried once shorter options have been exhausted.


## Process:
I thought first about the edge cases which could confuse an 'intuitive' search through a dictionary. The ones I came up with were:
* paths which 'hide' better paths by being intially more attractive, but ultimately leading nowhere.
* meandering paths, which are considerably longer than optimal, but which may for one reason or another be initially more attractive.
* loops.
* dead ends.
* words ceasing to be valid

I avoided the problem of non-dictionary words by only ever selecting words which were in the dictionary. I assumed a constant dictionary, which meant that the only way words would cease to be valid was if they created an inefficient path (eg looping).

I decided to start with a 'naive' search, which would evaluate all possible paths, and therefore eventually find the shorter paths where it existed. Loops and dead ends are simply a fact which needs to be dealt with.

Since Hamming Distance is key to this problem (the optimal route will be of length equivalent to the Hamming distance from start to end, and the system will need a way to judge which letters are 'neighbours', which is the same as saying they have a Hamming Distance of 1) , I began with the hammingDistance() function. this was a useful first tool to have.

I identified what I expected to be the slowest factor of the system, which I decided was search, ie the number of potential different paths to try.

I realised that recursion would be the simplest way to deal with word lengths longer than three. Though there are various cases to take care of (words are neighbours/ words share a neighbour/ words share no neighbour/ words are too far apart to share a neighbour), some of these can be used to make a recursive search shorter where possible but they can be passed over, leaving the recursive search to work, where not.

Recursive search feels like it operates in a maximum kn^2 time (n being dictionary size), which would be slow for large dictionaries. I therefore aimed to leave room for improvement.

The improvement I made eventually made was to add a cache so that repeated recursive search on the same word pairs were unnecessary. As there are a small number of letters, any word can have only so many potential neighbours, so that the maximal search time is reduced to 2kn. In my small dictionary, caching made little difference, saving only about 25% of path trials.
You can compare efficiency with a larger disctionary by cloning the `no-cache` branch.

The entire dictionary still needs to be looped over to find neighbours, so an index of neighbours would also save time.

## Correctness
Having identified edge cases which I thought might give wrong results, I designed a 'tricky' dictionary to mislead the algorithm. However, since in its current form it checks all possible paths, my attempt to break it failed. Loops were covered by passing down a 'blacklist' of already traversed words and dead-ends are inherent to the problem being solved.



 ## Assumptions:
 #### Words are appropriate input
 Each word is the same length, so no empty words. Each word is a string of 1 byte letters.

 #### Dictionary is appropriate input
 The code takes a .json file containing only an array which contains only appropriate words, with no duplication.

 #### The system has sufficient resources
 The stack size required for branching recursive searches increases in n^2 size (where n is already exponential in relation to word length). I estimate any dictionary which is a subset of English words should cause no problem, but the system is optimised for calcuation time, not for memory efficiency.

 #### The code will not be tricked
 The caching system has been written to allow for 'shortcuts', eg code could be added to place a shortcut in the cache so that the system sees 'hear' and 'here' as distance 1 apart, rather than 2. While this should still produce an appropriate result when searching naively, the more optimised search is not appropriate for shortcuts.

 #### The dictionary remains constant over the search
 
