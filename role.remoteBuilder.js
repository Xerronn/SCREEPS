var roleRemoteBuilder = {

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
                creep.moveTo(creep.room.find(creep.memory.path[0]["exit"])[0], {reusePath: 50, serializeMemory: true, maxOps: 1000, visualizePathStyle: {stroke: '#ffffff'}})
            } else {
                creep.moveTo(creep.room.find(creep.memory.path[currentRoom + 1]["exit"])[0], {reusePath: 50, serializeMemory: true, maxOps: 1000, visualizePathStyle: {stroke: '#ffffff'}})
            }
        } else {
            var controller = Game.rooms[creep.memory.assignedRoom].controller;
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
                //first fill extensions. This will keep them full for moving into stage 2
                var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}
                        });
        
                if(target) {
                    if (creep.pos.inRangeTo(target, 1)) {
                        creep.transfer(target, RESOURCE_ENERGY);
                    } else {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else {
                    //then build things
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
	}
};

module.exports = roleRemoteBuilder;