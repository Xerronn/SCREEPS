var roleMaintainer= {
    /** @param {Creep} creep **/
    run: function(creep) {
        //check if storage exists
        var storage = creep.room.storage;
        var room = creep.pos.roomName;

        if (creep.store.getUsedCapacity() == 0){
            creep.memory.mining = true;
        } else if (creep.store.getFreeCapacity() == 0) {
            creep.memory.mining = false;
        }

	    if(creep.memory.mining) {
            creep.memory.target = "none";
            //if it does exist try to pull from it
            if(storage) {
                if (creep.pos.inRangeTo(storage, 1)) {
                    creep.withdraw(storage, RESOURCE_ENERGY);
                } else {
                    creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffffff'}});
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
                    if (creep.pos.inRangeTo(target, 1)) {
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
            if (storage) {
                //prioritize towers if there is a storage
                if (!creep.memory.target || creep.memory.target == "none") {
                    creep.memory.target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_TOWER) && 
                                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                        }
                    });
                    if (!creep.memory.target) creep.memory.target = "none";
                }
                if(creep.memory.target != "none" && Game.getObjectById(creep.memory.target.id).store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    if (creep.pos.inRangeTo(Game.getObjectById(creep.memory.target.id), 1)) {
                        creep.transfer(Game.getObjectById(creep.memory.target.id), RESOURCE_ENERGY);
                    } else {
                        creep.moveTo(Game.getObjectById(creep.memory.target.id), {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                    
                } else {
                    creep.memory.target = "none";
                    //fill spawns/extensions only if not being attacked
                    if (Memory.roomsPersistent[room].attackStatus == false) {
                        if (!creep.memory.target || creep.memory.target == "none") {
                            creep.memory.target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                                filter: (structure) => {
                                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}
                                });
                            if (!creep.memory.target) creep.memory.target = "none";
                        }
                        if(creep.memory.target != "none" && Game.getObjectById(creep.memory.target.id).store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                            if (creep.pos.inRangeTo(Game.getObjectById(creep.memory.target.id), 1)) {
                                creep.transfer(Game.getObjectById(creep.memory.target.id), RESOURCE_ENERGY);
                            } else {
                                creep.moveTo(Game.getObjectById(creep.memory.target.id), {visualizePathStyle: {stroke: '#ffffff'}});
                            }
                        }
                    }
                }
            } else {
                //fill spawns/extensions first to prevent softlocking
                if (Memory.roomsPersistent[room].attackStatus == false) {
                    if (!creep.memory.target || creep.memory.target == "none") {
                        creep.memory.target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}
                            });
                        if (!creep.memory.target) creep.memory.target = "none";
                    }
                }
                if(creep.memory.target != "none" && Game.getObjectById(creep.memory.target.id).store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    if (creep.pos.inRangeTo(Game.getObjectById(creep.memory.target.id), 1)) {
                        creep.transfer(Game.getObjectById(creep.memory.target.id), RESOURCE_ENERGY);
                    } else {
                        creep.moveTo(Game.getObjectById(creep.memory.target.id), {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else {
                    //towers last
                    if (!creep.memory.target || creep.memory.target == "none") {
                        creep.memory.target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_TOWER) && 
                                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                            }
                        });
                        if (!creep.memory.target) creep.memory.target = "none";
                    }
                    if(creep.memory.target != "none" && Game.getObjectById(creep.memory.target.id).store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        if (creep.pos.inRangeTo(Game.getObjectById(creep.memory.target.id), 1)) {
                            creep.transfer(Game.getObjectById(creep.memory.target.id), RESOURCE_ENERGY);
                        } else {
                            creep.moveTo(Game.getObjectById(creep.memory.target.id), {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                }
            }
        }
    }
};

module.exports = roleMaintainer;