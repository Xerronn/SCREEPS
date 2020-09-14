var roleReserver = {
    /** @param {Creep} creep **/
    run: function(creep) {
        //figure out how to not hardcode this
        //I guess it really doesn't need to be not hardcoded. IDK I'll think about it
        if (creep.room.name != "E45N22") {
            creep.moveTo(new RoomPosition(25,20, "E45N22"), {visualizePathStyle: {stroke: '#ffffff'}});
        } else {
            var controller = Game.getObjectById("5bbcafa49099fc012e63af26");
            if (creep.pos.inRangeTo(controller, 1)) {
                //creep.signController(controller, "Born of God and Void. You shall seal the blinding light that plagues their dreams.")
                creep.claimController(controller);
            } else {
                creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
	}
};

module.exports = roleReserver;