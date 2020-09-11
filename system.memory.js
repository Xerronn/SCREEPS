var systemMemory = {
    run: function() {
        //refresh memory every x ticks
        if (!Memory.lastUpdate || Memory.lastUpdate + 1000 < Game.time) {
            Memory.lastUpdate = Game.time;            
        };

        //STRUCTURE MEMORY
        //
        if (!Memory.structures) {
            Memory.structures = {};
            console.log("YEEEEEEET");
        }
        if (!Memory.structures[Game.spawns['French Armada From Spain'].room]) {
            Memory.structures[Game.spawns['French Armada From Spain'].room] = {};
            
            var walls = Game.spawns['French Armada From Spain'].room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_WALL});
            console.log(walls);

            for (var i in walls) {
                if (!Memory.structures[Game.spawns['French Armada From Spain'].room]["walls"]) {
                    Memory.structures[Game.spawns['French Armada From Spain'].room]["walls"] = {};
                }
                Memory.structures[Game.spawns['French Armada From Spain'].room]["walls"][walls[i]] = parseInt(walls[i].hits || 0);
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
                if (!Memory.sources[Game.spawns['French Armada From Spain'].room][sources[i]]) {
                    Memory.sources[Game.spawns['French Armada From Spain'].room][sources[i]] = {};
                }
                Memory.sources[Game.spawns['French Armada From Spain'].room][sources[i]]["positions"] = openSpots;
            }
        }
    }

};

module.exports = systemMemory;