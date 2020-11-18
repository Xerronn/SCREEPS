const work = require('creep.work');
const combat = require('creep.combat');

const structureTower = require('structure.tower');
const structureLink = require('structure.link');

var systemTaskManager = {
    run: function() {
        //task assignment:
        for (var name in Game.creeps) {
            var creep = Game.creeps[name];
            switch (creep.memory.type) {
                case 'worker':
                    work.run(creep);
                    break;
                case 'attacker':
                    combat.run(creep);
                    break;
            }
        }
        //loop through all rooms
        var myRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller && Game.rooms[room].controller.my);
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
};

module.exports = systemTaskManager;