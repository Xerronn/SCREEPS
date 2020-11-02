const systemMemory = require("./system.memory");

var systemGlobals = {
    run: function() {
        //global declarations of some things
        global.INITIALIZED = true;
        global.TASK_HARVEST = "harvest"; //implemented
        global.TASK_HARVEST_DROP = "harvest_drop"; //implemented
        global.TASK_HARVEST_LINK = "harvest_link"; //implemented
        global.TASK_WITHDRAW_STORAGE = "withdraw_storage"; //implemented
        global.TASK_WITHDRAW_CONTAINER = "withdraw_container"; //implemented
        global.TASK_TRANSPORT = "transport"; //implemented
        
        global.TASK_FILL_EXTENSION = "fill_extension"; //implemented
        global.TASK_FILL_TOWER = "fill_tower"; //implemented
        global.TASK_FILL_STORAGE = "fill_storage"; //implemented
        global.TASK_FILL_CONTAINER = "fill_container";//TODO

        global.TASK_UPGRADE = "upgrade"; //implemented
        global.TASK_UPGRADE_LINK = "upgrade_link"; //implemented
        global.TASK_BUILD = "build"; //implemented
        global.TASK_MANAGE_LINK = "manage_link"; //implemented
        global.TASK_REPAIR = "repair"; //implemented
        global.TASK_REPAIR_WALL = "repair_wall"; //implemented

        global.TASK_REMOTE = "remote"; //task placed in highest priority to move a creep to a distance room
        global.TASK_ROOM_CLAIM = "claim";
        global.TASK_ROOM_RESERVE = "reserve";

        //color constants for actions
        global.COLOR_ENERGY_GET = "dae028";
        global.COLOR_ENERGY_SPEND = "1dde20";
        global.COLOR_ATTACK = "ff1900";
        global.COLOR_MOVE = "ffffff";

        global.help = function () {
            let functions = ["synchCreepCounts", "removeConstructionSites", "refreshAllStructures"];
            
            for (func of functions) {
                console.log(func);
            }
            return functions.length + " functions available!";

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
    }
};

module.exports = systemGlobals;