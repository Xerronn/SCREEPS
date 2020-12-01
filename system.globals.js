const systemMemory = require("./system.memory");
const prototypeWork = require("./creep.prototypes.work");
const prototypeWorkHarvest = require("./creep.prototypes.work.harvest");
const prototypeWorkTransport = require("./creep.prototypes.work.transport");
const prototypeCombat = require("./creep.prototypes.combat");

var systemGlobals = {
    run: function() {
        if (!global.INITIALIZED) {
            //global declarations of some things
            global.INITIALIZED = true;
            
            //CONSTANTS
            global.MY_ROOMS = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller && Game.rooms[room].controller.my && Game.rooms[room].controller.level > 0);
            global.MY_ROOMS_TERMINAL = _.filter(Object.keys(Game.rooms), (room) => room != "E45N22" && Game.rooms[room].controller && Game.rooms[room].controller.my && Game.rooms[room].terminal);

            //CREEP PROTOTYPES
            prototypeWork.run();
            prototypeWorkHarvest.run();
            prototypeWorkTransport.run();
            prototypeCombat.run();

            //COLORS
            global.COLOR_ENERGY_GET = "dae028";
            global.COLOR_ENERGY_SPEND = "1dde20";
            global.COLOR_ATTACK = "ff1900";
            global.COLOR_MOVE = "ffffff";

            global.MINERALS = [
                RESOURCE_HYDROGEN,
                RESOURCE_OXYGEN,
                RESOURCE_UTRIUM,
                RESOURCE_LEMERGIUM,
                RESOURCE_KEANIUM,
                RESOURCE_ZYNTHIUM,
                RESOURCE_CATALYST,
                RESOURCE_GHODIUM
            ];

            global.BUNKER = {
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
    
                "road":{"pos":[{"x":0,"y":0},{"x":10,"y":0},{"x":0,"y":10},{"x":10,"y":10},{"x":3,"y":3}, {"x":5,"y":0},{"x":1,"y":1},{"x":4,"y":1},{"x":6,"y":1},
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
                "lab":{"pos":[{"x":8,"y":7},{"x":9,"y":7},{"x":7,"y":8},{"x":9,"y":8},{"x":10,"y":8},{"x":7,"y":9},{"x":8,"y":9},{"x":10,"y":9},{"x":8,"y":10},{"x":9,"y":10}]}};

            //global functions
            global.help = function () {
                let functions = ["claimRoom", "synchCreepCounts", "removeConstructionSites", 
                "refreshAllStructures", "resetAllStats", "toggleUI", "changeTasksForRole", "deleteOrders"];
                
                for (func of functions) {
                    console.log(func);
                }
                return functions.length + " functions available!";

            }

            global.claimRoom = function (room) {
                Memory.config.expansion.push(room);
                return room + " has been added to expansion targets";
            }

            global.synchCreepCounts = function () {
                var myRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller && Game.rooms[room].controller.my && Game.rooms[room].controller.level > 0);
                for (var room of myRooms) {
                    for (var role of Object.keys(Memory.roomsPersistent[room].creepCounts)) {
                        var count = _.filter(Game.creeps, (creep) => creep.memory.role == role && creep.memory.spawnRoom == room).length;
                        Memory.roomsPersistent[room].creepCounts[role] = count;
                    }
                }
                return "Creep counts synced!";
            }

            global.removeConstructionSites = function (room, count = 0) {
                //function to help test automatic building by alleviating the 100 cap
                var constructionSites = Game.rooms[room].find(FIND_MY_CONSTRUCTION_SITES);
                if (count == 0) {
                    count = constructionSites.length;
                }

                for (var i = 0; i < count; i++) {
                    constructionSites[i].remove();
                }
                return count + " Construction sites removed!";
            }

            global.refreshAllStructures = function () {
                var myRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller && Game.rooms[room].controller.my && Game.rooms[room].controller.level > 0);
                for (let room of myRooms) {
                    delete Memory.roomsCache[room].structures;
                }
                return "Deleted structure memory of " + myRooms.length + " rooms!";
            }

            global.resetAllStats = function () {
                let counter = 0;
                for (statRoom of Object.keys(Memory.roomsPersistent)) {
                    counter++;
                    delete Memory.roomsPersistent[statRoom].stats
                }
                return "Deleted stats memory of " + (counter - 1) + " rooms!";
            }

            global.toggleUI = function () {
                Memory.config.ui.enabled = !Memory.config.ui.enabled;
                if (Memory.config.ui.enabled) {
                    return "Enabled UI!";
                } else {
                    return "Disabled UI!";
                }
            }

            global.changeTasksForRole = function(role, tasks, room="all") {
                let selectedCreeps;

                if (room == "all") {
                    selectedCreeps = _.filter(Game.creeps, creep => creep.memory.role == role);
                } else {
                    selectedCreeps = _.filter(Game.creeps, creep => creep.memory.role == role && creep.spawnRoom == room);
                }

                for (let selected of selectedCreeps) {
                    selected.memory.tasks = tasks;
                }
                return "Changed tasks for " + selectedCreeps.length + " creeps!";
            }

            //TODO: everything
            global.drainTurrets = function(room) {
                //lol
                //Game.spawns["Spawn1"].spawnCreep([TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL], "test2", {memory: {type: "attacker", role: "driainer", assignedRoom: "E41N24", tasks: [TASK_COMBAT_HEAL_SELF, TASK_REMOTE, TASK_COMBAT_ATTACK_DRAIN]}});
                //Game.spawns["Spawn1"].spawnCreep([MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK], "test3", {memory: {type: "attacker", role: "roomKiller", assignedRoom: "E41N24", tasks: [TASK_REMOTE, TASK_COMBAT_ATTACK_ROOM]}});
            }

            /**
             * function to clear orders from any or all rooms
             * @param string room to remove orders from. Leave blank if all rooms
             */
            global.deleteOrders = function (room="all rooms") {
                let roomOrders;
                if (room == "all rooms") {
                    roomOrders = _.filter(Game.market.orders);
                } else {
                    roomOrders = _.filter(Game.market.orders, order => order.roomName == room);
                }

                for (order of roomOrders) {
                    Game.market.cancelOrder(order.id);
                }

                return "Deleted " + roomOrders.length + " orders from " + room + "!";
            }

            global.syncSourceCounts = function () {
                for (var room of Object.keys(Memory.roomsPersistent)) {
                    var creeps = Game.rooms[room].find(FIND_MY_CREEPS);

                    for (var source of Game.rooms[room].find(FIND_SOURCES)) {
                        //reset the value to 0 for each source in memory
                        Memory.roomsPersistent[room].sources[source.id].miners = [];
                        Memory.roomsPersistent[room].sources[source.id].transporters = [];
                        Memory.roomsPersistent[room].sources[source.id].workers = [];
                    }
                    for (var creep of creeps) {
                        if (creep.memory.role == "miner" || creep.memory.role == "transporter") {
                            if (creep.memory.assignedSource || creep.memory.assignedContainerSource) {
                                if (creep.memory.assignedSource) {
                                    Memory.roomsPersistent[room].sources[creep.memory.assignedSource].miners.push(creep.name);
                                }
                                if (creep.memory.assignedContainerSource) {
                                    Memory.roomsPersistent[room].sources[creep.memory.assignedContainerSource].transporters.push(creep.name);
                                }
                            }
                        } else {
                            if (creep.memory.assignedSource) {
                                Memory.roomsPersistent[room].sources[creep.memory.assignedSource].workers.push(creep.name);
                            }
                        }
                    }
                }
                return "Synced source worker counts!";
            }

            /**
             * function to replan a room into a bunker layout
             * @param string room to perform the action on
             * @param string action to perform. either anchor, roads, or structureType
             */
            global.rePlan = function(room, action = "anchor", numRebuild = 5) {
                if (action == "anchor") {
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
                                        if (wallCounter > 7) {
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
                        
                        //score is a function of how many walls are in the edges and distance to the centroid
                        var candidateScore = position.findPathTo(centroidPos).length + Math.pow(1.75, candidate["walls"]);
                        if (bestCandidate["score"] > candidateScore) {
                            bestCandidate["score"] = candidateScore;
                            bestCandidate["x"] = candidate["x"];
                            bestCandidate["y"] = candidate["y"];
                        }
                    }

                    //set the anchor to the best candidate
                    Game.rooms[room].visual.rect(bestCandidate.x, bestCandidate.y, 10, 10, {opacity: 0.4});
                    Memory.roomsPersistent[room].rePlanning = {};
                    Memory.roomsPersistent[room].rePlanning.anchor = bestCandidate;
                    return "Room replanning anchor set!"
                } else if (action == "bunkerRoads") {
                    if (!Memory.roomsPersistent[room].rePlanning && !Memory.roomsPersistent[room].rePlanning) {
                        return "No anchor set! Run anchor action first";
                    }
                    let roomAnchor = new RoomPosition(Memory.roomsPersistent[room].rePlanning.anchor.x, Memory.roomsPersistent[room].rePlanning.anchor.y, room);
                    for (var pos of BUNKER["road"]["pos"]) {
                        //do not build tunnels
                        let look = Game.rooms[room].lookAt(roomAnchor.x + pos["x"], roomAnchor.y + pos["y"], LOOK_TERRAIN);
                        if (look[look.length - 1]["terrain"] != "wall") {
                            Game.rooms[room].createConstructionSite(new RoomPosition(roomAnchor.x + pos["x"], roomAnchor.y + pos["y"], room), STRUCTURE_ROAD);
                            
                        }
                    }
                    return "Roads planned!"
                } else if (action == "roads") {
                    let roomAnchor = new RoomPosition(Memory.roomsPersistent[room].rePlanning.anchor.x, Memory.roomsPersistent[room].rePlanning.anchor.y, room);
                    let roads = Game.rooms[room].find(FIND_STRUCTURES, {filter:{structureType: STRUCTURE_ROAD}});

                    for (struc of roads) {
                        if (struc.pos.x < roomAnchor.x || struc.pos.x > roomAnchor.x + 10 || struc.pos.y < roomAnchor.y || struc.pos.y > roomAnchor.y + 10) {
                            struc.destroy();
                        }
                    }
               }  else {
                    let roomAnchor = new RoomPosition(Memory.roomsPersistent[room].rePlanning.anchor.x, Memory.roomsPersistent[room].rePlanning.anchor.y, room);

                    if (action == STRUCTURE_RAMPART) {
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
                        return "Ramparts built!";
                    }

                    //find how many exist
                    let exist = Game.rooms[room].find(FIND_STRUCTURES, {
                        filter: (structure) => {return structure.structureType == action}});
                    let numExist = exist.length;

                    //find how many are building
                    let numBuilding = Game.rooms[room].find(FIND_MY_CONSTRUCTION_SITES, {
                        filter: (structure) => {return structure.structureType == action}}).length;

                    //find how many are possible to build at the current level
                    let maxToBuild = CONTROLLER_STRUCTURES[action][Game.rooms[room].controller.level];
                    if (maxToBuild > BUNKER[action]["pos"].length) maxToBuild = BUNKER[action]["pos"].length;

                    if (numExist + numBuilding >= maxToBuild) {
                        let counter = 0;
                        for (struc of exist) {
                            if (counter > numRebuild - 1) {
                                break;
                            }
                            if (struc.pos.x < roomAnchor.x || struc.pos.x > roomAnchor.x + 10 && struc.pos.y < roomAnchor.y || struc.pos.y > roomAnchor.y + 10) {
                                struc.destroy();
                                counter++;
                            }
                        }
                        numExist -= numRebuild;
                    }
                    console.log(maxToBuild)
                    if (numExist + numBuilding < maxToBuild) {
                        //build the structure
                        console.log("yeet");
                        for (let i = 0; i < BUNKER[action]["pos"].length; i++) {
                            let pos = BUNKER[action]["pos"][i];
                            console.log(pos);
                            Game.rooms[room].createConstructionSite(new RoomPosition(roomAnchor.x + pos["x"], roomAnchor.y + pos["y"], room), action);
                        }
                    }

                    return "structures scheduled to build!";
                }
            }
        }  
    }
};

module.exports = systemGlobals;