var async = require('async');

exports.bfs = function bfs(start, moves, goal, done) {
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
        function moveQueueTask(node, callback) {
            moves(depth, node, function(err, newNodes) {
                if (foundGoal || !newNodes || !newNodes.length) 
                    return callback();
                var goalQueue = async.queue(goalQueueTask, goal.parallel || 4);
                goalQueue.drain = callback; 
                newNodes.forEach(function(newNode) {
                    if (visited.hasOwnProperty(newNode)) return;
                    nodeQueue.push(newNode);
                    visited[newNode] = {from: node};
                    goalQueue.push(newNode);
                });
                if (!goalQueue.length()) return callback();
                function goalQueueTask(newNode, goalCallback) {
                    if (foundGoal) return goalCallback();
                    goal(newNode, function(err, isGoal) {
                        if (isGoal) 
                            foundGoal = {node: newNode};
                        goalCallback();
                    });
                };
            });
        }
        moveQueue.drain = doneDepth;
        nodes.forEach(moveQueue.push.bind(moveQueue));
        function doneDepth() {
            if (foundGoal) {
                var p = foundGoal.node, path = [];
                while (visited[p].from) {
                    path.push(p);
                    p = visited[p].from;
                }
                path.push(p);
                path.reverse();
                done(null, path);
            } else if (!nodeQueue.length) {
                done(null, null); // no path
            } else {
                // continue exploring
                explore(nodeQueue, depth + 1);
            }
        }
    };
};
