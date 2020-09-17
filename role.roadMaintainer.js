var roleMaintainer= {

    /** @param {Creep} creep **/
    run: function(creep) {
        //if creep is about to die, transfer its energy to a container
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
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > creep.store.getCapacity();
                }
            });
            if(targets.length > 0) {
                if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                //I don't want them to mine rn
            }
        }

        
	}
};

module.exports = roleMaintainer;