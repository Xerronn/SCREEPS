var systemUI = require('system.ui');
var systemMemory = require('system.memory');
var systemSpawner = require('system.spawner');

var roleTransporter = require('role.transporter');
var roleMaintainer = require('role.maintainer');
var roleReserver = require('role.reserver');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleLinker = require('role.linker');
var roleMiner = require('role.miner');

var structureTower = require('structure.tower');
var structureLink = require('structure.link');

//remote roles for controllers without spawns
var roleRemoteUpgrader = require('role.remoteUpgrader');
var roleRemoteBuilder = require('role.remoteBuilder');
var roleRemoteDefender = require('role.remoteDefender');

module.exports.loop = function () {
    //clear memory of dead creeps
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    var spawns = Object.keys(Game.spawns);
    for (var spawn of spawns) {
        if (Game.spawns[spawn].hits < Game.spawns[spawn].hitsMax) {
            console.log("EMERGENCY ACTIVATING SAFE MODE");
            Game.spawns[spawn].room.controller.activateSafeMode();
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
            case 'linker':
                roleLinker.run(creep);
                break;
            case 'builder':
                roleBuilder.run(creep);
                break;
            case 'reserver':
                roleReserver.run(creep);
                break;
            case 'upgrader':
                roleUpgrader.run(creep);
                break;
            case 'maintainer':
                roleMaintainer.run(creep);
                break;
            case 'transporter':
                roleTransporter.run(creep);
                break;
            case 'remoteBuilder':
                roleRemoteBuilder.run(creep);
				break;
			case 'remoteDefender':
				roleRemoteDefender.run(creep);
				break;
            case 'remoteUpgrader':
                roleRemoteUpgrader.run(creep);
                break;
        }
    }
    //loop through all rooms
    myRooms = Object.keys(Game.rooms);
    for (var room of myRooms) {
        //find all structures in each room that have something to execute
        var structures = Game.rooms[room].find(FIND_STRUCTURES, {
            filter: (structure) => {
                return [STRUCTURE_TOWER, STRUCTURE_LINK].includes(structure.structureType);
            }
        });
        //execute for each structure
        for (var structure of structures) {
            switch (structure.structureType) {
                case STRUCTURE_TOWER:
                    structureTower.run(structure);
                    break;
                case STRUCTURE_LINK:
                    structureLink.run(structure);
                    break;
            }
        }
    }

}