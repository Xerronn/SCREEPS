var systemMemory = {
    run: function() {
        //refresh memory every x ticks
        if (!Memory.lastUpdate || Memory.lastUpdate + 1000 < Game.time) {
            Memory.lastUpdate = Game.time;
            console.log("Memory Updated");            
        };

        //the start of refreshing memory on construction site death
        // var targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {
        //     filter: (structure) => {
        //         return structure.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getCapacity();
        //     }
        // });
        // if(targets.length > 0) {
        //     if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        //         creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
        //     }
        //     //if there are no containers to pull from, mine instead
        // }

        //STRUCTURE MEMORY
        //I should probably restructure it so it goes Memory -> room -> structures/sources/update etc
        if (!Memory.structures) {
            Memory.structures = {};
            console.log("Structure Memory Reset");
        }
        if (!Memory.structures[Game.spawns['French Armada From Spain'].room]) {
            Memory.structures[Game.spawns['French Armada From Spain'].room] = {};
            var currentRoom = Memory.structures[Game.spawns['French Armada From Spain'].room];
            
            var walls = Game.spawns['French Armada From Spain'].room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_WALL});

            var containers = Game.spawns['French Armada From Spain'].room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE});

            var towers = Game.spawns['French Armada From Spain'].room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_TOWER});

            for (var i in walls) {
                if (!Memory.structures[Game.spawns['French Armada From Spain'].room]["walls"]) {
                    Memory.structures[Game.spawns['French Armada From Spain'].room]["walls"] = {};
                }
                currentRoom["walls"][walls[i]] = walls[i];
            }

            for (var i in containers) {
                if (!currentRoom["containers"]) {
                    currentRoom["containers"] = {};
                }
                currentRoom["containers"][containers[i]] = containers[i];
            }

            for (var i in towers) {
                if (!currentRoom["towers"]) {
                    currentRoom["towers"] = {};
                }
                currentRoom["towers"][towers[i]] = towers[i]
            }
            //do the rest of the structures
        }

        //SOURCE MEMORY
        //inits memory for sources
        if (!Memory.sources) {
            Memory.sources = {};
        }
        //inits memory for sources per room TODO: needs to work for more than just the one room
        if (!Memory.sources[Game.spawns['French Armada From Spain'].room]) {
            Memory.sources[Game.spawns['French Armada From Spain'].room] = {};

            var sources = Game.spawns['French Armada From Spain'].room.find(FIND_SOURCES);
            for (var i in sources) {
                let openSpots = 0;
                let terrain = Game.spawns['French Armada From Spain'].room.lookAtArea(sources[i].pos.y - 1, sources[i].pos.x - 1, sources[i].pos.y + 1, sources[i].pos.x + 1, true);
                for (var j in terrain) {
                    if (terrain[j]["type"] == "terrain" && terrain[j]["terrain"] != "wall") {
                        openSpots++;
                    }
                }
                var container;
                let buildings = Game.spawns['French Armada From Spain'].room.lookForAtArea(LOOK_STRUCTURES, sources[i].pos.y - 1, sources[i].pos.x - 1, sources[i].pos.y + 1, sources[i].pos.x + 1, true);
                for (var j in buildings) {
                    if (buildings[j]["structure"].structureType == STRUCTURE_CONTAINER) {
                        container = buildings[j]["structure"]
                    }
                }
                if (!container) {
                    container = "none"
                }
                if (!Memory.sources[Game.spawns['French Armada From Spain'].room][sources[i]]) {
                    Memory.sources[Game.spawns['French Armada From Spain'].room][sources[i]] = {};
                }
                Memory.sources[Game.spawns['French Armada From Spain'].room][sources[i]]["positions"] = openSpots;
                Memory.sources[Game.spawns['French Armada From Spain'].room][sources[i]]["container"] = container;
            }
        }
    }

};

module.exports = systemMemory;