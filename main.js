const profiler = require('screeps-profiler');

const systemUI = require('system.ui');
const systemMemory = require('system.memory');
const systemSpawner = require('system.spawner');

const roleTransporter = require('role.transporter');
const roleMaintainer = require('role.maintainer');
const roleExtractor = require('role.extractor');
const roleReserver = require('role.reserver');
const roleUpgrader = require('role.upgrader');
const roleAttacker = require('role.attacker');
const roleManager = require('role.manager');
const roleBuilder = require('role.builder');
const roleLinker = require('role.linker');
const roleWaller = require('role.waller');
const roleMiner = require('role.miner');

const structureTower = require('structure.tower');
const structureLink = require('structure.link');

//remote roles for controllers without spawns
const roleRemoteBuilder = require('role.remoteBuilder');
const roleRemoteUpgrader = require('role.remoteUpgrader');
const roleRemoteDefender = require('role.remoteDefender');

profiler.enable();
module.exports.loop = function () {
    profiler.wrap(function() {
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
        if (Memory.rooms) {
            systemSpawner.run();
        } else {
            console.log("Spawner tasks skipped due to absence of memory");
        }

        //task assignment:
        for (var name in Game.creeps) {
            var creep = Game.creeps[name];
            switch (creep.memory.role) {
                case 'miner':
                    roleMiner.run(creep);
                    break;
                case 'waller':
                    roleWaller.run(creep);
                    break;
                case 'linker':
                    roleLinker.run(creep);
                    break;
                case 'builder':
                    roleBuilder.run(creep);
                    break;
                case 'attacker':
                    roleAttacker.run(creep);
                    break;
                case 'manager':
                    roleManager.run(creep);
                    break;
                case 'reserver':
                    roleReserver.run(creep);
                    break;
                case 'upgrader':
                    roleUpgrader.run(creep);
                    break;
                case 'extractor':
                    roleExtractor.run(creep);
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
    });
}