var systemMemory = {
    run: function() {
        //PERSISTENT DATA
        if (!Memory.roomsPersistent) {
            Memory.roomsPersistent = {}
        }
        let myRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller && Game.rooms[room].controller.my && Game.rooms[room].controller.level > 0);
        for (let room of myRooms) {
            //whether or not the extensions need filling in this room
            if (!Memory.roomsPersistent[room]){
                Memory.roomsPersistent[room] = {};
            }
            if (!Memory.roomsPersistent[room].extensionsFilled) {
                Memory.roomsPersistent[room].extensionsFilled = false;
            }
            if (Game.rooms[room].energyAvailable < Game.rooms[room].energyCapacityAvailable) {
                Memory.roomsPersistent[room].extensionsFilled = false;
            } else {
                Memory.roomsPersistent[room].extensionsFilled = true;
            }

            //PERSISTENT SOURCE MEMORY
            if (!Memory.roomsPersistent[room].sources) {
                Memory.roomsPersistent[room].sources = {};
                let sources = Game.rooms[room].find(FIND_SOURCES).map(source => source.id);
                for (let source of sources) {
                    Memory.roomsPersistent[room].sources[source] = {};
                }
            }
        }
        
        
        //ROOM CAHE MEMMORY
        if (!Memory.roomsCache) {
            Memory.roomsCache = {};
            console.log("Room Memory reset");
            let myRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller.my);
            for (let room of myRooms) {
                //init a room memory for each room
                if (!Memory.roomsCache[room]) {
                    Memory.roomsCache[room] = {};
                }
                //STATISTICS
                if (!Memory.roomsCache[room]["stats"]) {
                    Memory.roomsCache[room]["stats"] = {};
                    Memory.roomsCache[room]["stats"].lastUpdate = Game.time;
                    if (Game.rooms[room].storage) {
                        Memory.roomsCache[room]["stats"].storedEnergy = Game.rooms[room].storage.store.getUsedCapacity(RESOURCE_ENERGY);
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
                        Memory.roomsCache[room]["stats"].storedEnergy = totalEnergy;
                    }
                }
                //STRUCTURE MEMORY
                if (!Memory.roomsCache[room]["structures"]) {
                    Memory.roomsCache[room]["structures"] = {};
                    var currentRoom = Memory.roomsCache[room]["structures"];
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
            delete Memory.roomsCache;
            console.log("Memory Updated");            
        };
    }
};

module.exports = systemMemory;