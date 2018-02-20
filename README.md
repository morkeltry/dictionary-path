# dictionary-path

A module to find the shortest path, changing one letter at a time, between a given two words through a dictionary (array) of same-length words.

### v1:
Searches for paths recursively and naively (ie in the order that it comes across the path, which is dictionary order). Possible paths are then sorted by length and the first in the sorted list is returned. Not computationally efficient.

 ### v2:
 Includes caching, so that the shortest path between two words, once found, is cached and is not subsequently recalculated when the same pair's shortest path is needed.
