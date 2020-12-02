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
            global.MY_ROOMS_TERMINAL = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller && Game.rooms[room].controller.my && Game.rooms[room].terminal);

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
        }  
    }
};

module.exports = systemGlobals;