var systemGarbageCollection = {
    run: function() {
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                try {
                    //decrement the creep count
                    Memory.roomsPersistent[Memory.creeps[name].spawnRoom].creepCounts[Memory.creeps[name].role]--;
                    //remove the assigned worker from assignedSource memory
                    if (Memory.creeps[name].assignedSource) {
                        let assignedSource = Game.getObjectById(Memory.creeps[name].assignedSource);
                        let array = Memory.roomsPersistent[assignedSource.room.name].sources[assignedSource.id].miners;
                        let index = array.indexOf(name);
                        if (index > -1) {
                            array.splice(index, 1);
                            Memory.roomsPersistent[assignedSource.room.name].sources[assignedSource.id].miners = array;
                        }
                    }
                    //remove the assigned transporter from assignedSource memory
                    if (Memory.creeps[name].assignedContainer && Memory.creeps[name].assignedContainerSource) {
                        let assignedSource = Game.getObjectById(Memory.creeps[name].assignedContainerSource);
                        let array = Memory.roomsPersistent[assignedSource.room.name].sources[assignedSource.id].transporters;
                        let index = array.indexOf(name);
                        if (index > -1) {
                            array.splice(index, 1);
                            Memory.roomsPersistent[assignedSource.room.name].sources[assignedSource.id].transporters = array;
                        }
                    }
                } catch (err) {
                    //TODO: figure out how to avoid errors when source is out of vision
                    console.log(err);
                }
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    }
};

module.exports = systemGarbageCollection;