const profiler = require('imports.screeps-profiler');
const traveler = require('imports.traveler');

const renderUI = require('system.ui');
const memoryHandler = require('system.memory');
const populationControl = require('system.spawner.new');
const roomPlanner = require('system.roomPlanner');
const logistics = require('system.logistics');
const taskExecution = require('system.taskManager');
const garbageCollection = require('system.garbageCollection');

const testSpawn = require("system.spawner.new");

const roomPrototypes = require("room.prototypes");
const initializeGlobals = require('system.globals');
console.log("[Global Reset]");


profiler.enable();
profiler.registerObject(StructureLink, 'Link');
profiler.registerObject(StructureTower, 'Tower');
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
        //TODO: make code CPU aware
        //memory cleanup
        garbageCollection.run();

        //memory init 
        memoryHandler.run();

        //testSpawn.run();

        //other system stuff
        if (Memory.roomsCache) {
            populationControl.run();
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