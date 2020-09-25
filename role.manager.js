var roleManager = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var storage = creep.room.storage;
        var terminal = creep.room.terminal;

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
            if (creep.pos.inRangeTo(terminal, 1)) {
                creep.transfer(terminal, RESOURCE_ENERGY);
            } else {
                creep.moveTo(terminal);
            }
        }
    }
};

module.exports = roleManager;