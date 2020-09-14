var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        var spawn = creep.room.controller;
        if (spawn) {
            var targets = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return [STRUCTURE_LINK].includes(structure.structureType);
                }
            });
            if(targets.length > 0) {
                var link = spawn.pos.findInRange(targets,6)[0];
            }
        }
        //WORKING ON REWORKING THE UPGRADER
        //console.log(link);
        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            if (creep.pos.inRangeTo(link, 1)) {
                creep.withdraw(link, RESOURCE_ENERGY);
            } else {
                creep.moveTo(link);
            }
        }
	}
};

module.exports = roleUpgrader;