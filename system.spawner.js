var systemSpawner = {
    run: function() {

        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        var maintainers = _.filter(Game.creeps, (creep) => creep.memory.role == 'maintainer');

        //checks each source to make sure they have the proper number of assignments
        var sources = Game.spawns['French Armada From Spain'].room.find(FIND_SOURCES)
        for (var i in sources) {
            var assignedWorker = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.memory.assignedNode == sources[i].id);
            if (assignedWorker.length < Memory.sources[Game.spawns['French Armada From Spain'].room][sources[i]]["positions"]) {
                var newName = Game.spawns['French Armada From Spain'].room.name + '_Harvester_' + sources[i].id.slice(-4) + '_' + Game.time;
                console.log('Spawning new harvester: ' + newName);
                Game.spawns['French Armada From Spain'].spawnCreep([WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], newName, 
                {memory: {role: 'harvester', assignedNode: sources[i].id}});
            }
        }   

        //1300
        if (builders.length < 2) {
            var newName = 'Builder' + Game.time;
            console.log('Spawning new Builder: ' + newName);
            Game.spawns['French Armada From Spain'].spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, 
                {memory: {role: 'builder'}});
        }

        if (upgraders.length < 4) {
            var newName = 'Upgrader' + Game.time;
            console.log('Spawning new Upgrader: ' + newName);
            Game.spawns['French Armada From Spain'].spawnCreep([WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                 MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, 
                {memory: {role: 'upgrader'}});
        }

        if (maintainers.length < 2) {
            var newName = 'Maintainer' + Game.time;
            console.log('Spawning new Maintainer: ' + newName);
            Game.spawns['French Armada From Spain'].spawnCreep([WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                 MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, 
                {memory: {role: 'maintainer'}});
        }
        
        
        if (Game.spawns['French Armada From Spain'].spawning) { 
            var spawningCreep = Game.creeps[Game.spawns['French Armada From Spain'].spawning.name];
            Game.spawns['French Armada From Spain'].room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                Game.spawns['French Armada From Spain'].pos.x + 1, 
                Game.spawns['French Armada From Spain'].pos.y, 
                {align: 'left', opacity: 0.8});
        }


    }
};

module.exports = systemSpawner;