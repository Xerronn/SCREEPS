var systemUI = require('system.ui');
var systemSpawner = require('system.spawner');
var systemMemory = require('system.memory');

var roleTransporter = require('role.transporter');
var roleMiner = require('role.miner');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleMaintainer = require('role.maintainer');
var roleTower = require('role.tower');


module.exports.loop = function () {
    //clear memory of dead creeps
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    systemMemory.run();
    systemUI.run();
    systemSpawner.run();

    //task assignment:
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        switch (creep.memory.role) {
            case 'miner':
                roleMiner.run(creep);
                break;
            case 'upgrader':
                roleUpgrader.run(creep);
                break;
            case 'builder':
                roleBuilder.run(creep);
                break;
            case 'maintainer':
                roleMaintainer.run(creep);
                break;
            case 'transporter':
                roleTransporter.run(creep);
                break;
        }
    }

    var towers = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_TOWER;
        }
    });

    for (var tower of towers) {
        roleTower.run(tower);
    }

}