var systemSpawner = {
    run: function() {
        try {
            //handles the automatic creation of remote upgraders in case of a new territory being claimed
            //first find any claimed controllers that do not have a spawn
            //ONLY SPAWNS USING THE FRENCH ARMADA SPAWN
            var controllers = _.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_CONTROLLER);
            for (var controller of controllers) {
                if (controller.room.find(FIND_MY_SPAWNS).length < 1) {
                    //if the controller has no spawn, check to see if there are any remoteUpgraders assigned to it
                    var remoteUpgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteUpgrader' && creep.memory.assignedController == controller.id);
                    if (remoteUpgraders.length < 1) {
                        var newName = controller.room.name + '_remoteUpgrader_' + controller.id.slice(-4) + '_' + Game.time;
                        console.log('Spawning new remoteUpgrader: ' + newName);
                        Game.spawns['French Armada From Spain'].spawnCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, 
                            {memory: {role: 'remoteUpgrader', assignedRoom: controller.pos.roomName}});
                    }

                    var remoteBuilders = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteBuilder' && creep.memory.assignedController == controller.id);
                    if (remoteBuilders.length < 1) {
                        var newName = controller.room.name + '_remoteBuilder_' + controller.id.slice(-4) + '_' + Game.time;
                        console.log('Spawning new remoteBuilder: ' + newName);
                        Game.spawns['French Armada From Spain'].spawnCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, 
                            {memory: {role: 'remoteBuilder', assignedRoom: controller.pos.roomName}});
                    }
                } 
            }

            //loop through all rooms
            var rooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller.my);
            for (var room of rooms) {
                //find the roomSpawn and how many extensions there are
                let roomSpawn = Game.rooms[room].find(FIND_STRUCTURES, {
                    filter: (structure) => {return structure.structureType == STRUCTURE_SPAWN}})[0];
                let roomController = Game.rooms[room].controller;
                let roomExtensions = Game.rooms[room].find(FIND_STRUCTURES, {
                    filter: (structure) => {return structure.structureType == STRUCTURE_EXTENSION}});
                
                if (!roomSpawn.spawning) {
                    //early game setup
                    if (roomController.level < 5 && roomController.level != 0) {
                        if (roomExtensions.length < 10) {
                            let remoteUpgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteUpgrader' && creep.memory.assignedRoom == room);
                            if (remoteUpgraders.length < 1) {
                                var newName = room + '_remoteUpgrader_' + Game.time;
                                console.log('Spawning new remoteUpgrader: ' + newName);
                                Game.spawns['French Armada From Spain'].spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, 
                                    {memory: {role: 'remoteUpgrader', assignedRoom: room}});
                            }
                            let remoteBuilders = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteBuilder' && creep.memory.assignedRoom == room);
                            if (remoteBuilders.length < 2) {
                                var newName = room + '_remoteBuilder_' + Game.time;
                                console.log('Spawning new remoteBuilder: ' + newName);
                                Game.spawns['French Armada From Spain'].spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, 
                                    {memory: {role: 'remoteBuilder', assignedRoom: room}});
                            }
                            let remoteTowers = _.filter(Game.rooms[room].find(FIND_MY_STRUCTURES), (structure) => structure.structureType == STRUCTURE_TOWER);
                            let remoteDefenders = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteDefender' && creep.memory.assignedRoom == room);
                            if (remoteDefenders.length < 1 && remoteTowers.length < 1) {
                                var newName = room + '_remoteDefender_' + Game.time;
                                console.log('Spawning new remoteDefender: ' + newName);
                                Game.spawns['French Armada From Spain'].spawnCreep([TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, HEAL], newName, 
                                    {memory: {role: 'remoteDefender', assignedRoom: room}});
                            }
                        } else {
                            //if there is enough extensions built to handle the building
                            //managers miner spawns
                            //checks each source to make sure they have the proper number of assignments
                            var sources = Game.rooms[room].find(FIND_SOURCES)
                            for (var i in sources) {
                                var assignedWorker = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner' && creep.memory.assignedSource == sources[i].id && creep.ticksToLive > 50);      
                                if (assignedWorker.length < 1) {
                                    var newName = Game.rooms[room].name + '_Miner_' + sources[i].id.slice(-4) + '_' + Game.time;
                                    //the container that the worker is assigned to
                                    var assignedContainer = Memory.rooms[Game.rooms[room].name]["sources"][sources[i].id]["container"];
                                    //if it has a container, it doesn't need many move parts
                                    if (assignedContainer != "none") {
                                        console.log('Spawning new Miner: ' + newName);
                                        roomSpawn.spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], newName, 
                                        {memory: {role: 'miner', assignedSource: sources[i].id, assignedContainer: assignedContainer}});
                                    } else {
                                        //if it doesn't have a container it needs more carry and move
                                        console.log('Spawning new Miner: ' + newName);
                                        roomSpawn.spawnCreep([WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], newName, 
                                        {memory: {role: 'miner', assignedSource: sources[i].id, assignedContainer: assignedContainer}});
                                    }
                                }
                            }
                            //manages transporter spawns
                            var containers = Game.rooms[room].find(FIND_STRUCTURES, {
                                filter: (structure) => structure.structureType == STRUCTURE_CONTAINER});
                            for (var i in containers) {
                                var assignedWorker = _.filter(Game.creeps, (creep) => creep.memory.role == 'transporter' && creep.memory.assignedContainer == containers[i].id);
                                if (assignedWorker.length < 1) {
                                    var newName = Game.rooms[room].name + '_Transporter_' + containers[i].id.slice(-4) + '_' + Game.time;
                                    //the container that the worker is assigned to
                                    var assignedContainer = containers[i];
                                    console.log('Spawning new Transporter: ' + newName);
                                    roomSpawn.spawnCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], newName, 
                                    {memory: {role: 'transporter', assignedContainer: assignedContainer.id}});
                                }
                            }
                            var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.room.name == room);
                            var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.room.name == room);
                            var maintainers = _.filter(Game.creeps, (creep) => creep.memory.role == 'maintainer' && creep.room.name == room);

                            var constructionSites = Game.rooms[room].find(FIND_MY_CONSTRUCTION_SITES);
                            if (builders.length < 2 && constructionSites.length > 0) {
                                var newName = Game.rooms[room].name + '_Builder_' + Game.time;
                                console.log('Spawning new Builder: ' + newName);
                                roomSpawn.spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], newName, 
                                    {memory: {role: 'builder'}});
                            }

                            if (upgraders.length < 3) {
                                var newName = Game.rooms[room].name + '_Upgrader_' + Game.time;
                                console.log('Spawning new Upgrader: ' + newName);
                                roomSpawn.spawnCreep([WORK, WORK, WORK, WORK, CARRY, CARRY,
                                    MOVE, MOVE, MOVE], newName, 
                                    {memory: {role: 'upgrader'}});
                            }

                            if (maintainers.length < 1) {
                                var newName = Game.rooms[room].name + '_Maintainer_' + Game.time;
                                console.log('Spawning new Maintainer: ' + newName);
                                roomSpawn.spawnCreep([WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, 
                                    MOVE, MOVE, MOVE, MOVE], newName, 
                                    {memory: {role: 'maintainer'}});
                            }
                            
                            
                            if (roomSpawn.spawning) { 
                                var spawningCreep = Game.creeps[roomSpawn.spawning.name];
                                Game.rooms[room].visual.text(
                                    '🛠️' + spawningCreep.memory.role,
                                    roomSpawn.pos.x + 1, 
                                    roomSpawn.pos.y, 
                                    {align: 'left', opacity: 0.8});
                            }
                        }

                    } else {
                        //later game setup
                        
                        //miner spawns
                        //checks each source to make sure they have the proper number of assignments
                        var sources = Game.rooms[room].find(FIND_SOURCES)
                        for (var i in sources) {
                            var assignedWorker = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner' && creep.memory.assignedSource == sources[i].id && creep.ticksToLive > 50);      
                            if (assignedWorker.length < 1) {
                                var newName = Game.rooms[room].name + '_Miner_' + sources[i].id.slice(-4) + '_' + Game.time;
                                //the container that the worker is assigned to
                                var assignedContainer = Memory.rooms[Game.rooms[room].name]["sources"][sources[i].id]["container"];
                                var assignedLink = Memory.rooms[Game.rooms[room].name]["sources"][sources[i].id]["link"];
                                console.log('Spawning new Miner: ' + newName);
                                roomSpawn.spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], newName, 
                                {memory: {role: 'miner', assignedSource: sources[i].id, assignedContainer: assignedContainer, assignedLink: assignedLink}});
                            }
                        }
                        
                        //transporter spawns
                        var containers = Memory.rooms[room]["structures"]["containers"].map(
                            (struc) => {return Game.getObjectById(struc)});
                        for (var i in containers) {
                            var assignedWorker = _.filter(Game.creeps, (creep) => creep.memory.role == 'transporter' && creep.memory.assignedContainer == containers[i].id);
                            if (assignedWorker.length < 1) {
                                var newName = Game.rooms[room].name + '_Transporter_' + containers[i].id.slice(-4) + '_' + Game.time;
                                //the container that the worker is assigned to
                                var assignedContainer = containers[i];
                                console.log('Spawning new Transporter: ' + newName);
                                roomSpawn.spawnCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], newName, 
                                {memory: {role: 'transporter', assignedContainer: assignedContainer.id}});
                            }
                        }

                        //linker spawner
                        var storage = Game.rooms[room].storage;
                        var storageLinks = Memory.rooms[room]["structures"]["links"]["storage"];

                        for (var i in storageLinks) {
                            var assignedWorker = _.filter(Game.creeps, (creep) => creep.memory.role == 'linker' && creep.memory.assignedLink == storageLinks[i]);
                            if (assignedWorker.length < 1) {
                                var newName = Game.rooms[room].name + '_Linker_' + storageLinks[i].slice(-4) + '_' + Game.time;
                                //the container that the worker is assigned to
                                var assignedLink = storageLinks[i];
                                console.log('Spawning new Linker: ' + newName);
                                roomSpawn.spawnCreep([CARRY, MOVE], newName, 
                                {memory: {role: 'linker', assignedLink: assignedLink, assignedStorage: storage.id}});
                            }
                        } 

                        //DISABLED
                        //manager spawner
                        if (Game.rooms[room].terminal) {
                            var managers = _.filter(Game.creeps, (creep) => creep.memory.role == 'manager' && creep.room.name == room);

                            if (managers.length < 0) {
                                var newName = Game.rooms[room].name + '_Manager_' + Game.time;
                                console.log('Spawning new Manager: ' + newName);
                                roomSpawn.spawnCreep([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], newName, 
                                    {memory: {role: 'manager'}});
                            }
                        }
                        
                        //DISABLED
                        //extractor spawner
                        var extractors = _.filter(Game.creeps, (creep) => creep.memory.role == 'extractor' && creep.room.name == room);
                        var mineralExtractors = Game.rooms[room].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_EXTRACTOR)
                            }});
                        if (extractors.length < 0 && mineralExtractors.length > 0) {
                            var newName = Game.rooms[room].name + '_Extractor_' + Game.time;
                            console.log('Spawning new Extractor: ' + newName);
                            roomSpawn.spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, 
                                {memory: {role: 'extractor'}});
                        }  
                        
                        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.room.name == room);
                        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.room.name == room);
                        var maintainers = _.filter(Game.creeps, (creep) => creep.memory.role == 'maintainer' && creep.room.name == room);
                        var wallers = _.filter(Game.creeps, (creep) => creep.memory.role == 'waller' && creep.room.name == room);

                        //1300
                        var constructionSites = Game.rooms[room].find(FIND_MY_CONSTRUCTION_SITES);
                        if (builders.length < 2 && constructionSites.length > 0) {
                            var newName = Game.rooms[room].name + '_Builder_' + Game.time;
                            console.log('Spawning new Builder: ' + newName);
                            roomSpawn.spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, 
                                {memory: {role: 'builder'}});
                        }

                        if (upgraders.length < 3) {
                            var newName = Game.rooms[room].name + '_Upgrader_' + Game.time;
                            console.log('Spawning new Upgrader: ' + newName);
                            roomSpawn.spawnCreep([WORK, WORK, WORK, WORK, CARRY, CARRY,
                                MOVE, MOVE, MOVE], newName, 
                                {memory: {role: 'upgrader'}});
                        }

                        if (wallers.length < 2) {
                            var newName = Game.rooms[room].name + '_Waller_' + Game.time;
                            console.log('Spawning new Waller: ' + newName);
                            roomSpawn.spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY,
                                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, 
                                {memory: {role: 'waller'}});
                        }

                        if (maintainers.length < 1) {
                            var newName = Game.rooms[room].name + '_Maintainer_' + Game.time;
                            console.log('Spawning new Maintainer: ' + newName);
                            roomSpawn.spawnCreep([WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, 
                                MOVE, MOVE, MOVE, MOVE], newName, 
                                {memory: {role: 'maintainer'}});
                        }
                        
                        
                        if (roomSpawn.spawning) { 
                            var spawningCreep = Game.creeps[roomSpawn.spawning.name];
                            Game.rooms[room].visual.text(
                                '🛠️' + spawningCreep.memory.role,
                                roomSpawn.pos.x + 1, 
                                roomSpawn.pos.y, 
                                {align: 'left', opacity: 0.8});
                        }
                    }
                }
            }
        } catch (err) {
            console.log("(ERROR) system.spawner throwing: " + err);
        }

    }
};

module.exports = systemSpawner;