var systemMemory = {
    run: function() {
        //GAMESTAGE DATA
        if (!Memory.gameStages) {
            Memory.gameStages = {}
        }
        let myRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller && Game.rooms[room].controller.my && Game.rooms[room].controller.level > 0);
            for (let room of myRooms) {
                if (!Memory.gameStages[room]) {
                    Memory.gameStages[room] = {};
                    Memory.gameStages[room].roadsBuilt = false;
                    if (Game.rooms[room].controller.my) {
                        Memory.gameStages[room].rank = Game.rooms[room].controller.level;
                    } else {
                        Memory.gameStages[room].rank = -1;
                    } 
                }   
            }

        //ROOM MEMMORY
        if (!Memory.rooms) {
            Memory.rooms = {};
            console.log("Room Memory reset");
            let myRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller.my);
            for (let room of myRooms) {
                //init a room memory for each room
                if (!Memory.rooms[room]) {
                    Memory.rooms[room] = {};
                }
                //STATISTICS
                if (!Memory.rooms[room]["stats"]) {
                    Memory.rooms[room]["stats"] = {};
                    Memory.rooms[room]["stats"].lastUpdate = Game.time;
                    if (Game.rooms[room].storage) {
                        Memory.rooms[room]["stats"].storedEnergy = Game.rooms[room].storage.store.getUsedCapacity(RESOURCE_ENERGY);
                    } else {
                            var storages = Game.rooms[room].find(FIND_STRUCTURES, {
                                filter: (structure) => {
                                    return [STRUCTURE_CONTAINER, STRUCTURE_STORAGE].includes(structure.structureType);
                                }
                            });
                            var totalEnergy = 0;
                            for (let storage of storages) {
                                totalEnergy += storage.store.getUsedCapacity();
                            }
                        Memory.rooms[room]["stats"].storedEnergy = totalEnergy;
                    }
                }
                //SOURCE MEMORY
                if (!Memory.rooms[room]["sources"]) {
                    Memory.rooms[room]["sources"] = {};
                    var sources = Game.rooms[room].find(FIND_SOURCES);

                    for (var i in sources) {
                        let openSpots = [];
                        let terrain = Game.rooms[room].lookAtArea(sources[i].pos.y - 1, sources[i].pos.x - 1, sources[i].pos.y + 1, sources[i].pos.x + 1, true);
                        for (var j in terrain) {
                            if (terrain[j]["type"] == "terrain" && terrain[j]["terrain"] != "wall") {
                                openSpots.push(terrain[j]['x'] + "," + terrain[j]['y']);
                            }
                        }
                        let container;
                        let link;
                        let buildings = Game.rooms[room].lookForAtArea(LOOK_STRUCTURES, sources[i].pos.y - 2, sources[i].pos.x - 2, sources[i].pos.y + 2, sources[i].pos.x + 2, true);
                        for (var j in buildings) {
                            if (buildings[j]["structure"].structureType == STRUCTURE_CONTAINER) {
                                container = buildings[j]["structure"].id;
                            }
                            if (buildings[j]["structure"].structureType == STRUCTURE_LINK) {
                                link = buildings[j]["structure"].id;
                            }
                        }
                        if (!container) {
                            container = "none";
                        }
                        if (!link) {
                            link = "none";
                        }
                        if (!Memory.rooms[room]["sources"][sources[i].id]) {
                            Memory.rooms[room]["sources"][sources[i].id] = {};
                        }
                        Memory.rooms[room]["sources"][sources[i].id]["positions"] = openSpots;
                        Memory.rooms[room]["sources"][sources[i].id]["container"] = container;
                        Memory.rooms[room]["sources"][sources[i].id]["link"] = link;
                    }
                } 
                //STRUCTURE MEMORY
                if (!Memory.rooms[room]["structures"]) {
                    Memory.rooms[room]["structures"] = {};
                    var currentRoom = Memory.rooms[room]["structures"];
                    var walls = Game.rooms[room].find(FIND_STRUCTURES, {
                        filter: (structure) => structure.structureType == STRUCTURE_WALL});

                    var roads = Game.rooms[room].find(FIND_STRUCTURES, {
                        filter: (structure) => structure.structureType == STRUCTURE_ROAD});
                    
                    var ramparts = Game.rooms[room].find(FIND_STRUCTURES, {
                        filter: (structure) => structure.structureType == STRUCTURE_RAMPART});
        
                    var containers = Game.rooms[room].find(FIND_STRUCTURES, {
                        filter: (structure) => structure.structureType == STRUCTURE_CONTAINER});
        
                    var towers = Game.rooms[room].find(FIND_STRUCTURES, {
                        filter: (structure) => structure.structureType == STRUCTURE_TOWER});

                    var links = Game.rooms[room].find(FIND_STRUCTURES, {
                        filter: (structure) => structure.structureType == STRUCTURE_LINK});
                    
                        var spawns = Game.rooms[room].find(FIND_MY_SPAWNS);
                    
                    if (!currentRoom["walls"]) {
                        currentRoom["walls"] = [];
                    }
                    for (var i in walls) {
                        currentRoom["walls"].push(walls[i].id);
                    }

                    if (!currentRoom["roads"]) {
                        currentRoom["roads"] = [];
                    }
                    for (var i in roads) {
                        currentRoom["roads"].push(roads[i].id);
                    }

                    if (!currentRoom["ramparts"]) {
                        currentRoom["ramparts"] = [];
                    }
                    for (var i in ramparts) {
                        currentRoom["ramparts"].push(ramparts[i].id);
                    }
                    
                    if (!currentRoom["containers"]) {
                        currentRoom["containers"] = [];
                    }
                    for (var i in containers) {
                        currentRoom["containers"].push(containers[i].id);
                    }
                    
                    if (!currentRoom["towers"]) {
                        currentRoom["towers"] = [];
                    }
                    for (var i in towers) {
                        currentRoom["towers"].push(towers[i].id);
                    }

                    if (!currentRoom["links"]) {
                        currentRoom["links"] = {};
                    }
                    if (!currentRoom["links"]["storage"]) {
                        currentRoom["links"]["storage"] = [];
                        currentRoom["links"]["controller"] = [];
                        currentRoom["links"]["container"] = [];
                        currentRoom["links"]["none"] = [];
                        currentRoom["links"]["all"] = {};
                    }
                    for (var i in links) {
                        if (!currentRoom["links"]["all"][links[i].id]) {
                            currentRoom["links"]["all"][links[i].id] = {};
                        }
                        //define what the behavior of the link should be
                        let nearestBuilding = links[i].pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (structure) => { return structure.structureType != STRUCTURE_LINK 
                                && [STRUCTURE_STORAGE, STRUCTURE_CONTROLLER, STRUCTURE_CONTAINER].includes(structure.structureType)
                                && links[i].pos.inRangeTo(structure, 5)
                            }});
                        if (nearestBuilding) {
                            switch(nearestBuilding.structureType) {
                                case STRUCTURE_STORAGE:
                                    currentRoom["links"]["storage"].push(links[i].id);
                                    currentRoom["links"]["all"][links[i].id]["type"] = "storage";
                                    break;
                                case STRUCTURE_CONTROLLER:
                                    currentRoom["links"]["controller"].push(links[i].id);
                                    currentRoom["links"]["all"][links[i].id]["type"] = "controller";
                                    break;
                                case STRUCTURE_CONTAINER:
                                    currentRoom["links"]["container"].push(links[i].id);
                                    currentRoom["links"]["all"][links[i].id]["type"] = "container";
                                    break;
                            }
                        } else {
                            currentRoom["links"]["none"].push(links[i].id);
                            currentRoom["links"]["all"][links[i].id]["type"] = "none";
                        }
                    }

                    if (!currentRoom["spawns"]) {
                        currentRoom["spawns"] = [];
                    }
                    for (var i in spawns) {
                        currentRoom["spawns"].push(spawns[i].id)
                    }
                    //do the rest of the structures
                }
            }
        }

        //refresh memory every x ticks
        if (!Memory.lastUpdate || Memory.lastUpdate + 250 < Game.time) {
            Memory.lastUpdate = Game.time;
            delete Memory.rooms;
            console.log("Memory Updated");            
        };
    }
};

module.exports = systemMemory;