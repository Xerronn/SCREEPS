var systemUI = {
    run: function() {
        // var myRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller.my);
        // for (var room of myRooms) {
        //     let roomSpawn = Game.rooms[room].find(FIND_MY_SPAWNS)[0];
        //     if (roomSpawn) {
        //         //check for the number of each type of worker
        //         var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner' && creep.room.name == room);
        //         var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.room.name == room);
        //         var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.room.name == room);
        //         var maintainers = _.filter(Game.creeps, (creep) => creep.memory.role == 'maintainer' && creep.room.name == room);
        //         var transporters = _.filter(Game.creeps, (creep) => creep.memory.role == 'transporter' && creep.room.name == room);
        //         Game.spawns[roomSpawn.name].room.visual.text('Miner: ' + harvesters.length, Game.spawns[roomSpawn.name].pos.x + 6, Game.spawns[roomSpawn.name].pos.y, {align: 'left', opacity: 0.8});
        //         Game.spawns[roomSpawn.name].room.visual.text('Builders: ' + builders.length, Game.spawns[roomSpawn.name].pos.x + 6, Game.spawns[roomSpawn.name].pos.y + 1, {align: 'left', opacity: 0.8});
        //         Game.spawns[roomSpawn.name].room.visual.text('Upgraders: ' + upgraders.length, Game.spawns[roomSpawn.name].pos.x + 6, Game.spawns[roomSpawn.name].pos.y + 2, {align: 'left', opacity: 0.8});
        //         Game.spawns[roomSpawn.name].room.visual.text('Maintainers: ' + maintainers.length, Game.spawns[roomSpawn.name].pos.x + 6, Game.spawns[roomSpawn.name].pos.y + 3, {align: 'left', opacity: 0.8});
        //         Game.spawns[roomSpawn.name].room.visual.text('Transporters: ' + transporters.length, Game.spawns[roomSpawn.name].pos.x + 6, Game.spawns[roomSpawn.name].pos.y + 4, {align: 'left', opacity: 0.8});

        //         //find amount of stored energy
        //         var storages = Game.spawns[roomSpawn.name].room.find(FIND_STRUCTURES, {
        //             filter: (structure) => {
        //                 return [STRUCTURE_CONTAINER, STRUCTURE_STORAGE].includes(structure.structureType);
        //             }
        //         });
        //         var totalEnergy = 0;
        //         for (let storage of storages) {
        //             totalEnergy += storage.store.getUsedCapacity();
        //         }
        //         Game.spawns[roomSpawn.name].room.visual.text('Energy Change: ' + (totalEnergy - Memory.roomsCache[room]["stats"].storedEnergy), Game.spawns[roomSpawn.name].pos.x + 6, Game.spawns[roomSpawn.name].pos.y + 5, {align: 'left', opacity: 0.8});
        //     }
        // }
    }
};

module.exports = systemUI;