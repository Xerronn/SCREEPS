var roleAttacker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        //move creep to room first
        if (!creep.memory.path) {
            creep.memory.path = Room.serializePath(creep.pos.findPathTo(new RoomPosition(25,20, creep.memory.assignedRoom), {visualizePathStyle: {stroke: '#ffffff'}}));
        }
        if (creep.room.name != creep.memory.assignedRoom) {
            if (creep.hits > creep.hits / 2) {
                if (creep.pos.x*creep.pos.y === 0 || creep.pos.x === 49 || creep.pos.y === 49) {
                    creep.moveTo(new RoomPosition(25,20, creep.room.name));
                }
                creep.moveByPath(Room.deserializePath(creep.memory.path));
            }
        } else {
            if (creep.pos.x*creep.pos.y === 0 || creep.pos.x === 49 || creep.pos.y === 49) {
                creep.moveTo(new RoomPosition(25,20, creep.room.name));
            }
            creep.moveTo(new RoomPosition(25,20, creep.room.name));     
            if (creep.hits < creep.hits / 2) {
                if (!creep.memory.nearestExit) {
                    creep.memory.nearestExit = creep.pos.findClosestByPath(FIND_EXIT);
                }
                creep.moveTo(creep.memory.nearestExit);
            }
        }
	}
};

module.exports = roleAttacker;