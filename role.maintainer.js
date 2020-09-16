var roleMaintainer= {

    /** @param {Creep} creep **/
    run: function(creep) {
        //if creep is about to die, transfer its energy to a container
        if (creep.ticksToDecay < 25) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }

        //check if storage exists
        var storage = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_STORAGE;
            }
        });

        if (creep.store.getUsedCapacity() == 0){
            creep.memory.mining = true;
        } else if (creep.store.getFreeCapacity() == 0) {
            creep.memory.mining = false;
        }

	    if(creep.memory.mining) {
            //if it does exist try to pull from it
            if(storage.length > 0) {
                if (creep.pos.inRangeTo(storage[0], 1)) {
                    creep.withdraw(storage[0], RESOURCE_ENERGY);
                } else {
                    creep.moveTo(storage[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                //pull from containers if there is no storage
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return [STRUCTURE_CONTAINER].includes(structure.structureType) &&
                        structure.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getFreeCapacity();
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
                    if (creep.pos.inRangeTo(source, 1)) {
                        creep.harvest(source);
                    } else {
                        creep.moveTo(source);
                    }
                }
            }
        } else {
            // if there is a storage, prioritize this way
            if (storage.length < 1) {
                //prioritize towers
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER) && 
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                if(targets.length > 0) {
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }

                } else {
                    //fill spawns/extensions
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
                    }
                }
            } else {
                //fill spawns/extensions first
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
                    //towers last
                    var targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_TOWER) && 
                                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                        }
                    });
                    if(targets.length > 0) {
                        if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                }
            }
        }
	}
};

module.exports = roleMaintainer;