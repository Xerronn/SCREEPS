var systemMemory = {
    run: function() {
        //PERSISTENT DATA
        if (!Memory.roomsPersistent) {
            Memory.roomsPersistent = {}
        }
        var myRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller && Game.rooms[room].controller.my && Game.rooms[room].controller.level > 0);
        for (let room of myRooms) {
            //initialization of the persistent room memory
            if (!Memory.roomsPersistent[room]){
                Memory.roomsPersistent[room] = {};
                
                //room planning stuff
                Memory.roomsPersistent[room].roomPlanning = {};
                Memory.roomsPersistent[room].roomPlanning.rank = 0;
            }
            
            //creep counts
            if (!Memory.roomsPersistent[room].creepCounts) {
                Memory.roomsPersistent[room].creepCounts = {};
            }
            
            //whether or not the extensions need filling in this room
            if (!Memory.roomsPersistent[room].extensionsFilled) {
                Memory.roomsPersistent[room].extensionsFilled = false;
            }
            if (Game.rooms[room].energyAvailable < Game.rooms[room].energyCapacityAvailable) {
                Memory.roomsPersistent[room].extensionsFilled = false;
            } else {
                Memory.roomsPersistent[room].extensionsFilled = true;
            }

            //whether or not the towers need filling in this room
            //only execute if cache exists
            if (Memory.roomsCache && Memory.roomsCache.structures) {
                if (!Memory.roomsPersistent[room].towersFilled) {
                    Memory.roomsPersistent[room].towersFilled = false;
                }

                let towerArray = Memory.roomsCache[room].structures.towers.map(tower => Game.getObjectById(tower));
                let isFilled = true;
                for (let tower of towerArray) {
                    if (tower.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        isFilled = false;
                    }
                }
                Memory.roomsPersistent[room].towersFilled = isFilled;
            }

            //PERSISTENT SOURCE MEMORY
            if (!Memory.roomsPersistent[room].sources) {
                Memory.roomsPersistent[room].sources = {};
                let sources = Game.rooms[room].find(FIND_SOURCES).map(source => source.id);
                for (let source of sources) {
                    Memory.roomsPersistent[room].sources[source] = {};
                }
            }

            //Room attack status
            if (!Memory.roomsPersistent[room].attackStatus || Game.time > Memory.roomsPersistent[room].attackStatusTimer + 150) {
                Memory.roomsPersistent[room].attackStatus = false;
            }
            let hostileCreeps = Game.rooms[room].find(FIND_HOSTILE_CREEPS);
            if (hostileCreeps.length > 0) {
                let eventLog = Game.rooms[room].getEventLog();
                let attackEvents = _.filter(eventLog, {event: EVENT_ATTACK});
                attackEvents.forEach(event => {
                    let target = Game.getObjectById(event.data.targetId);
                    if(target && target.my) {
                        Memory.roomsPersistent[room].attackStatus = true;
                        Memory.roomsPersistent[room].attackStatusTimer = Game.time;
                    }
                });
            }
        }
        
        
        //ROOM CACHE MEMORY
        if (!Memory.roomsCache) {
            Memory.roomsCache = {};
        }

        //iterate over each room
        for (var room of myRooms) {
            //init a room memory for each room
            if (!Memory.roomsCache[room]) {
                Memory.roomsCache[room] = {};
            }
            //STATISTICS
            if (!Memory.roomsCache[room]["stats"] || Memory.roomsCache[room].statisticsRefresh + 100 < Game.time) {
                Memory.roomsCache[room].statisticsRefresh = Game.time;
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

            //CONSTRUCTION SITES MEMORY
            if (!Memory.roomsCache[room].constructionSites || Memory.roomsCache[room].constructionSitesRefresh + 50 < Game.time) {
                Memory.roomsCache[room].constructionSitesRefresh = Game.time;
                Memory.roomsCache[room].constructionSites = Game.rooms[room].find(FIND_MY_CONSTRUCTION_SITES).map(site => site.id);
            }

            //STRUCTURE MEMORY
            if (!Memory.roomsCache[room]["structures"] || Memory.roomsCache[room].structureRefresh + 100 < Game.time) {
                Memory.roomsCache[room].structureRefresh = Game.time;
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
                            && [STRUCTURE_STORAGE, STRUCTURE_CONTROLLER].includes(structure.structureType)
                            && links[i].pos.inRangeTo(structure, 4)
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
                        }
                    } else {
                        if (links[i].pos.findInRange(FIND_SOURCES, 3).length > 0) {
                            currentRoom["links"]["container"].push(links[i].id);
                            currentRoom["links"]["all"][links[i].id]["type"] = "container";
                        } else {
                            currentRoom["links"]["none"].push(links[i].id);
                            currentRoom["links"]["all"][links[i].id]["type"] = "none"; 
                        }
                        
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
};

module.exports = systemMemory;