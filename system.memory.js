var systemMemory = {
    run: function() {
        //if the room memory doesn't exist, fill it up with data
        if (!Memory.rooms) {
            Memory.rooms = {};
            console.log("Room Memory reset");
            myRooms = Object.keys(Game.rooms);
            for (var room of myRooms) {
                //init a room memory for each room
                if (!Memory.rooms[room]) {
                    Memory.rooms[room] = {};
                }
                //SOURCE MEMORY
                if (!Memory.rooms[room]["sources"]) {
                    Memory.rooms[room]["sources"] = {};
                    var sources = Game.rooms[room].find(FIND_SOURCES);

                    for (var i in sources) {
                        let openSpots = 0;
                        let terrain = Game.rooms[room].lookAtArea(sources[i].pos.y - 1, sources[i].pos.x - 1, sources[i].pos.y + 1, sources[i].pos.x + 1, true);
                        for (var j in terrain) {
                            if (terrain[j]["type"] == "terrain" && terrain[j]["terrain"] != "wall") {
                                openSpots++;
                            }
                        }
                        let container;
                        let buildings = Game.rooms[room].lookForAtArea(LOOK_STRUCTURES, sources[i].pos.y - 1, sources[i].pos.x - 1, sources[i].pos.y + 1, sources[i].pos.x + 1, true);
                        for (var j in buildings) {
                            if (buildings[j]["structure"].structureType == STRUCTURE_CONTAINER) {
                                container = buildings[j]["structure"]
                            }
                        }
                        if (!container) {
                            container = "none"
                        }
                        if (!Memory.rooms[room]["sources"][sources[i]]) {
                            Memory.rooms[room]["sources"][sources[i]] = {};
                        }
                        Memory.rooms[room]["sources"][sources[i]]["positions"] = openSpots;
                        Memory.rooms[room]["sources"][sources[i]]["container"] = container;
                    }
                } 
                //STRUCTURE MEMORY
                if (!Memory.rooms[room]["structures"]) {
                    Memory.rooms[room]["structures"] = {};
                    var currentRoom = Memory.rooms[room]["structures"];
                    var walls = Game.rooms[room].find(FIND_STRUCTURES, {
                        filter: (structure) => structure.structureType == STRUCTURE_WALL});
        
                    var containers = Game.rooms[room].find(FIND_STRUCTURES, {
                        filter: (structure) => structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE});
        
                    var towers = Game.rooms[room].find(FIND_STRUCTURES, {
                        filter: (structure) => structure.structureType == STRUCTURE_TOWER});
        
                    for (var i in walls) {
                        if (!currentRoom["walls"]) {
                            currentRoom["walls"] = {};
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
            }
        }

        //refresh memory every x ticks
        if (!Memory.lastUpdate || Memory.lastUpdate + 1000 < Game.time) {
            Memory.lastUpdate = Game.time;
            delete Memory.rooms;
            console.log("Memory Updated");            
        };
    }
};

module.exports = systemMemory;