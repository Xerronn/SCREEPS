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
                //I don't want them to mine rn
                //add in early game logic
            }
        } else {
            if (creep.memory.target == "none") {
                var walls = Memory.rooms[creep.room.name]["structures"]["walls"].concat(
                    Memory.rooms[creep.room.name]["structures"]["ramparts"]).map(
                    (struc) => {return Game.getObjectById(struc)});
                creep.memory.target = _.sortBy(walls, (wall) => wall.hits/wall.hitsMax)[0].id;
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