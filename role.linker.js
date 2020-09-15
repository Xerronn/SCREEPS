var roleLinker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var storage = Game.getObjectById(creep.memory.assignedStorage);
        var link = Game.getObjectById(creep.memory.assignedLink);

        if (creep.store.getUsedCapacity() == 0) {
            creep.memory.mining = true;
        } else if (creep.store.getFreeCapacity() == 0) {
            creep.memory.mining = false;
        }
        if (creep.memory.mining) {
            if (creep.pos.inRangeTo(storage, 1)) {
                creep.withdraw(storage, RESOURCE_ENERGY);
            } else {
                creep.moveTo(storage);
            }
        } else {
            if (creep.pos.inRangeTo(link, 1)) {
                creep.transfer(link, RESOURCE_ENERGY);
            } else {
                creep.moveTo(link);
            }
        }
    }
};

module.exports = roleLinker;