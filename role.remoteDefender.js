var roleRemoteDefender = {

    /** @param {Creep} creep **/
    run: function(creep) {
        //move creep to room first
        if (creep.room.name != creep.memory.assignedRoom) {
            creep.moveTo(new RoomPosition(25,20, creep.memory.assignedRoom, {reusePath: 50}), {visualizePathStyle: {stroke: '#ffffff'}});
        } else {
            var controller = Game.rooms[creep.memory.assignedRoom].controller;
            var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            var friends = creep.room.find(FIND_MY_CREEPS, { filter: (creep) => creep.hits < creep.hitsMax});
            if(closestHostile) {
                if (creep.pos.inRangeTo(closestHostile, 6)) {
                    if (creep.pos.inRangeTo(closestHostile, 1)) {
                        creep.attack(closestHostile);
                    } else {
                        creep.moveTo(closestHostile, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
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
                creep.moveTo(new RoomPosition(16,20, creep.memory.assignedRoom), {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
	}
};

module.exports = roleRemoteDefender;