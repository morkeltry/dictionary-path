# dictionary-path

A module to find the shortest path, changing one letter at a time, between a given two words through a dictionary (array) of same-length words.

### v1:
Searches for paths recursively and naively (ie in the order that it comes across the path, which is dictionary order). Possible paths are then sorted by length and the first in the sorted list is returned. Not computationally efficient.

 ### v2:
 Includes caching, so that the shortest path between two words, once found, is cached and is not subsequently recalculated when the same pair's shortest path is needed.

 ### v3:
 Add logging- to give an idea of how efficiently the search performs. The first thing I noticed once this feature was complete is that (in the small dictionaries I used), far more computation is used on duplicating searches for paths which do not exist than was used in duplicating finding existent paths



 ## Assumptions:
 #### Words are appropriate input
 Each word is the same length, so no empty words. Each word is a string of 1 byte letters.

 #### Dictionary is appropriate input
 The code takes a .json file containing only an array which contains only appropriate words, with no duplication.

 #### The system has sufficient resources
 The stack size required for branching recursive searches increases in n^2 size (where n is already exponential in relation to word length). I estimate any dictionary which is a subset of English words should cause no problem, but the system is optimised for calcuation time, not for memory efficiency.

 #### The code will not be tricked
 The caching system has been written to allow for 'shortcuts', eg code could be added to place a shortcut in the cache so that the system sees 'hear' and 'here' as distance 1 apart, rather than 2. While this should still produce an appropriate result when searching naively, the more optimised search is not appropriate for shortcuts.
