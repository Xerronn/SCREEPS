var roleBuilder= {

    /** @param {Creep} creep **/
    run: function(creep) {
		
        if (creep.store.getUsedCapacity() == 0){
            creep.memory.mining = true;
        } else if (creep.store.getFreeCapacity() == 0) {
            creep.memory.mining = false;
        }

	    if(creep.memory.mining) {
            //check for any containers with resources to pull from
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return [STRUCTURE_STORAGE].includes(structure.structureType) &&
                    structure.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getCapacity();
                }
            });
            if(targets.length > 0) {
                if (creep.pos.inRangeTo(targets[0], 1)) {
                    creep.withdraw(targets[0], RESOURCE_ENERGY);
                } else {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
                //if there are no containers to pull from, mine instead
            } else {
                //I don't want them to mine rn
            }
        }
        else {
            //first build things
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length > 0) {
                if (creep.pos.inRangeTo(targets[0], 1)) {
                    creep.build(targets[0]);
                } else {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
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
        }
	}
};

module.exports = roleBuilder;