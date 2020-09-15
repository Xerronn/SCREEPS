var roleRemoteUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        //move creep to room first
        if (creep.room.name != "E45N22") {
            creep.moveTo(new RoomPosition(25,20, "E45N22"), {visualizePathStyle: {stroke: '#ffffff'}});
        } else {
            var controller = Game.getObjectById("5bbcafa49099fc012e63af26");
            var source = controller.pos.findClosestByRange(FIND_SOURCES);

            if (creep.store.getUsedCapacity() == 0){
                creep.memory.mining = true;
            } else if (creep.store.getFreeCapacity() == 0) {
                creep.memory.mining = false;
            }

            if(creep.memory.mining) {
                if (creep.pos.inRangeTo(source, 1)) {
                    creep.harvest(source);
                } else {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else {
                //first build things
                var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(targets.length > 0) {
                    var target = _.sortBy(targets, (t) => t.pos.getRangeTo(creep))[0];
                    if (creep.pos.inRangeTo(target, 1)) {
                        creep.build(target);
                    } else {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else {
                    //once done building, upgrade things instead
                    if (creep.pos.inRangeTo(controller, 1)) {
                        creep.upgradeController(controller);
                    } else {
                        creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
                    }   
                }
            }
        }
	}
};

module.exports = roleRemoteUpgrader;