var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleMaintainer = require('role.maintainer');
var roleTower = require('role.tower');

module.exports.loop = function () {
    //clear memory of dead creeps
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    //inits memory for sources
    if (!Memory.sources) {
        Memory.sources = {};
    }
    //inits memory for sources per room TODO: needs to work for more than just the one room
    if (!Memory.sources[Game.spawns['French Armada From Spain'].room]) {
        Memory.sources[Game.spawns['French Armada From Spain'].room] = {};

        var sources = Game.spawns['French Armada From Spain'].room.find(FIND_SOURCES);
        for (var i in sources) {
            let openSpots = 0;
            let terrain = Game.spawns['French Armada From Spain'].room.lookAtArea(sources[i].pos.y - 1, sources[i].pos.x - 1, sources[i].pos.y + 1, sources[i].pos.x + 1, true);
            for (var j in terrain) {
                if (terrain[j]["type"] == "terrain" && terrain[j]["terrain"] != "wall") {
                    openSpots++;
                }
            }
            Memory.sources[Game.spawns['French Armada From Spain'].room][sources[i]] = {};
            Memory.sources[Game.spawns['French Armada From Spain'].room][sources[i]]["positions"] = openSpots;
        }
    }

    //check for the number of each type of worker
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var maintainers = _.filter(Game.creeps, (creep) => creep.memory.role == 'maintainer');
    Game.spawns['French Armada From Spain'].room.visual.text('Harvesters: ' + harvesters.length, Game.spawns['French Armada From Spain'].pos.x + 6, Game.spawns['French Armada From Spain'].pos.y, {align: 'left', opacity: 0.8});
    Game.spawns['French Armada From Spain'].room.visual.text('Builders: ' + builders.length, Game.spawns['French Armada From Spain'].pos.x + 6, Game.spawns['French Armada From Spain'].pos.y + 1, {align: 'left', opacity: 0.8});
    Game.spawns['French Armada From Spain'].room.visual.text('Upgraders: ' + upgraders.length, Game.spawns['French Armada From Spain'].pos.x + 6, Game.spawns['French Armada From Spain'].pos.y + 2, {align: 'left', opacity: 0.8});
    Game.spawns['French Armada From Spain'].room.visual.text('Maintainers: ' + maintainers.length, Game.spawns['French Armada From Spain'].pos.x + 6, Game.spawns['French Armada From Spain'].pos.y + 3, {align: 'left', opacity: 0.8});


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

    if (builders.length < 0) {
        var newName = 'Builder' + Game.time;
        console.log('Spawning new Builder: ' + newName);
        Game.spawns['French Armada From Spain'].spawnCreep([WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], newName, 
            {memory: {role: 'builder'}});
    }

    if (upgraders.length < 0) {
        var newName = 'Upgrader' + Game.time;
        console.log('Spawning new Upgrader: ' + newName);
        Game.spawns['French Armada From Spain'].spawnCreep([WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, 
            {memory: {role: 'upgrader'}});
    }

    if (maintainers.length < 1) {
        var newName = 'Maintainer' + Game.time;
        console.log('Spawning new Maintainer: ' + newName);
        Game.spawns['French Armada From Spain'].spawnCreep([WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, 
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

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        switch (creep.memory.role) {
            case 'harvester':
                roleHarvester.run(creep);
                break;
            case 'upgrader':
                roleUpgrader.run(creep);
                break;
            case 'builder':
                roleBuilder.run(creep);
                break;
            case 'maintainer':
                roleMaintainer.run(creep);
                break;
        }
    }

    var towers = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_TOWER;
        }
    });

    for (var tower of towers) {
        roleTower.run(tower);
    }

}