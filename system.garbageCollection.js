var systemGarbageCollection = {
    run: function() {
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                try {
                    Memory.roomsPersistent[Memory.creeps[name].role].creepCounts[role]--;
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
                    if (Memory.creeps[name].assignedSourceContainer) {
                        let assignedSource = Game.getObjectById(Memory.creeps[name].assignedSource);
                        let array = Memory.roomsPersistent[assignedSource.room.name].sources[assignedSource.id].miners;
                        let index = array.indexOf(name);
                        if (index > -1) {
                            array.splice(index, 1);
                            Memory.roomsPersistent[assignedSource.room.name].sources[assignedSource.id].transporters = array;
                        }
                    }
                } catch (err) {
                    //TODO: figure out how to avoid errors when source is out of vision
                }
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    }
};

module.exports = systemGarbageCollection;