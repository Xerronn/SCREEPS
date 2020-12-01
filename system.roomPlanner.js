const systemMemory = require("./system.memory");

var systemRoomPlanner2 = {
    run: function() {
        //predefined bunker layout
        //TODO: add utilization of the container in the bunker instead of pulling from the storage itself.
        //have all the storage withdrawing be handled by the linker 
        var myRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller && Game.rooms[room].controller.my && Game.rooms[room].controller.level > 0 && Memory.roomsPersistent[room].roomPlanning);
        //loops through all rooms in roomPlanning
        for (var room of myRooms) {
            //check if the room controller has changed level at all
            if (Memory.roomsPersistent[room].roomPlanning.rank != Game.rooms[room].controller.level) {

                //clear out any buildings left by enemies
                let enemyBuildings = Game.rooms[room].find(FIND_STRUCTURES, {
                    filter: (structure) => {return structure.my == false && struc.structureType != STRUCTURE_STORAGE && struc.structureType != STRUCTURE_TERMINAL}});
                for (var struct of enemyBuildings) {
                    struct.destroy();
                }


                var roomController = Game.rooms[room].controller;
                if (!Memory.roomsPersistent[room].roomPlanning.anchor) {

                    //if this is the first room and you have to manually place your spawn, it will calculate the anchor off that placement
                    //TODO: figure out a way to avoid user error in spawn placement. possible switch around spawn positions
                    let spawns = Game.rooms[room].find(FIND_MY_SPAWNS);
                    if (spawns.length > 0) {
                        let spawnPos = {
                            "x": spawns[0].pos.x - BUNKER["spawn"]["pos"][0].x,
                            "y": spawns[0].pos.y - BUNKER["spawn"]["pos"][0].y
                        }
                        Memory.roomsPersistent[room].roomPlanning.anchor = spawnPos;
                    } else {
                        //find positions the bunker could fit
                        var candidates = [];
                        for (var x = 2; x < 38; x++) {
                            for (var y = 2; y < 38; y++) {
                                let dq = false;
                                let wallCounter = 0;
                                for (var candidate of Game.rooms[room].lookAtArea(y, x, y + 10, x + 10, true)) {
                                    if (candidate["terrain"] == "wall") {
                                        //if it is an edge, give some slack
                                        if (candidate.x == x || candidate.x == x+10 || candidate.y == y || candidate.y == y+10) {
                                            wallCounter++;
                                            if (wallCounter > 5) {
                                                dq = true;
                                                break;
                                            }
                                        } else {
                                            dq = true;
                                            break; //break as soon as it is dq
                                        }
                                    }
                                }
                                if (!dq) {
                                    //if the position does not contain a wall, push it to possibles
                                    candidates.push({
                                        "x": x,
                                        "y": y,
                                        "walls": wallCounter
                                    });
                                } 
                            }
                        }
                        //find all the things we want to be close to
                        var POVs = [];
                        var sources = Game.rooms[room].find(FIND_SOURCES);
                        for (let source of sources) {
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
                            
                            //score is a function of how many walls are in the edges and distance to the centroid
                            var candidateScore = position.findPathTo(centroidPos).length + Math.pow(1.75, candidate["walls"]);
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

                //store specific tiles for the linker and treasurer to stand
                if (!Memory.roomsPersistent[room].roomPlanning.linkerSpot) {
                    Memory.roomsPersistent[room].roomPlanning.linkerSpot = {"x": roomAnchor.x + 4, "y": roomAnchor.y + 4};
                    Memory.roomsPersistent[room].roomPlanning.treasurerSpot = {"x": roomAnchor.x + 5, "y": roomAnchor.y + 5};
                }
                return
                //hande reliable first spawn building
                if (Game.rooms[room].find(FIND_MY_SPAWNS).length < 1) {
                    for (var i =0; i < 10; i++) { 
                        let success = Game.rooms[room].createConstructionSite(
                            roomAnchor.x + BUNKER["spawn"]["pos"][0].x, roomAnchor.y + BUNKER["spawn"]["pos"][0].y, STRUCTURE_SPAWN);
                        
                        if (success == 0) {
                            break;
                        }
                    }
                }
                //TODO: build ramparts surrounding our miner boiis
                //builds the appropriate number of each structure type
                for (var type of typesToBuild) {
                    buildNewStructures(type, room, roomAnchor);
                }

                if (roomController.level >= 2) {
                    //build containers
                    if (!Memory.roomsPersistent[room].roomPlanning.containersBuilt) {
                        let closest = []
                        for (let source of Game.rooms[room].find(FIND_SOURCES)) {
                            let pathToSource = roomAnchor.findPathTo(source.pos, {range: 1, ignoreCreeps: true})
                            let closestPosition = new RoomPosition(pathToSource[pathToSource.length - 1]["x"], pathToSource[pathToSource.length - 1]["y"], room);
                            closest.push(closestPosition); 
                        }
                        for (let close of closest) {
                            close.createConstructionSite(STRUCTURE_CONTAINER);
                        }
                        Memory.roomsPersistent[room].roomPlanning.containersBuilt = true;
                    }

                    //build roads to sources
                    if (!Memory.roomsPersistent[room].roomPlanning.travelRoadsBuilt) {
                        Memory.roomsPersistent[room].roomPlanning.travelRoadsBuilt = true;

                        //define corners of the bunker
                        let topRight = new RoomPosition(roomAnchor.x + 10, roomAnchor.y, room);
                        let topLeft = new RoomPosition(roomAnchor.x, roomAnchor.y, room);
                        let bottomLeft = new RoomPosition(roomAnchor.x, roomAnchor.y + 10, room);
                        let bottomRight = new RoomPosition(roomAnchor.x + 10, roomAnchor.y + 10, room);

                        let topMiddle = new RoomPosition(roomAnchor.x + 5, roomAnchor.y, room);
                        let bottomMiddle = new RoomPosition(roomAnchor.x + 5, roomAnchor.y + 10, room);
                        let leftMiddle = new RoomPosition(roomAnchor.x, roomAnchor.y + 5, room);
                        let rightMiddle = new RoomPosition(roomAnchor.x + 10, roomAnchor.y + 5, room);
                        let corners = [topRight, topLeft, bottomLeft, bottomRight, topMiddle, bottomMiddle, leftMiddle, rightMiddle];

                        //ignore if the position is a wall
                        for (let i in corners) {
                            let look = corners[i].lookFor(LOOK_TERRAIN);
                            if (look == "wall") {
                                corners.splice(i, 1);
                            }
                        }

                        let roadSites = [];
                        let selectedCorner;

                        var travelSources = Game.rooms[room].find(FIND_SOURCES);
                        //build roads from the closest corner to the source
                        for (var source of travelSources) {
                            console.log(corners);
                            selectedCorner = source.pos.findClosestByPath(corners, {ignoreCreeps: true});
                            console.log(JSON.stringify(selectedCorner));
                            roadSites.push(selectedCorner.findPathTo(source, {range: 1, ignoreCreeps: true}));
                        }

                        selectedCorner = roomController.pos.findClosestByPath(corners, {ignoreCreeps: true});
                        roadSites.push(selectedCorner.findPathTo(roomController, {range: 1, ignoreCreeps: true}));

                        for (var sites of roadSites) {
                            for (var site of sites) {
                                Game.rooms[room].createConstructionSite(site.x, site.y, STRUCTURE_ROAD);
                            }
                        }
                    }
                    
                }


                if (roomController.level >= 3) {
                    //build bunker roads
                    if (!Memory.roomsPersistent[room].roomPlanning.bunkerRoadsBuilt) {
                        Memory.roomsPersistent[room].roomPlanning.bunkerRoads= true;
                        for (var pos of BUNKER["road"]["pos"]) {
                            //do not build tunnels
                            let look = Game.rooms[room].lookAt(roomAnchor.x + pos["x"], roomAnchor.y + pos["y"], LOOK_TERRAIN);
                            if (look[look.length - 1]["terrain"] != "wall") {
                                Game.rooms[room].createConstructionSite(new RoomPosition(roomAnchor.x + pos["x"], roomAnchor.y + pos["y"], room), STRUCTURE_ROAD);
                            }
                        }
                    }
                }
   
                if (roomController.level >= 4) {
                    //build ramparts
                    var xMax = roomAnchor.x + 11;
                    var yMax = roomAnchor.y + 11;
                    for (var x = roomAnchor.x - 1; x <= xMax; x++) {
                        for (var y = roomAnchor.y - 1; y <= yMax; y++) {
                            if (x == roomAnchor.x - 1 || y == roomAnchor.y - 1 || x == xMax || y == yMax) {
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
                        //TODO: this can break if the bunker is too close to the controller
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
                            for (var source of sources) {
                                if (!Memory.roomsPersistent[room].roomPlanning.sourceLinks.includes(source.id)) {

                                    //find nearby container
                                    let sourceContainer = source.pos.findClosestByRange(FIND_STRUCTURES, {
                                        filter: (structure) => { return structure.structureType == STRUCTURE_CONTAINER 
                                            && source.pos.inRangeTo(structure, 2)
                                        }
                                    });

                                    if (sourceContainer && sourceContainer.length > 0) {
                                        //once a source not in the memory is found, route to it and build a link on the last step of the route
                                        let pathToContainer = roomAnchor.findPathTo(sourceContainer.pos, {range: 1, ignoreCreeps: true})
                                        let closestPosition = new RoomPosition(pathToContainer[pathToContainer.length - 1]["x"], pathToContainer[pathToContainer.length - 1]["y"], room);

                                        
                                        if (closestPosition.createConstructionSite(STRUCTURE_LINK) == 0) {
                                            Memory.roomsPersistent[room].roomPlanning.sourceLinks.push(source.id);
                                            
                                            //remove sourceContainer if a link is successfully built
                                            if (sourceContainer) {
                                                sourceContainer.destroy();
        
                                                //do our cache a favor and remove the id
                                                let array = Memory.roomsCache[room].structures.containers;
                                                let index = array.indexOf(sourceContainer.id);
                                                if (index > -1) {
                                                    array.splice(index, 1);
                                                    Memory.roomsCache[room].structures.containers = array;
                                                }
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                //TODO: too tired to make this any good.
                if (roomController.level >= 6) {
                    if (!Memory.roomsPersistent[room].roomPlanning.mineralRoadsBuilt) {
                        Memory.roomsPersistent[room].roomPlanning.mineralRoadsBuilt = true;

                        //define corners of the bunker
                        let topRight = new RoomPosition(roomAnchor.x + 10, roomAnchor.y, room);
                        let topLeft = new RoomPosition(roomAnchor.x, roomAnchor.y, room);
                        let bottomLeft = new RoomPosition(roomAnchor.x, roomAnchor.y + 10, room);
                        let bottomRight = new RoomPosition(roomAnchor.x + 10, roomAnchor.y + 10, room);

                        let topMiddle = new RoomPosition(roomAnchor.x + 5, roomAnchor.y, room);
                        let bottomMiddle = new RoomPosition(roomAnchor.x + 5, roomAnchor.y + 10, room);
                        let leftMiddle = new RoomPosition(roomAnchor.x, roomAnchor.y + 5, room);
                        let rightMiddle = new RoomPosition(roomAnchor.x + 10, roomAnchor.y + 5, room);
                        let corners = [topRight, topLeft, bottomLeft, bottomRight, topMiddle, bottomMiddle, leftMiddle, rightMiddle];

                        //don't path there if it is a wall
                        for (let i in corners) {
                            let look = corners[i].lookFor(LOOK_TERRAIN);
                            if (look == "wall") {
                                corners.splice(i, 1);
                            }
                        }

                        let roadSites = [];

                        var travelMineral = Game.rooms[room].find(FIND_MINERALS);
                        
                        //build roads from the closest corner to the mineral
                        for (var min of travelMineral) {
                            let selectedCorner = min.pos.findClosestByPath(corners, {ignoreCreeps: true});
                            let pathToMin = selectedCorner.findPathTo(min, {range: 1, ignoreCreeps: true});
                            let containerPos = new RoomPosition(pathToMin[pathToMin.length - 1]["x"], pathToMin[pathToMin.length - 1]["y"], room);
                            containerPos.createConstructionSite(STRUCTURE_CONTAINER);
                            roadSites.push(pathToMin);
                        }

                        for (var sites of roadSites) {
                            for (var site of sites) {
                                Game.rooms[room].createConstructionSite(site.x, site.y, STRUCTURE_ROAD);
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
            if (maxToBuild > BUNKER[structureConstant]["pos"].length) maxToBuild = BUNKER[structureConstant]["pos"].length;

            //calculate the number to build
            let numToBuild = maxToBuild - (numExist + numBuilding);
            
            if (numExist + numBuilding < maxToBuild) {
                //build the structure
                let index = numExist + numBuilding;
                for (let i = 0; i < numToBuild; i++) {
                    let pos = BUNKER[structureConstant]["pos"][index + i];
                    Game.rooms[room].createConstructionSite(new RoomPosition(roomAnchor.x + pos["x"], roomAnchor.y + pos["y"], room), structureConstant);
                }
            }
        }
    }
};

module.exports = systemRoomPlanner2;