var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var source = Game.getObjectById(creep.memory.assignedSource);
        var container = Game.getObjectById(creep.memory.assignedContainer);

        if (container) {
            
            //if it has a container, just sit on it bruh
            if (creep.pos.inRangeTo(source, 1) && creep.pos.inRangeTo(container, 0)) {
                creep.harvest(source);
            } else {
                creep.moveTo(container);
            }
        } else {
            //if there is no container, you gotta do the work yourself m8
            //used for stage before containers and storage
            if (creep.store.getUsedCapacity() == 0) {
                creep.memory.mining = true;
            } else if (creep.store.getFreeCapacity() == 0) {
                creep.memory.mining = false;
            }

            if (creep.memory.mining) {
                if (creep.pos.inRangeTo(source, 1)) {
                    creep.harvest(source);
                } else {
                    creep.moveTo(source);
                }
            } else {
                //fill spawn and extensions
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
                    //fill container
                    var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType == STRUCTURE_CONTAINER &&
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > creep.store.getUsedCapacity(RESOURCE_ENERGY)}
                            });
                    if(target) {
                        if (creep.pos.inRangeTo(target, 1)) {
                            creep.transfer(target, RESOURCE_ENERGY);
                        } else {
                            creep.moveTo(target);
                        }
                    } else {
                        //last ditch is to fill tower
                        var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return structure.structureType == STRUCTURE_TOWER &&
                                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > creep.store.getCapacity()}
                                });
                        if(target) {
                            if (creep.pos.inRangeTo(target, 1)) {
                                creep.transfer(target);
                            } else {
                                creep.moveTo(target);
                            }
                        }
                    }
                }
            }
        }
	}
};

module.exports = roleMiner;