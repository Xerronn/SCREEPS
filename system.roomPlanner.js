var systemRoomPlanner = {
    run: function() {
        if (!Memory.gameStages["excluded"]) {
            Memory.gameStages["excluded"] = ["E44N23", "E45N22"];
        }
        let myRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller.my && !Memory.gameStages["excluded"].includes(room));
        for (let room of myRooms) {
            if (Memory.gameStages[room].rank < Game.rooms[room].controller.level) {
                //tell the room that more extensions need to be made
                Memory.gameStages[room].extensionsMaxed = false;
                let roomSpawn = Game.rooms[room].find(FIND_STRUCTURES, {
                    filter: (structure) => {return structure.structureType == STRUCTURE_SPAWN}})[0];
                let sources = Game.rooms[room].find(FIND_SOURCES);
                console.log("room planning to do!");
                //BUILDS EXTENSIONS AT EACH CONTROLLER LEVEL
                if (!Memory.gameStages[room].extensionsMaxed) {
                    if (!Memory.gameStages[room].buildingSpots) {
                        Memory.gameStages[room].buildingSpots = {};
                        //check what tiles to build a grid on
                        let grid = (roomSpawn.pos.x + roomSpawn.pos.y) % 2;
                        //find terrain at area
                        let terrain = Game.rooms[room].lookAtArea(roomSpawn.pos.y - 10, roomSpawn.pos.x - 10, roomSpawn.pos.y + 10, roomSpawn.pos.x + 10, true);
                        var extSpots = [];
                        var rdSpots = [];
                        for (var pos of terrain) {
                            //find available spots in a grid
                            if (pos["type"] == "terrain" && pos["terrain"] != "wall" && ((pos["x"] + pos["y"]) % 2 != grid)) {
                                extSpots.push(new RoomPosition(pos["x"], pos["y"], room));
                            } else if (pos["type"] == "terrain" && pos["terrain"] != "wall" && ((pos["x"] + pos["y"]) % 2 == grid)) {
                                rdSpots.push(new RoomPosition(pos["x"], pos["y"], room));
                            }
                        }
                        //decided not to store objects, but strings instead
                        var extSpotsSorted = _.sortBy(extSpots, (pos) => pos.getRangeTo(roomSpawn));
                        var rdSpotsSorted = _.sortBy(rdSpots, (pos) => pos.getRangeTo(roomSpawn));
                        console.log(extSpotsSorted);
                        Memory.gameStages[room].buildingSpots["extensions"] = [];
                        Memory.gameStages[room].buildingSpots["roads"] = [];
                        for (let pos of extSpotsSorted) {
                            Memory.gameStages[room].buildingSpots["extensions"].push(pos.x + "," + pos.y);
                        }
                        for (let pos of rdSpotsSorted) {
                            Memory.gameStages[room].buildingSpots["roads"].push(pos.x + "," + pos.y);
                        }
                    }
                    let numExt = Game.rooms[room].find(FIND_STRUCTURES, {
                        filter: (structure) => {return structure.structureType == STRUCTURE_EXTENSION}}).length;
                    let numBuildingExt = Game.rooms[room].find(FIND_MY_CONSTRUCTION_SITES, {
                        filter: (structure) => {return structure.structureType == STRUCTURE_EXTENSION}}).length;
                    let maxExt = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][Game.rooms[room].controller.level];
                    let extToBuild = maxExt - (numExt + numBuildingExt);
                    console.log(extToBuild);
                    for (let i = extToBuild; i > 0; i--) {
                        console.log(i);
                        let rdStringPos = Memory.gameStages[room].buildingSpots["roads"].shift();
                        let extStringPos = Memory.gameStages[room].buildingSpots["extensions"].shift();
                        console.log(rdStringPos);
                        console.log(extStringPos);
                        Game.rooms[room].createConstructionSite(new RoomPosition(rdStringPos.split(",")[0], rdStringPos.split(",")[1], room), STRUCTURE_ROAD);
                        Game.rooms[room].createConstructionSite(new RoomPosition(extStringPos.split(",")[0], extStringPos.split(",")[1], room), STRUCTURE_EXTENSION);
                    }
                    Memory.gameStages[room].extensionsMaxed = true;
                }
                //BUILDS CONTAINERS AT CONTROLLER LEVEL 2
                if (Game.rooms[room].controller.level == 2) {
                    if (!Memory.gameStages[room].containersBuilt) {
                        let closest = []
                        for (var i in sources) {
                            let positions = Memory.rooms[Game.rooms[room].name]["sources"][sources[i].id]["positions"].map(
                                (pos) => {return new RoomPosition(pos.split(",")[0], pos.split(",")[1], room)})
                            closest.push(roomSpawn.pos.findClosestByPath(positions));
                            
                        }
                        for (var close of closest) {
                            close.createConstructionSite(STRUCTURE_CONTAINER);
                        }
                        Memory.gameStages[room].containersBuilt = true;
                    }
                }
                //BUILDS ROADS AT CONTROLLER LEVEL 4
                if (Game.rooms[room].controller.level == 4) {
                    if (!Memory.gameStages[room].roadsBuilt) {
                        let sourcePaths = [];
                        for (var i in sources) {
                            sourcePaths.push(roomSpawn.pos.findPathTo(sources[i].pos));
                        }
                        sourcePaths.push(roomSpawn.pos.findPathTo(Game.rooms[room].controller.pos));
                        for (var posList of sourcePaths) {
                            for (var pos of posList) {
                                Game.rooms[room].createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
                            }
                        }
                        Memory.gameStages[room].roadsBuilt = true;
                    }
                }
                Memory.gameStages[room].rank = Game.rooms[room].controller.level;
            } 
        }
    }
};

module.exports = systemRoomPlanner;