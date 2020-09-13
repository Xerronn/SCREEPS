var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var source = Game.getObjectById(creep.memory.assignedSource);
        var container = Game.getObjectById(creep.memory.assignedContainer);
        if (creep.pos.inRangeTo(source, 1)) {
            creep.harvest(source);
        } else {
            creep.moveTo(container);
        }
	}
};

module.exports = roleMiner;