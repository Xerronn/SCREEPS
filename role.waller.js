var roleWaller= {

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
            creep.memory.target = "none";
            var storage = creep.room.storage;
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
            if (creep.memory.target == "none") {
                var walls = Memory.rooms[creep.room.name]["structures"]["walls"].concat(
                    Memory.rooms[creep.room.name]["structures"]["ramparts"]).map(
                    (struc) => {return Game.getObjectById(struc)});
                creep.memory.target = _.sortBy(walls, function(wall) {
                    if (wall != null) {
                        if (wall.structureType == STRUCTURE_WALL) {
                            return wall.hits / wall.hitsMax;
                        } else {
                            return wall.hits / (wall.hitsMax * 10);
                        }
                    }
                })[0].id;
            }
            try {
                var target = Game.getObjectById(creep.memory.target);
                if (creep.pos.inRangeTo(target, 1)) {
                    creep.repair(target, RESOURCE_ENERGY);
                } else {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } catch (err) {
                creep.memory.target = "none";
            }
        }      
	}
};

module.exports = roleWaller;