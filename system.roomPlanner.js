var systemRoomPlanner = {
    run: function() {
        if (!Memory.gameStages["excluded"]) {
            Memory.gameStages["excluded"] = ["E44N23", "E45N22"];
        }
        let myRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller.my && !Memory.gameStages["excluded"].includes(room) && Game.rooms[room].find(FIND_MY_SPAWNS)[0]);
        for (let room of myRooms) {
            if (Memory.gameStages[room].rank < Game.rooms[room].controller.level) {
                //tell the room that more extensions need to be made
                Memory.gameStages[room].extensionsMaxed = false;
                let roomSpawn = Game.rooms[room].find(FIND_STRUCTURES, {
                    filter: (structure) => {return structure.structureType == STRUCTURE_SPAWN}})[0];
                let sources = Game.rooms[room].find(FIND_SOURCES);
                console.log("room planning to do!");
                //BUILDS EXTENSIONS AT EACH CONTROLLER LEVEL
                if (Memory.gameStages[room].extensionsMaxed) {
                    if (!Memory.gameStages[room].buildingSpots) {
                        Memory.gameStages[room].buildingSpots = {};
                        //check what tiles to build a grid on
                        let grid = (roomSpawn.pos.x + roomSpawn.pos.y) % 2;
                        //find terrain at area
                        var rDown = 6;
                        var rRight = 6;
                        var rUp = 6;
                        var rLeft = 6;
                        if (roomSpawn.pos.x - 6 < 0) {
                            rLeft = 6 - Math.abs((roomSpawn.pos.x - 6));
                            rRight = 12 - rLeft;
                        }
                        if (roomSpawn.pos.y - 6 < 0) {
                            rUp = 6 - Math.abs((roomSpawn.pos.y - 6));
                            rDown = 12 - rUp;
                        }
                        if (roomSpawn.pos.x + 6 > 49) {
                            rRight = 6 - Math.abs((roomSpawn.pos.x + 6 - 49));
                            rLeft = 12 - rRight;
                        }
                        if (roomSpawn.pos.y + 6 > 49) {
                            rDown = 6 - Math.abs((roomSpawn.pos.y + 6 - 49));
                            rUp = 12 - rDown;
                        }
                        var terrain = Game.rooms[room].lookAtArea(parseInt(roomSpawn.pos.y) - rUp, parseInt(roomSpawn.pos.x) - rLeft, parseInt(roomSpawn.pos.y) + rDown, parseInt(roomSpawn.pos.x) + rRight, true);
                        
                        var extSpots = [];
                        var rdSpots = [];
                        var rampSpots = [];
                        for (var pos of terrain) {
                            //find available spots in a grid
                            if (pos["type"] == "terrain" && pos["terrain"] != "wall" && ((pos["x"] + pos["y"]) % 2 != grid)) {
                                extSpots.push(new RoomPosition(pos["x"], pos["y"], room));
                            } else if (pos["type"] == "terrain" && pos["terrain"] != "wall" && ((pos["x"] + pos["y"]) % 2 == grid)) {
                                rdSpots.push(new RoomPosition(pos["x"], pos["y"], room));
                            }
                            if (pos["type"] == "terrain" && pos["terrain"] != "wall" && 
                            [parseInt(roomSpawn.pos.x) - rLeft, parseInt(roomSpawn.pos.x) + rRight].includes(pos['x']) ||
                            [parseInt(roomSpawn.pos.y) - rUp, parseInt(roomSpawn.pos.y) + rDown].includes(pos['y'])) {
                                rampSpots.push(new RoomPosition(pos["x"], pos["y"], room));
                            }
                        }
                        //decided not to store objects, but strings instead
                        var extSpotsSorted = _.sortBy(extSpots, (pos) => pos.findPathTo(roomSpawn).length);
                        var rdSpotsSorted = _.sortBy(rdSpots, (pos) => pos.findPathTo(roomSpawn).length);
                        Memory.gameStages[room].buildingSpots["extensions"] = [];
                        Memory.gameStages[room].buildingSpots["roads"] = [];
                        Memory.gameStages[room].buildingSpots["ramparts"] = [];
                        for (let pos of extSpotsSorted) {
                            Memory.gameStages[room].buildingSpots["extensions"].push(pos.x + "," + pos.y);
                        }
                        for (let pos of rdSpotsSorted) {
                            Memory.gameStages[room].buildingSpots["roads"].push(pos.x + "," + pos.y);
                        }
                        for (let pos of rampSpots) {
                            Memory.gameStages[room].buildingSpots["ramparts"].push(pos.x + "," + pos.y);
                        }
                    }
                    //Actual building of the extensions
                    let numExt = Game.rooms[room].find(FIND_STRUCTURES, {
                        filter: (structure) => {return structure.structureType == STRUCTURE_EXTENSION}}).length;
                    let numBuildingExt = Game.rooms[room].find(FIND_MY_CONSTRUCTION_SITES, {
                        filter: (structure) => {return structure.structureType == STRUCTURE_EXTENSION}}).length;
                    let maxExt = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][Game.rooms[room].controller.level];
                    let extToBuild = maxExt - (numExt + numBuildingExt);
                    while (extToBuild > 0) {
                        let rdStringPos = Memory.gameStages[room].buildingSpots["roads"].shift();
                        let extStringPos = Memory.gameStages[room].buildingSpots["extensions"].shift();
                        Game.rooms[room].createConstructionSite(new RoomPosition(rdStringPos.split(",")[0], rdStringPos.split(",")[1], room), STRUCTURE_ROAD);
                        Game.rooms[room].createConstructionSite(new RoomPosition(extStringPos.split(",")[0], extStringPos.split(",")[1], room), STRUCTURE_EXTENSION);
                        extToBuild--;
                    }
                    //BUILDS TOWERS WHEN IT CAN IN THE PLACE OF AN EXT
                    let numTower = Game.rooms[room].find(FIND_STRUCTURES, {
                        filter: (structure) => {return structure.structureType == STRUCTURE_TOWER}}).length;
                    let numBuildingTower = Game.rooms[room].find(FIND_MY_CONSTRUCTION_SITES, {
                        filter: (structure) => {return structure.structureType == STRUCTURE_TOWER}}).length;
                    let maxTower = CONTROLLER_STRUCTURES[STRUCTURE_TOWER][Game.rooms[room].controller.level];
                    let towersToBuild = maxTower - (numTower + numBuildingTower);
                    while (towersToBuild > 0) {
                        let rdStringPos = Memory.gameStages[room].buildingSpots["roads"].shift();
                        let extStringPos = Memory.gameStages[room].buildingSpots["extensions"].shift();
                        let rdSuccess = Game.rooms[room].createConstructionSite(new RoomPosition(rdStringPos.split(",")[0], rdStringPos.split(",")[1], room), STRUCTURE_ROAD);
                        let extSuccess = Game.rooms[room].createConstructionSite(new RoomPosition(extStringPos.split(",")[0], extStringPos.split(",")[1], room), STRUCTURE_TOWER);
                        if (rdSuccess == 0 && extSuccess == 0) {
                            towersToBuild--;
                        }
                    }

                    //make sure there is nothing left to build
                    numExt = Game.rooms[room].find(FIND_STRUCTURES, {
                        filter: (structure) => {return structure.structureType == STRUCTURE_EXTENSION}}).length;
                    numBuildingExt = Game.rooms[room].find(FIND_MY_CONSTRUCTION_SITES, {
                        filter: (structure) => {return structure.structureType == STRUCTURE_EXTENSION}}).length;
                    extToBuild = maxExt - (numExt + numBuildingExt);
                    if (extToBuild == 0) {
                        Memory.gameStages[room].extensionsMaxed = true;
                    }
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
                //BUILDS ROADS AT CONTROLLER LEVEL 3
                if (Game.rooms[room].controller.level == 3) {
                    if (!Memory.gameStages[room].roadsBuilt) {
                        let sourcePaths = [];
                        for (var i in sources) {
                            sourcePaths.push(roomSpawn.pos.findPathTo(sources[i].pos, {range: 1}));
                        }
                        sourcePaths.push(roomSpawn.pos.findPathTo(Game.rooms[room].controller.pos, {range: 1}));
                        for (var posList of sourcePaths) {
                            for (var pos of posList) {
                                Game.rooms[room].createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
                            }
                        }
                        Memory.gameStages[room].roadsBuilt = true;
                    }
                }
                //BUILDS RAMPARTS AT CONTROLLER LEVEL 4
                if (Game.rooms[room].controller.level == 4) {
                    if (!Memory.gameStages[room].rampartsBuilt) {
                        for (var pos of Memory.gameStages[room].buildingSpots["ramparts"]) {
                            console.log(pos);
                            Game.rooms[room].createConstructionSite(new RoomPosition(pos.split(",")[0], pos.split(",")[1], room), STRUCTURE_RAMPART);
                        }
                        Memory.gameStages[room].rampartsBuilt = true;
                    }
                }

                Memory.gameStages[room].rank = Game.rooms[room].controller.level;
            } 
        }
    }
};

module.exports = systemRoomPlanner;