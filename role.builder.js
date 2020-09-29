var roleBuilder= {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        //state control over gathering/working
        if (creep.store.getUsedCapacity() == 0){
            creep.memory.mining = true;
        } else if (creep.store.getFreeCapacity() == 0) {
            creep.memory.mining = false;
        }

        var storage = creep.room.storage;
	    if(creep.memory.mining) {
            //if there is a storage, operations as normal
            if(storage) {
                //only move there if there is energy to grab
                if (storage.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getFreeCapacity()) {
                    if (creep.pos.inRangeTo(storage, 1)) {
                        creep.withdraw(storage, RESOURCE_ENERGY);
                    } else {
                        creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } 
            } else {
                // if there isn't a storage, use early game mode and prioritization
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return [STRUCTURE_CONTAINER].includes(structure.structureType) &&
                        structure.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getFreeCapacity();
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
        } else {
            //if there is a storage, operations as normal
            if (storage) {
                //first build things
                var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(targets.length > 0) {
                    var target = _.sortBy(targets, (t) => t.pos.getRangeTo(creep))[0];
                    if (creep.pos.inRangeTo(target, 1)) {
                        creep.build(target);
                    } else {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else {
                    //if there is nothing to build, refill extensions
                    var targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                        }
                    });
                    if(targets.length > 0) {
                        if (creep.pos.inRangeTo(targets[0], 1)) {
                            creep.transfer(targets[0], RESOURCE_ENERGY);
                        } else {
                            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    } else {
                        //last ditch thing is to upgrade controller before death
                        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                        if (creep.pos.inRangeTo(creep.room.controller, 3)) {
                            creep.upgradeController(creep.room.controller);
                        } else {
                            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                }
            } else {
                //if no storage
                //first refill extensions
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                if(targets.length > 0) {
                    if (creep.pos.inRangeTo(targets[0], 1)) {
                        creep.transfer(targets[0], RESOURCE_ENERGY);
                    } else {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
               
                } else {
                     //second
                    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                    if(targets.length > 0) {
                        var target = _.sortBy(targets, (t) => t.pos.getRangeTo(creep))[0];
                        if (creep.pos.inRangeTo(target, 1)) {
                            creep.build(target);
                        } else {
                            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    } else {
                        //last ditch thing is to upgrade controller before death
                        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                        if (creep.pos.inRangeTo(creep.room.controller, 3)) {
                            creep.upgradeController(creep.room.controller);
                        } else {
                            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                }
            }
        }
	}
};

module.exports = roleBuilder;