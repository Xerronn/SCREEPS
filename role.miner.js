var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var source = Game.getObjectById(creep.memory.assignedSource);
        var container = Game.getObjectById(creep.memory.assignedContainer);
        var link = Game.getObjectById(creep.memory.assignedLink);
        //miners build their own container
        if (!container) {
            var containerSite = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {
                filter: (structure) => {return structure.structureType == STRUCTURE_CONTAINER && structure.pos.inRangeTo(source, 3)}})[0];
        }
        if (!link) {
            var linkSite = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {
                filter: (structure) => {return structure.structureType == STRUCTURE_LINK && structure.pos.inRangeTo(source, 3)}})[0];
            //figure out how to switch to link after finishing building
        }

        if (link) {
            //if it has a link, just sit on it even harder
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
                if (creep.pos.inRangeTo(link, 1)) {
                    creep.transfer(link, RESOURCE_ENERGY);
                } else {
                    creep.moveTo(link, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        } else {
            if (container) {
                //rush to build linkSite if possible
                if (linkSite) {
                    if (creep.pos.inRangeTo(linkSite, 1)) {
                        creep.build(linkSite);
                    } else {
                        creep.moveTo(linkSite, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }  
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
                    //rush to build own container
                    if (containerSite) {
                        if (creep.pos.inRangeTo(containerSite, 1)) {
                            creep.build(containerSite);
                        } else {
                            creep.moveTo(containerSite, {visualizePathStyle: {stroke: '#ffffff'}});
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
                                } else {
                                    if (creep.pos.inRangeTo(creep.room.controller, 1)) {
                                        //creep.signController(controller, "Born of God and Void. You shall seal the blinding light that plagues their dreams.")
                                        creep.upgradeController(creep.room.controller);
                                    } else {
                                        creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
	}
};

module.exports = roleMiner;