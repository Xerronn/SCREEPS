const profiler = require('screeps-profiler');

const renderUI = require('system.ui');
const memoryHandler = require('system.memory');
const populationControl = require('system.spawner');
const roomPlanner = require('system.roomPlanner');
const taskExecution = require('system.taskManager');
const garbageCollection = require('system.garbageCollection');

const initializeGlobals = require('system.globals');
const initializeWorkPrototypes = require('creep.prototypes.work');
const initializeCombatPrototypes = require('creep.prototypes.combat');


profiler.enable();
module.exports.loop = function () {
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
            populationControl.run();
            //rework UI
            renderUI.run();
            roomPlanner.run();
        } else {
            console.log("System tasks skipped due to absence of memory");
        }
        //execute creep code
        taskExecution.run();
        
        //pixelsss
        if (Game.cpu["bucket"] > 9000) {
            Game.cpu.generatePixel();
        }
    });
}