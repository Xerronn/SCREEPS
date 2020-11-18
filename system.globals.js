const systemMemory = require("./system.memory");

var systemGlobals = {
    run: function() {
        if (!global.INITIALIZED) {
            //global declarations of some things
            global.INITIALIZED = true;
            
            //CONSTANTS
            global.MY_ROOMS = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller && Game.rooms[room].controller.my && Game.rooms[room].controller.level > 0);
            global.MY_ROOMS_TERMINAL = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller && Game.rooms[room].controller.my && Game.rooms[room].terminal);

            //TASKS
            global.TASK_HARVEST_ENERGY = "harvest_energy"; //implemented
            global.TASK_HARVEST_ENERGY_DROP = "harvest_energy_drop"; //implemented
            global.TASK_HARVEST_ENERGY_LINK = "harvest_energy_link"; //implemented
            global.TASK_HARVEST_MINERAL = "harvest_mineral";
            global.TASK_HARVEST_MINERAL_DROP = "harvest_mineral_drop";
            global.TASK_WITHDRAW_STORAGE = "withdraw_storage"; //implemented
            global.TASK_WITHDRAW_CONTAINER = "withdraw_container"; //implemented
            global.TASK_TRANSPORT_ENERGY = "transport_energy"; //implemented
            global.TASK_TRANSPORT_MINERALS = "transport_minerals";
            global.TASK_SALVAGE = "salvage"; //implemented
            
            global.TASK_FILL_EXTENSION = "fill_extension"; //implemented
            global.TASK_FILL_TOWER = "fill_tower"; //implemented
            global.TASK_FILL_STORAGE = "fill_storage"; //implemented
            global.TASK_FILL_TERMINAL = "fill_terminal";
            global.TASK_FILL_CONTAINER = "fill_container";//TODO

            global.TASK_UPGRADE = "upgrade"; //implemented
            global.TASK_UPGRADE_LINK = "upgrade_link"; //implemented
            global.TASK_BUILD = "build"; //implemented
            global.TASK_MANAGE_LINK = "manage_link"; //implemented
            global.TASK_REPAIR = "repair"; //implemented
            global.TASK_REPAIR_WALL = "repair_wall"; //implemented

            global.TASK_RENEW = "renew";
            global.TASK_REMOTE = "remote"; //implemented
            global.TASK_ROOM_SIGN = "sign"; //implemented
            global.TASK_ROOM_CLAIM = "claim"; //implemented
            global.TASK_ROOM_RESERVE = "reserve";

            global.TASK_COMBAT_MELEE_DEFEND = "melee_defend";

            //COLORS
            global.COLOR_ENERGY_GET = "dae028";
            global.COLOR_ENERGY_SPEND = "1dde20";
            global.COLOR_ATTACK = "ff1900";
            global.COLOR_MOVE = "ffffff";

            global.help = function () {
                let functions = ["claimRoom", "synchCreepCounts", "removeConstructionSites", "refreshAllStructures", "resetAllStats", "toggleUI", "changeTasksForRole"];
                
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

            global.changeTasksForRole = function(role, tasks) {
                let selectedCreeps = _.filter(Game.creeps, creep => creep.memory.role == role);
                for (let selected of selectedCreeps) {
                    selected.memory.tasks = tasks;
                }
                return "Changed tasks for " + selectedCreeps.length + " creeps!"
            }
        }
    }
};

module.exports = systemGlobals;