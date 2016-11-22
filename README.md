### Async breadth first search for node

# Usage

    var bfs = require(bfs);
    bfs(starts, movefn, goalfn, callback);

where

* start - array of possible start positions
* movefn - `function(depth, node, callback)` - a function called to retreive nodes connected to the specified node
  * callback should be called with the new nodes `callback(err, newNodes)`
* goalfn - `function(node, callback)` - a function called to check if the node is a valid goal.
  * callback should be called with true or false `callback(err, true|false)`
* callback - `function(err, path)`
  * path - the shortest path found.

