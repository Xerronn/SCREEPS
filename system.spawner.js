var systemSpawner = {
    run: function() {
        try {
            //remove this
            var newUpgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'newUpgrader');
            if (newUpgraders.length < 1) {
                var newName = 'newUpgrader' + Game.time;
                console.log('Spawning new newUpgrader: ' + newName);
                Game.spawns['French Armada From Spain'].spawnCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, 
                    {memory: {role: 'newUpgrader'}});
            }

            //managers miner spawns
            //checks each source to make sure they have the proper number of assignments
            var sources = Game.spawns['French Armada From Spain'].room.find(FIND_SOURCES)
            for (var i in sources) {
                var assignedWorker = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner' && creep.memory.assignedSource == sources[i].id && creep.ticksToLive > 50);      
                if (assignedWorker.length < 1) {
                    var newName = Game.spawns['French Armada From Spain'].room.name + '_Miner_' + sources[i].id.slice(-4) + '_' + Game.time;
                    //the container that the worker is assigned to
                    var assignedContainer = Memory.sources[Game.spawns['French Armada From Spain'].room][sources[i]]["container"];
                    console.log('Spawning new Miner: ' + newName);
                    Game.spawns['French Armada From Spain'].spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], newName, 
                    {memory: {role: 'miner', assignedSource: sources[i].id, assignedContainer: assignedContainer.id}});
                }
            }
            
            //manages transporter spawns
            var containers = Game.spawns['French Armada From Spain'].room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_CONTAINER});
            for (var i in containers) {
                var assignedWorker = _.filter(Game.creeps, (creep) => creep.memory.role == 'transporter' && creep.memory.assignedContainer == containers[i].id);
                if (assignedWorker.length < 1) {
                    var newName = Game.spawns['French Armada From Spain'].room.name + '_Transporter_' + containers[i].id.slice(-4) + '_' + Game.time;
                    //the container that the worker is assigned to
                    var assignedContainer = containers[i];
                    console.log('Spawning new Transporter: ' + newName);
                    Game.spawns['French Armada From Spain'].spawnCreep([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], newName, 
                    {memory: {role: 'transporter', assignedContainer: assignedContainer.id}});
                }
            }

            

            //linker spawner
            var storage = Game.spawns['French Armada From Spain'].room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_STORAGE})[0];
            var storageLinks = Game.spawns['French Armada From Spain'].room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_LINK && structure.pos.inRangeTo(storage, 3)});

            for (var i in storageLinks) {
                var assignedWorker = _.filter(Game.creeps, (creep) => creep.memory.role == 'linker' && creep.memory.assignedLink == storageLinks[i].id);
                if (assignedWorker.length < 1) {
                    var newName = Game.spawns['French Armada From Spain'].room.name + '_Linker_' + storageLinks[i].id.slice(-4) + '_' + Game.time;
                    //the container that the worker is assigned to
                    var assignedLink = storageLinks[i];
                    console.log('Spawning new Linker: ' + newName);
                    Game.spawns['French Armada From Spain'].spawnCreep([CARRY, MOVE], newName, 
                    {memory: {role: 'linker', assignedLink: assignedLink.id, assignedStorage: storage.id}});
                }
            } 

            var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
            var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
            var maintainers = _.filter(Game.creeps, (creep) => creep.memory.role == 'maintainer');
            //1300
            var constructionSites = Game.spawns['French Armada From Spain'].room.find(FIND_MY_CONSTRUCTION_SITES);
            if (builders.length < 1 && constructionSites.length > 0) {
                var newName = 'Builder' + Game.time;
                console.log('Spawning new Builder: ' + newName);
                Game.spawns['French Armada From Spain'].spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, 
                    {memory: {role: 'builder'}});
            }

            if (upgraders.length < 3) {
                var newName = 'Upgrader' + Game.time;
                console.log('Spawning new Upgrader: ' + newName);
                Game.spawns['French Armada From Spain'].spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY,
                    MOVE, MOVE, MOVE, MOVE, MOVE], newName, 
                    {memory: {role: 'upgrader'}});
            }

            if (maintainers.length < 2) {
                var newName = 'Maintainer' + Game.time;
                console.log('Spawning new Maintainer: ' + newName);
                Game.spawns['French Armada From Spain'].spawnCreep([WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                    MOVE, MOVE, MOVE, MOVE, MOVE], newName, 
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
        } catch (err) {
            console.log("(ERROR) system.spawner throwing: " + err);
        }

    }
};

module.exports = systemSpawner;