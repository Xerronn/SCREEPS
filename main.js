const profiler = require('screeps-profiler');

const systemUI = require('system.ui');
const systemMemory = require('system.memory');
const systemSpawner = require('system.spawner');
const systemRoomPlanner = require('system.roomPlanner');
const systemTaskManager = require('system.taskManager');

const systemInit = require('system.init');

profiler.enable();
module.exports.loop = function () {
    //clear memory of dead creeps ALWAYS FIRST
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            //remove the assigned worker from assignedSource memory
            try {
                if (Memory.creeps[name].assignedSource) {
                    let assignedSource = Game.getObjectById(Memory.creeps[name].assignedSource);
                    let array = Memory.roomsPersistent[assignedSource.room.name].sources[assignedSource.id].workers;
                    let index = array.indexOf(name);
                    if (index > -1) {
                        array.splice(index, 1);
                        Memory.roomsPersistent[assignedSource.room.name].sources[assignedSource.id].workers = array;
                    }
                }
            } catch (err) {
                //TODO: figure out how to avoid errors when source is out of vision
            }
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    //initialize some variables used in main method
    var spawns = Object.keys(Game.spawns);
    var creeps = Object.keys(Game.creeps);
    //in case of no existing spawns or creeps
    if (spawns.length == 0 && creeps.length == 0) {
        return;
    }

    //some class definitions and constants
    systemInit.run();
    //for spawning during test:
    var simpleBuilder = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker' && _.isEqual(creep.memory.tasks, [TASK_HARVEST, TASK_FILL_EXTENSIONS, TASK_BUILD, TASK_UPGRADE]));
    var simpleUpgrader = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker' && _.isEqual(creep.memory.tasks, [TASK_HARVEST, TASK_FILL_EXTENSIONS, TASK_UPGRADE, TASK_BUILD]));
    if (simpleBuilder.length < 2) {
        let name = "chungus" + Game.time;
        Game.spawns["Spawn1"].spawnCreep([WORK,CARRY,MOVE,MOVE], name, {memory: {role: 'worker', tasks: [TASK_HARVEST, TASK_FILL_EXTENSIONS, TASK_BUILD, TASK_UPGRADE]}})
    }
    if (simpleUpgrader.length < 2) {
        let name = "big" + Game.time;
        Game.spawns["Spawn1"].spawnCreep([WORK,CARRY,MOVE,MOVE], name, {memory: {role:'worker', tasks: [TASK_HARVEST, TASK_FILL_EXTENSIONS, TASK_UPGRADE, TASK_BUILD]}})
    }
    
    ///TODO: needs rework
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
    
    systemTaskManager.run();
    
    //pixelsss
    // if (Game.cpu["bucket"] > 9000) {
    //     Game.cpu.generatePixel();
    // }
    //});
}