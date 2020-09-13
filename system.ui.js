var systemUI = {
    run: function() {

        //check for the number of each type of worker
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        var maintainers = _.filter(Game.creeps, (creep) => creep.memory.role == 'maintainer');
        var transporters = _.filter(Game.creeps, (creep) => creep.memory.role == 'transporter');
        Game.spawns['French Armada From Spain'].room.visual.text('Miner: ' + harvesters.length, Game.spawns['French Armada From Spain'].pos.x + 6, Game.spawns['French Armada From Spain'].pos.y, {align: 'left', opacity: 0.8});
        Game.spawns['French Armada From Spain'].room.visual.text('Builders: ' + builders.length, Game.spawns['French Armada From Spain'].pos.x + 6, Game.spawns['French Armada From Spain'].pos.y + 1, {align: 'left', opacity: 0.8});
        Game.spawns['French Armada From Spain'].room.visual.text('Upgraders: ' + upgraders.length, Game.spawns['French Armada From Spain'].pos.x + 6, Game.spawns['French Armada From Spain'].pos.y + 2, {align: 'left', opacity: 0.8});
        Game.spawns['French Armada From Spain'].room.visual.text('Maintainers: ' + maintainers.length, Game.spawns['French Armada From Spain'].pos.x + 6, Game.spawns['French Armada From Spain'].pos.y + 3, {align: 'left', opacity: 0.8});
        Game.spawns['French Armada From Spain'].room.visual.text('Transporters: ' + transporters.length, Game.spawns['French Armada From Spain'].pos.x + 6, Game.spawns['French Armada From Spain'].pos.y + 4, {align: 'left', opacity: 0.8});

        //find amount of stored energy
        var storages = Game.spawns['French Armada From Spain'].room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return [STRUCTURE_CONTAINER, STRUCTURE_STORAGE].includes(structure.structureType);
            }
        });
        var totalEnergy = 0;
        for (storage of storages) {
            totalEnergy += storage.store.getUsedCapacity();
        }
        Game.spawns['French Armada From Spain'].room.visual.text('Total Energy: ' + totalEnergy, Game.spawns['French Armada From Spain'].pos.x + 6, Game.spawns['French Armada From Spain'].pos.y + 5, {align: 'left', opacity: 0.8});


    }
};

module.exports = systemUI;