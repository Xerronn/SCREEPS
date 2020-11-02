const systemMemory = require("./system.memory");

var systemRoomPlanner2 = {
    run: function() {
        //predefined bunker layout
        var bunker = {
            "extension":{"pos":[{"x":1,"y":0},{"x":2,"y":0},{"x":3,"y":0},{"x":4,"y":0},
                {"x":6,"y":0},{"x":7,"y":0},{"x":8,"y":0},{"x":9,"y":0},{"x":0,"y":1},
                {"x":2,"y":1},{"x":3,"y":1},{"x":5,"y":1},{"x":7,"y":1},{"x":8,"y":1},
                {"x":10,"y":1},{"x":0,"y":2},{"x":1,"y":2},{"x":5,"y":2},{"x":6,"y":2},
                {"x":9,"y":2},{"x":10,"y":2},{"x":0,"y":3},{"x":1,"y":3},{"x":6,"y":3},
                {"x":9,"y":3},{"x":10,"y":3},{"x":0,"y":4},{"x":7,"y":4},{"x":8,"y":4},
                {"x":10,"y":4},{"x":1,"y":5},{"x":2,"y":5},{"x":8,"y":5},{"x":9,"y":5},
                {"x":0,"y":6},{"x":2,"y":6},{"x":3,"y":6},{"x":10,"y":6},{"x":0,"y":7},
                {"x":1,"y":7},{"x":4,"y":7},{"x":10,"y":7},{"x":0,"y":8},{"x":1,"y":8},
                {"x":4,"y":8},{"x":5,"y":8},{"x":0,"y":9},{"x":2,"y":9},{"x":3,"y":9},
                {"x":5,"y":9},{"x":1,"y":10},{"x":2,"y":10},{"x":3,"y":10},{"x":4,"y":10},
                {"x":6,"y":10},{"x":7,"y":10}]},

            "road":{"pos":[{"x":3,"y":3}, {"x":5,"y":0},{"x":1,"y":1},{"x":4,"y":1},{"x":6,"y":1},
                {"x":9,"y":1},{"x":2,"y":2},{"x":3,"y":2},{"x":7,"y":2},{"x":8,"y":2},
                {"x":2,"y":3},{"x":7,"y":3},{"x":8,"y":3},{"x":1,"y":4},{"x":4,"y":4},
                {"x":6,"y":4},{"x":9,"y":4},{"x":0,"y":5},{"x":5,"y":5},{"x":10,"y":5},
                {"x":1,"y":6},{"x":4,"y":6},{"x":6,"y":6},{"x":9,"y":6},{"x":2,"y":7},
                {"x":3,"y":7},{"x":7,"y":7},{"x":2,"y":8},{"x":3,"y":8},{"x":8,"y":8},
                {"x":1,"y":9},{"x":4,"y":9},{"x":6,"y":9},{"x":9,"y":9},{"x":5,"y":10}]},
                
            "spawn":{"pos":[{"x":4,"y":2},{"x":2,"y":4},{"x":6,"y":8}]},
            "container":{"pos":[{"x":3,"y":3}]},
            "observer":{"pos":[{"x":4,"y":3}]},
            "tower":{"pos":[{"x":5,"y":3},{"x":5,"y":4},{"x":3,"y":5},{"x":7,"y":5},{"x":5,"y":6},{"x":5,"y":7}]},
            "link":{"pos":[{"x":3,"y":4}]},
            "storage":{"pos":[{"x":4,"y":5}]},
            "terminal":{"pos":[{"x":6,"y":5}]},
            "factory":{"pos":[{"x":7,"y":6}]},
            "powerSpawn":{"pos":[{"x":8,"y":6}]},
            "nuker":{"pos":[{"x":6,"y":7}]},
            "lab":{"pos":[{"x":8,"y":7},{"x":9,"y":7},{"x":7,"y":8},{"x":9,"y":8},{"x":10,"y":8},{"x":7,"y":9},{"x":8,"y":9},{"x":10,"y":9},{"x":8,"y":10},{"x":9,"y":10}]}}
        
        var myRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller.my && Game.rooms[room].controller.level > 0 && Memory.roomsPersistent[room].roomPlanning);
        //loops through all rooms in roomPlanning
        for (var room of myRooms) {
            //check if the room controller has changed level at all
            if (Memory.roomsPersistent[room].roomPlanning.rank != Game.rooms[room].controller.level) {

                //clear out any buildings left by enemies
                let enemyBuildings = Game.rooms[room].find(FIND_STRUCTURES, {
                    filter: (structure) => {return structure.my == false}});
                for (var struct of enemyBuildings) {
                    struct.destroy();
                }


                var roomController = Game.rooms[room].controller;
                if (!Memory.roomsPersistent[room].roomPlanning.anchor) {

                    //if this is the first room and you have to manually place your spawn, it will calculate the anchor off that placement
                    //TODO: figure out a way to avoid user error in spawn placement
                    let spawns = Game.rooms[room].find(FIND_MY_SPAWNS);
                    if (spawns.length > 0) {
                        let spawnPos = {
                            "x": spawns[0].pos.x - bunker["spawn"]["pos"][0].x,
                            "y": spawns[0].pos.y - bunker["spawn"]["pos"][0].y
                        }
                        Memory.roomsPersistent[room].roomPlanning.anchor = spawnPos;
                    } else {
                        //find positions the bunker could fit
                        var candidates = [];
                        for (var x = 2; x < 38; x++) {
                            for (var y = 2; y < 38; y++) {
                                let dq = false;
                                for (var candidate of Game.rooms[room].lookAtArea(y, x, y + 10, x + 10, true)) {
                                    if (candidate["terrain"] == "wall") {
                                        dq = true;
                                        break; //break as soon as it is dq
                                    }
                                }
                                if (!dq) {
                                    //if the position does not contain a wall, push it to possibles
                                    candidates.push({
                                        "x": x,
                                        "y": y
                                    });
                                } 
                            }
                        }
                        //find all the things we want to be close to
                        var POVs = [];
                        var sources = Game.rooms[room].find(FIND_SOURCES);
                        for (var source of sources) {
                            POVs.push(source.pos);
                        }
                        POVs.push(Game.rooms[room].controller.pos);

                        //centroid calculation
                        var centroid = {
                            "x": 0,
                            "y": 0
                        };
                        for (var pov of POVs) {
                            centroid["x"] += pov.x;
                            centroid["y"] += pov.y;
                        }
                        centroid["x"] = Math.floor(centroid["x"] / POVs.length);
                        centroid["y"] = Math.floor(centroid["y"] / POVs.length);
                        var centroidPos = new RoomPosition(centroid["x"], centroid["y"], room);

                        var bestCandidate = {"score": 100};
                        for (var candidate of candidates) {
                            var position = new RoomPosition(candidate["x"] + 5, candidate["y"] + 5, room);
                            
                            var candidateScore = position.findPathTo(centroidPos).length;
                            if (bestCandidate["score"] > candidateScore) {
                                bestCandidate["score"] = candidateScore;
                                bestCandidate["x"] = candidate["x"];
                                bestCandidate["y"] = candidate["y"];
                            }
                        }

                        //set the anchor to the best candidate
                        Memory.roomsPersistent[room].roomPlanning.anchor = bestCandidate;
                    }
                }
                //once you have an anchor make a live position of it
                //TODO: factory is not building for some reason
                var roomAnchor = new RoomPosition(Memory.roomsPersistent[room].roomPlanning.anchor["x"], Memory.roomsPersistent[room].roomPlanning.anchor["y"],room);
                var typesToBuild = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_LAB, STRUCTURE_STORAGE, STRUCTURE_LINK, STRUCTURE_FACTORY, STRUCTURE_POWER_SPAWN, STRUCTURE_NUKER, STRUCTURE_OBSERVER, STRUCTURE_TERMINAL];

                //builds the appropriate number of each structure type
                for (var type of typesToBuild) {
                    //buildNewStructures(type, room, roomAnchor);
                }

                if (roomController.level >= 2) {
                    //build containers
                    if (!Memory.roomsPersistent[room].roomPlanning.containersBuilt) {
                        let closest = []
                        for (var source of Game.rooms[room].find(FIND_SOURCES)) {
                            let pathToSource = roomAnchor.findPathTo(source.pos, {range: 1, ignoreCreeps: true})
                            let closestPosition = new RoomPosition(pathToSource[pathToSource.length - 1]["x"], pathToSource[pathToSource.length - 1]["y"], room);
                            closest.push(closestPosition); 
                        }
                        for (var close of closest) {
                            close.createConstructionSite(STRUCTURE_CONTAINER);
                        }
                        Memory.roomsPersistent[room].roomPlanning.containersBuilt = true;
                    }
                    
                }


                if (roomController.level >= 3) {
                    //build bunker roads
                    if (!Memory.roomsPersistent[room].roomPlanning.bunkerRoadsBuilt) {
                        Memory.roomsPersistent[room].roomPlanning.bunkerRoads= true;
                        for (var pos of bunker["road"]["pos"]) {
                            Game.rooms[room].createConstructionSite(new RoomPosition(roomAnchor.x + pos["x"], roomAnchor.y + pos["y"], room), STRUCTURE_ROAD);
                        }
                    }
                }
   
                if (roomController.level >= 4) {
                    //build ramparts
                    var xMax = roomAnchor.x + 10;
                    var yMax = roomAnchor.y + 10;
                    for (var x = roomAnchor.x; x <= roomAnchor.x + 10; x++) {
                        for (var y = roomAnchor.y; y <= roomAnchor.y + 10; y++) {
                            if (x == roomAnchor.x || y == roomAnchor.y || x == xMax || y == yMax) {
                                Game.rooms[room].createConstructionSite(new RoomPosition(x, y, room), STRUCTURE_RAMPART);
                            }
                        }
                    }
                }

                if (roomController.level >= 5) {
                    //build links
                    //find how many exist
                    let numExist = Game.rooms[room].find(FIND_STRUCTURES, {
                        filter: (structure) => {return structure.structureType == STRUCTURE_LINK}}).length;

                    //find how many are building
                    let numBuilding = Game.rooms[room].find(FIND_MY_CONSTRUCTION_SITES, {
                        filter: (structure) => {return structure.structureType == STRUCTURE_LINK}}).length;

                    //find how many are possible to build at the current level
                    let maxToBuild = CONTROLLER_STRUCTURES[STRUCTURE_LINK][Game.rooms[room].controller.level];
                    let numToBuild = maxToBuild - (numExist + numBuilding);

                    for (var i = 0; i < numToBuild; i++) {
                        //first build controller link
                        if (!Memory.roomsPersistent[room].roomPlanning.controllerLink) {
                            let pathToController = roomAnchor.findPathTo(roomController.pos, {range: 2, ignoreCreeps: true})
                            let closestPosition = new RoomPosition(pathToController[pathToController.length - 1]["x"], pathToController[pathToController.length - 1]["y"], room);
                            closestPosition.createConstructionSite(STRUCTURE_LINK);
                            Memory.roomsPersistent[room].roomPlanning.controllerLink = true;
                            continue; //move to next iteration out of the num to build
                        }
                        let sources = Game.rooms[room].find(FIND_SOURCES);
                        sources = _.sortBy(sources, source => roomAnchor.getRangeTo(source));

                        //init sources room planning memory
                        if (!Memory.roomsPersistent[room].roomPlanning.sourceLinks) {
                            Memory.roomsPersistent[room].roomPlanning.sourceLinks = [];
                        }
                        if (Memory.roomsPersistent[room].roomPlanning.sourceLinks.length < sources.length) {
                            //loop through sources until you find one not in memory
                            for (source of sources) {
                                if (!Memory.roomsPersistent[room].roomPlanning.sourceLinks.includes(source.id)) {

                                    //once a source not in the memory is found, route to it and build a link on the last step of the route
                                    let pathToSource = roomAnchor.findPathTo(source.pos, {range: 2, ignoreCreeps: true})
                                    let closestPosition = new RoomPosition(pathToSource[pathToSource.length - 1]["x"], pathToSource[pathToSource.length - 1]["y"], room);

                                    //find and delete the nearby container
                                    let sourceContainer = closestPosition.findClosestByRange(FIND_STRUCTURES, {
                                        filter: (structure) => { return structure.structureType == STRUCTURE_CONTAINER 
                                            && closestPosition.inRangeTo(structure, 2)
                                        }
                                    });
                                    if (sourceContainer) {
                                        sourceContainer.destroy();
                                    }
                                    if (closestPosition.createConstructionSite(STRUCTURE_LINK) == 0) {
                                        Memory.roomsPersistent[room].roomPlanning.sourceLinks.push(source.id);
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
                Memory.roomsPersistent[room].roomPlanning.rank = Game.rooms[room].controller.level;
            }  
        }

        function buildNewStructures(structureConstant, room, roomAnchor) {
            //find how many exist
            let numExist = Game.rooms[room].find(FIND_STRUCTURES, {
                filter: (structure) => {return structure.structureType == structureConstant}}).length;

            //find how many are building
            let numBuilding = Game.rooms[room].find(FIND_MY_CONSTRUCTION_SITES, {
                filter: (structure) => {return structure.structureType == structureConstant}}).length;

            //find how many are possible to build at the current level
            let maxToBuild = CONTROLLER_STRUCTURES[structureConstant][Game.rooms[room].controller.level];
            if (maxToBuild > bunker[structureConstant]["pos"].length) maxToBuild = bunker[structureConstant]["pos"].length;

            //calculate the number to build
            let numToBuild = maxToBuild - (numExist + numBuilding);
            
            if (numExist + numBuilding < maxToBuild) {
                //build the structure
                let index = numExist + numBuilding;
                for (let i = 0; i < numToBuild; i++) {
                    let pos = bunker[structureConstant]["pos"][index + i];
                    Game.rooms[room].createConstructionSite(new RoomPosition(roomAnchor.x + pos["x"], roomAnchor.y + pos["y"], room), structureConstant);
                }
            }
        }
    }
};

module.exports = systemRoomPlanner2;