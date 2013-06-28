var async = require('async'); 

module.exports = function bfs(start, moves, goal, done) {
    goal(start, function(err, res) {
        if (res) done(null, [start]);
        else explore([start], 1);
    });    
    var depth = 0;
    var foundGoal = null;
    var visited = {};
    visited[start] = {from: null};
    function explore(nodes, depth) {
        var nodeQueue = [];
        var moveQueue = async.queue(moveQueueTask, moves.parallel || 4);
        moveQueue.drain = moveQueueDone;
        moveQueue.push(nodes);
        function moveQueueTask(node, callback) {
            try {
                moves(depth, node, function(err, newNodes) {
                    if (err) return callback(err);
                    if (foundGoal || !newNodes || !newNodes.length) 
                        return callback();
                    var goalQueue = async.queue(goalQueueTask, goal.parallel || 4);
                    goalQueue.drain = callback; 
                    newNodes.forEach(function(newNode) {
                        if (visited.hasOwnProperty(newNode)) return;
                        nodeQueue.push(newNode);
                        visited[newNode] = {from: node};
                        goalQueue.push([newNode]);
                    });
                    if (!goalQueue.length()) return callback();
                    function goalQueueTask(newNode, goalCallback) {
                        if (foundGoal) return goalCallback();
                        goal(newNode, function(err, isGoal) {
                            visited[newNode] = {from: node};
                            if (err) return goalCallback(err);
                            if (isGoal) foundGoal = {node: newNode};
                            goalCallback();
                        });
                    };
                });
            } catch (e) {
                // In large graphs you may get a Maximum call stack size 
                // exceeded error. Its best to reply with an error instead
                // of dying
                return callback(e);
            }
        }
        function moveQueueDone() {
            if (foundGoal) {
                var p = foundGoal.node, path = [];
                while (visited[p].from != null) {
                    path.push(p);
                    p = visited[p].from;
                }
                path.push(p);
                path.reverse();
                done(null, path);
            } else if (!nodeQueue.length) {
                done(null, null); // no path
            } else {
                explore(nodeQueue, depth + 1);// continue exploring
            }
        }
    };
};

