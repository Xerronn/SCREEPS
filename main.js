const profiler = require('screeps-profiler');

const systemUI = require('system.ui');
const systemMemory = require('system.memory');
const systemSpawner = require('system.spawner');
const systemRoomPlanner = require('system.roomPlanner');
const systemTaskManager = require('system.taskManager');

profiler.enable();
module.exports.loop = function () {
    profiler.wrap(function() {
        var spawns = Object.keys(Game.spawns);
        var creeps = Object.keys(Game.creeps);
        //in case of no existing spawns or creeps
        if (spawns.length == 0 && creeps.length == 0) {
            return;
        }
        //clear memory of dead creeps
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
        
        for (var spawn of spawns) {
            if (Game.spawns[spawn].hits < Game.spawns[spawn].hitsMax) {
                console.log("EMERGENCY ACTIVATING SAFE MODE");
                Game.spawns[spawn].room.controller.activateSafeMode();
            }
        }

        //in case of respawn
        systemMemory.run();

        if (Memory.roomsCache) {
            systemSpawner.run();
            //rework UI
            systemUI.run();
            systemRoomPlanner.run();
        } else {
            console.log("System tasks skipped due to absence of memory");
        }

        //task assignment:
        systemTaskManager.run();
    });
}