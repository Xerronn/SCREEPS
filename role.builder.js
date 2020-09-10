// var roleBuilder = {

//     /** @param {Creep} creep **/
//     run: function(creep) {

// 	    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
//             creep.memory.building = false;
//             creep.say('🔄 harvest');
// 	    }
// 	    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
// 	        creep.memory.building = true;
// 	        creep.say('🚧 build');
// 	    }

// 	    if(creep.memory.building) {
// 	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
//             if(targets.length) {
//                 if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
//                     creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
//                 }
//             }
// 	    }
// 	    else {
// 	        var sources = creep.room.find(FIND_SOURCES);
//             if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
//                 creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffaa00'}});
//             }
// 	    }
// 	}
// };

// module.exports = roleBuilder;

var roleBuilder= {

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
		
        if (creep.store.getUsedCapacity() == 0){
            creep.memory.mining = true;
        } else if (creep.store.getFreeCapacity() == 0) {
            creep.memory.mining = false;
        }

	    if(creep.memory.mining) {
            //check for any containers with resources to pull from
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER &&
                    structure.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getCapacity();
                }
            });
            if(targets.length > 0) {
                if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
                //if there are no containers to pull from, mine instead
            } else {
                var sources = creep.room.find(FIND_SOURCES);
                if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(targets.length) {
                    if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else {
                    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
        }
	}
};

module.exports = roleBuilder;