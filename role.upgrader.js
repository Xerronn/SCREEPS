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

        var storage = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_STORAGE;
            }
        });

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
            // if there is a link, just worry about the controller
            if (link) {
                if (creep.pos.inRangeTo(creep.room.controller, 3)) {
                    creep.upgradeController(creep.room.controller);
                } else {
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                //if there isn't a link, fill spawns/extensions first
                var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}
                        });
        
                if(target) {
                    if (creep.pos.inRangeTo(target, 1)) {
                        creep.transfer(target, RESOURCE_ENERGY);
                    } else {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else {
                    //upgrade second
                    if (creep.pos.inRangeTo(creep.room.controller, 3)) {
                        creep.upgradeController(creep.room.controller);
                    } else {
                        creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
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
                if (storage.length > 0) {
                    if (creep.pos.inRangeTo(storage[0], 1)) {
                        creep.withdraw(storage[0], RESOURCE_ENERGY);
                    } else {
                        creep.moveTo(storage[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else {
                    //find container to pull from if no link exists
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
                    } else {
                        //if there is no containers to pull from
                        var source = creep.pos.findClosestByPath(FIND_SOURCES);
                        if (source) {
                            if (creep.pos.inRangeTo(source, 1)) {
                                creep.harvest(source);
                            } else {
                                creep.moveTo(source);
                            }
                        }
                    }
                }
            }
        }
	}
};

module.exports = roleUpgrader;