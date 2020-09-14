var roleUpgraderNEW = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.room.name != "E45N22") {
            creep.moveTo(new RoomPosition(25,20, "E45N22"), {visualizePathStyle: {stroke: '#ffffff'}});
        } else {
            var controller = Game.getObjectById("5bbcafa49099fc012e63af26");

            if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.upgrading = false;
                creep.say('🔄 harvest');
            }
            if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
                creep.memory.upgrading = true;
                creep.say('⚡ upgrade');
            }

            var source = Game.getObjectById("5bbcafa49099fc012e63af27");
            if(creep.memory.upgrading) {
                if (creep.pos.inRangeTo(controller, 1)) {
                    creep.upgradeController(controller);
                } else {
                    creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                if (creep.pos.inRangeTo(source, 1)) {
                    creep.harvest(source);
                } else {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
	}
};

module.exports = roleUpgraderNEW;