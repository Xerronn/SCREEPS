var roleTransporter = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var container = Game.getObjectById(creep.memory.assignedContainer);

        //this makes the transporter have free time between emptying the containers
        if (container.store.getUsedCapacity() > container.store.getCapacity() / 2) {
            creep.memory.useContainer = true;
        } else if (container.store.getUsedCapacity() < creep.store.getCapacity()) {
            creep.memory.useContainer = false;
        }

        if (creep.store.getUsedCapacity() == 0) {
            creep.memory.mining = true;
        } else if (creep.store.getFreeCapacity() == 0) {
            creep.memory.mining = false;
        }

	    if(creep.memory.mining) {
            //if the container is up for mining right now use container
            if (creep.memory.useContainer) {
                if (creep.pos.inRangeTo(container, 1)) {
                    creep.withdraw(container, RESOURCE_ENERGY);
                } else {
                    creep.moveTo(container);
                }
            //otherwise use the storage
            } else {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_STORAGE &&
                            structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                if (targets.length > 0) {
                    if (creep.pos.inRangeTo(targets[0], 1)) {
                        creep.withdraw(targets[0], RESOURCE_ENERGY);
                    } else {
                        creep.moveTo(targets[0]);
                    }
                } else {
                    //use container as last option
                    if (creep.pos.inRangeTo(container, 1)) {
                        creep.withdraw(container, RESOURCE_ENERGY);
                    } else {
                        creep.moveTo(container);
                    }
                }
            }
        } else {
            //check if the spawn or extensions need to be filled
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
                //check to see if the storage needs filling
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_STORAGE &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                if(targets.length > 0) {
                    if (creep.pos.inRangeTo(targets[0], 1)) {
                        creep.transfer(targets[0], RESOURCE_ENERGY);
                    } else {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
        }
	}
};

module.exports = roleTransporter;