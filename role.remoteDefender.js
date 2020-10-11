var roleRemoteDefender = {

    /** @param {Creep} creep **/
    run: function(creep) {
        //move creep to room first
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
                creep.moveTo(creep.room.find(creep.memory.path[0]["exit"])[0], {reusePath: 30, serializeMemory: true, maxOps: 1000, visualizePathStyle: {stroke: '#ffffff'}})
            } else {
                creep.moveTo(creep.room.find(creep.memory.path[currentRoom + 1]["exit"])[0], {reusePath: 30, serializeMemory: true, maxOps: 1000, visualizePathStyle: {stroke: '#ffffff'}})
            }
        } else {
            //actual logic
            var controller = Game.rooms[creep.memory.assignedRoom].controller;
            var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            var closestHostileBuilding = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
            var friends = creep.room.find(FIND_MY_CREEPS, { filter: (creep) => creep.hits < creep.hitsMax});
            if(closestHostile) {
                if (creep.pos.inRangeTo(closestHostile, 1)) {
                    creep.attack(closestHostile);
                } else {
                    creep.moveTo(closestHostile, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if (friends.length > 0) {
                var target = _.sortBy(friends, (f) => f.pos.getRangeTo(creep))[0];
                if (creep.pos.inRangeTo(target, 1)) {
                    creep.heal(target);
                } else {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                if(closestHostile) {
                        if (creep.pos.inRangeTo(closestHostileBuilding, 1)) {
                            creep.attack(closestHostileBuilding);
                        } else {
                            creep.moveTo(closestHostileBuilding, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                } else {
                    creep.moveTo(new RoomPosition(34,20, creep.memory.assignedRoom), {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
	}
};

module.exports = roleRemoteDefender;