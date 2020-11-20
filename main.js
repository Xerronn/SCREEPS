const profiler = require('screeps-profiler');

const renderUI = require('system.ui');
const memoryHandler = require('system.memory');
const populationControl = require('system.spawner');
const roomPlanner = require('system.roomPlanner');
const logistics = require('system.logistics');
const taskExecution = require('system.taskManager');
const garbageCollection = require('system.garbageCollection');

const initializeGlobals = require('system.globals');
const initializeWorkPrototypes = require('creep.prototypes.work');
const initializeCombatPrototypes = require('creep.prototypes.combat');


//Sprofiler.enable();
module.exports.loop = function () {
    //memhack
    if(Game.time != global.memhack_lastTime) {
        if(global.memhack_lastTime && global.memhack_LastMemory && Game.time == (global.memhack_lastTime + 1)){
            delete global.Memory;
            global.Memory = global.memhack_LastMemory;
            RawMemory._parsed = global.memhack_LastMemory;
        }else{
            Memory;
            if(!Game.rooms['sim']) {
                global.memhack_LastMemory = RawMemory._parsed;
                global.memhack_lastTime = Game.time;
            }
        }
    } else {
        Memory;
        global.memhack_LastMemory = RawMemory._parsed;
        global.memhack_lastTime = Game.time;
    }
    
    profiler.wrap(function() {
        //initialization
        initializeGlobals.run();
        initializeWorkPrototypes.run();
        initializeCombatPrototypes.run();
        
        //memory cleanup
        garbageCollection.run();
        
        //check if the bot actually has anything to do
        var spawns = Object.keys(Game.spawns);
        var creeps = Object.keys(Game.creeps);
        if (spawns.length == 0 && creeps.length == 0) {
            //if there is nothing to control, do nothing
            return;
        }
        
        //memory init
        memoryHandler.run();

        //other system stuff
        if (Memory.roomsCache) {        
            populationControl.run(); //optimize!! using 1-3 CPU
            renderUI.run();
            roomPlanner.run();
        } else {
            console.log("System tasks skipped due to absence of memory");
        }
        //terminal logistics 
        logistics.run();
        
        //execute creep code
        taskExecution.run(); //optimize!! using 11-17 CPU!
        
        //pixelsss
        if (Game.cpu["bucket"] > 9000) {
            Game.cpu.generatePixel();
        }
    });
}