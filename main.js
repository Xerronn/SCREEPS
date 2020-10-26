const profiler = require('screeps-profiler');

const systemUI = require('system.ui');
const systemMemory = require('system.memory');
const systemSpawner = require('system.spawner');
const systemRoomPlanner = require('system.roomPlanner');
const systemTaskManager = require('system.taskManager');

const systemInit = require('system.init');

profiler.enable();
module.exports.loop = function () {
        var spawns = Object.keys(Game.spawns);
        var creeps = Object.keys(Game.creeps);
        //in case of no existing spawns or creeps
        if (spawns.length == 0 && creeps.length == 0) {
            return;
        }
        //clear memory of dead creeps
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                //remove the assigned worker from assignedSource memory
                try {
                    if (Memory.creeps[name].assignedSource) {
                        let assignedSource = Game.getObjectById(Memory.creeps[name].assignedSource);
                        let array = Memory.roomsPersistent[assignedSource.room.name].sources[assignedSource.id].workers;
                        let index = array.indexOf(name);
                        if (index > -1) {
                            array.splice(index, 1)
                            Memory.roomsPersistent[assignedSource.room.name].sources[assignedSource.id].workers = array;
                        }
                    }
                } catch (err) {
                    //TODO: figure out how to avoid errors
                }
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
        
        //needs rework
        for (var spawn of spawns) {
            if (Game.spawns[spawn].hits < Game.spawns[spawn].hitsMax) {
                console.log("EMERGENCY ACTIVATING SAFE MODE");
                Game.spawns[spawn].room.controller.activateSafeMode();
            }
        }

        //in case of respawn
        systemMemory.run();

        // if (Memory.roomsCache) {
        //     systemSpawner.run();
        //     //rework UI
        //     systemUI.run();
        //     systemRoomPlanner.run();
        // } else {
        //     console.log("System tasks skipped due to absence of memory");
        // }

        // //task assignment:
        systemInit.run();
        systemTaskManager.run();
        
        //pixelsss
        // if (Game.cpu["bucket"] > 9000) {
        //     Game.cpu.generatePixel();
        // }
    //});
}