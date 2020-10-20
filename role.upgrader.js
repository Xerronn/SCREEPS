var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (!creep.memory.link) {
            if (Memory.rooms[creep.room.name].structures.links.controller) {
                creep.memory.link = Memory.rooms[creep.room.name].structures.links.controller[0];
            } else {
                creep.memory.link = null;
            }
        } //ADD IN MEMORY FOR THIS

        var link = Game.getObjectById(creep.memory.link);
        var storage = creep.room.storage;

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
            if (link || storage) {
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
                if (storage) {
                    if (creep.pos.inRangeTo(storage, 1)) {
                        creep.withdraw(storage, RESOURCE_ENERGY);
                    } else {
                        creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffffff'}});
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
                        if (creep.pos.inRangeTo(target, 1)) {
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