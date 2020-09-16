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
            if (creep.pos.inRangeTo(creep.room.controller, 3)) {
                creep.upgradeController(creep.room.controller);
            } else {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            if (link) {
                if (creep.pos.inRangeTo(link, 1)) {
                    creep.withdraw(link, RESOURCE_ENERGY);
                } else {
                    creep.moveTo(link);
                }
            } else {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return [STRUCTURE_CONTAINER].includes(structure.structureType) &&
                        structure.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getCapacity();
                    }
                });           
                if(targets.length > 0) {
                    var target = _.sortBy(targets, (t) => t.pos.getRangeTo(creep))[0];
                    if (creep.pos.inRangeTo(targets[0], 1)) {
                        creep.withdraw(target, RESOURCE_ENERGY);
                    } else {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
        }
	}
};

module.exports = roleUpgrader;