var roleReserver = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.pos.x == 0 || creep.pos.y == 0 || creep.pos.x == 49 || creep.pos.y == 49) {
            creep.moveTo(new RoomPosition(25,25, creep.room.name));
        }
        if (!creep.memory.path) {
            creep.memory.path = Game.map.findRoute(creep.room.name, creep.memory.assignedRoom);
        }
        if (creep.room.name != creep.memory.assignedRoom) {
            //creep.moveTo(new RoomPosition(25,25, creep.memory.assignedRoom), {reusePath: 50, serializeMemory: true, maxOps: 1000, visualizePathStyle: {stroke: '#ffffff'}});
            var currentRoom;
            for (var i in creep.memory.path) {
                if (creep.room.name == creep.memory.path[i]["room"]) {
                    currentRoom = parseInt(i);
                }
            }
            if (!currentRoom) {
                creep.moveTo(creep.room.find(creep.memory.path[0]["exit"])[0], {reusePath: 50, serializeMemory: true, maxOps: 1000, visualizePathStyle: {stroke: '#ffffff'}})
            } else {
                creep.moveTo(creep.room.find(creep.memory.path[currentRoom + 1]["exit"])[0], {reusePath: 50, serializeMemory: true, maxOps: 1000, visualizePathStyle: {stroke: '#ffffff'}})
            }
        } else {
            var controller = Game.rooms[creep.memory.assignedRoom].controller;
            if (creep.pos.inRangeTo(controller, 1)) {
                //creep.signController(controller, "...Soul of Wyrm. Soul of Root. Heart of Void...");
                creep.claimController(controller);
            } else {
                creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
	}
};

module.exports = roleReserver;