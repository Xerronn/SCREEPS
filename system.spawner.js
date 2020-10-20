var systemSpawner2 = {
    run: function() {
        //ADD IN PRIORITIZATION
        //TODO:
        //CHECK IF THERE IS AN ONGOING ATTACK, IF SO STALL ALL NON ESSENTIAL CREEP SPAWNING AND SPAWN DEFENDERS
        //
        
        //code snippet that handles expansions into new rooms
        //Add a new expansion target by executing Memory.expansion.push(target) in console
        if (!Memory.expansion) {
            Memory.expansion = [];
        }
        if (Memory.expansion.length > 0) {
            for (var exp of Memory.expansion) {
                //finds the closest spawn
                let expanderRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller.my && 
                    Game.rooms[room].find(FIND_MY_SPAWNS)[0] && room != "sim" && Game.rooms[room].energyCapacityAvailable > 850);
                var expanderRoom = _.sortBy(expanderRooms, (room) => Game.map.getRoomLinearDistance(exp, room))[0];
                var reservers = _.filter(Game.creeps, (creep) => creep.memory.role == 'reserver' && creep.memory.assignedRoom == exp);
                if (reservers.length < 1) {
                    let chosenSpawn = Game.rooms[expanderRoom].find(FIND_MY_SPAWNS)[0];
                    let memory = {role: 'reserver', assignedRoom: exp};
                    spawnCreep(chosenSpawn, "reserver", memory);
                }
            }
        }
        //handles the automatic creation of remote upgraders in case of a new territory being claimed
        //first find any claimed controllers that do not have a spawn
        var controllers = _.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_CONTROLLER && (Memory.roomsCache[structure.pos.roomName].structures["spawns"].length < 1));
        for (var controller of controllers) {
            if (controller.room.find(FIND_MY_SPAWNS).length < 1) {
                //remove from memory expansions
                if (Memory.expansion.includes(controller.room.name)) {
                    let index = Memory.expansion.indexOf(controller.room.name);
                    Memory.expansion.splice(index, 1);
                }
                var remoteBuilders = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteBuilder' && creep.memory.assignedRoom == controller.pos.roomName);
                if (remoteBuilders.length < 3) {
                    let expanderRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller.my && 
                    Memory.roomsCache[room].structures["spawns"].length > 0 && room != "sim" && Game.rooms[room].energyCapacityAvailable > 700);
                    var expanderRoom = _.sortBy(expanderRooms, (room) => Game.map.getRoomLinearDistance(controller.pos.roomName, room))[0];
                    let chosenSpawn = Game.rooms[expanderRoom].find(FIND_MY_SPAWNS)[0];
                    let memory = {role: 'remoteBuilder', assignedRoom: controller.pos.roomName};
                    spawnCreep(chosenSpawn, "remoteBuilder", memory);
                }
            } 
        }

        //iterate through rooms that I own and have at least one spawn
        let myRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller.my && Memory.roomsCache[room].structures["spawns"].length > 0);
        for (var room of myRooms) {

            //This block of code determines if the room is under attack or not
            if (!Memory.roomsPersistent[room].attackStatus || Game.time > Memory.roomsCache[room].attackStatusTimer + 150) {
                Memory.roomsPersistent[room].attackStatus = false;
            }
            let hostileCreeps = Game.rooms[room].find(FIND_HOSTILE_CREEPS);
            if (hostileCreeps.length > 0) {
                let eventLog = Game.rooms[room].getEventLog();
                let attackEvents = _.filter(eventLog, {event: EVENT_ATTACK});
                attackEvents.forEach(event => {
                    let target = Game.getObjectById(event.data.targetId);
                    if(target && target.my) {
                        Memory.roomsPersistent[room].attackStatus = true;
                        Memory.roomsPersistent[room].attackStatusTimer = Game.time;
                    }
                });
            }
            
            //begin of spawning loop. Loop through each spawn in the room
            var roomSpawns = Memory.roomsCache[room].structures["spawns"].map(spawnID => Game.getObjectById(spawnID));
            var roomController = Game.rooms[room].controller;
            //find what the other spawner is spawning right now
            //downside of this is that it two spawns cant collaborate to spawn a single type of creep
            //they both have to be spawning some thing different. room for improvement for sure.
            var currentlySpawning = [];
            for (var spawn of roomSpawns) {
                if (!Memory.roomsPersistent[room].spawns) {
                    Memory.roomsPersistent[room].spawns = {};
                }
                currentlySpawning.push(Memory.roomsPersistent[room].spawns[spawn.name]);
            }
            //variables used per room. Once per room for efficiency
            var wallers = _.filter(Game.creeps, (creep) => creep.memory.role == 'waller' && creep.room.name == room);
            var creeps = _.filter(Game.creeps, (creep) => creep.room.name == room);
            var sources = Object.keys(Memory.roomsCache[room].sources);
            var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.room.name == room);
            var constructionSites = Game.rooms[room].find(FIND_MY_CONSTRUCTION_SITES);
            var upgraderCount = 1;
            if (roomController.level < 4 ||(Memory.roomsCache[room].structures.links.storage && Memory.roomsCache[room].structures.links.controller.length < 1)) upgraderCount = 3;
            var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.room.name == room && creep.ticksToLive > 150);
            var towers = Memory.roomsCache[room].structures.towers;
            var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer' && creep.room.name == room);
            var maintainers = _.filter(Game.creeps, (creep) => creep.memory.role == 'maintainer' && creep.room.name == room);

            for (var spawn of roomSpawns) {
                //if it is already spawn, skip it
                if (spawn.spawning) {
                    continue;
                }
                
                //set spawning memory to not spawning
                if (!Memory.roomsPersistent[room].spawns) {
                    Memory.roomsPersistent[room].spawns = {};
                }
                Memory.roomsPersistent[room].spawns[spawn.name] = "none";

                let hasRoads = Memory.roomsPersistent[room].roadsBuilt;

                //OH CRAP PANIC setup
                //dont do this for early rooms, though I should find a better way to do it for them too. Add in logic for gathering from containers instead of storage and mining to do that
                if (Game.rooms[room].controller.level > 3) {
                    if (creeps.length < 2) {
                        var containers = Game.rooms[room].find(FIND_STRUCTURES, {
                            filter: (structure) => structure.structureType == STRUCTURE_CONTAINER &&
                            structure.store.getCapacity() > 0
                        });
                        var assignedContainer = roomSpawn.pos.findClosestByRange(containers);
                        let memory = {role: 'transporter', assignedContainer: assignedContainer.id}
                        spawnCreep(spawn, "transporter", memory);
                    }
                }

                //transporter spawning
                var containers = Memory.roomsCache[room].structures.containers;
                for (var container of containers) {
                    let assignedWorker = _.filter(Game.creeps, (creep) => creep.memory.role == 'transporter' && creep.memory.assignedContainer == container);
                    if (assignedWorker.length < 1) {
                        if (!currentlySpawning.includes("transporter")) {
                            let memory = {role: 'transporter', assignedContainer: container}
                            spawnCreep(spawn, "transporter", memory, hasRoads);
                        }
                    }
                }

                //miners spawning
                for (var source of sources) {
                    let assignedWorker = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner' && creep.memory.assignedSource == source && creep.ticksToLive > 50);      
                    if (assignedWorker.length < 1) {
                        if (!currentlySpawning.includes("miner")) {
                            let assignedContainer = Memory.roomsCache[Game.rooms[room].name]["sources"][source]["container"];
                            let assignedLink = Memory.roomsCache[Game.rooms[room].name]["sources"][source]["link"];
                            let memory = {role: 'miner', assignedSource: source, assignedContainer: assignedContainer, assignedLink: assignedLink};
                            spawnCreep(spawn, "miner", memory, hasRoads);
                        }
                    }
                }
                
                //builder spawning
                if (builders.length < 2 && constructionSites.length > 0) {
                    if (!currentlySpawning.includes("builder")) {
                        spawnCreep(spawn, "builder", {role: "builder"}, hasRoads=hasRoads);
                    }
                }

                //upgrader spawning
                if (upgraders.length < upgraderCount) {
                    if (!currentlySpawning.includes("upgrader")) {
                        spawnCreep(spawn, "upgrader", {role: "upgrader"}, hasRoads=hasRoads);
                    }
                }

                //remoteDefender spawning
                if (!towers) {
                    let remoteDefenders = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteDefender' && creep.memory.assignedRoom == room && creep.ticksToLive > 300);
                    if (remoteDefenders.length < 1) {
                        let expanderRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller.my && 
                        Game.rooms[room].find(FIND_MY_SPAWNS)[0] && room != "sim" && Game.rooms[room].energyCapacityAvailable > 700);
                        if (expanderRooms.length > 0) {
                            var expanderRoom = _.sortBy(expanderRooms, (room) => Game.map.getRoomLinearDistance(controller.pos.roomName, room))[0];
                            let chosenSpawn = Game.rooms[expanderRoom].find(FIND_MY_SPAWNS)[0];
                            let memory = {role: 'remoteDefender', assignedRoom: room};
                            spawnCreep(chosenSpawn, "remoteDefender", memory, hasRoads=hasRoads);
                        }
                    }
                }

                //repairer spawning
                if (containers.length > 0 && towers.length < 1){
                    if (repairers.length < 1) {
                        if (!currentlySpawning.includes("repairer")) {
                            spawnCreep(spawn, "repairer", {role: "repairer"}, hasRoads=hasRoads);
                        }
                    }
                }
                
                //once the room can have towers
                if (roomController.level > 2) {
                    //maintainer spawning
                    if (maintainers.length < 1 && towers) {
                        if (!currentlySpawning.includes("maintainer")) {
                            spawnCreep(spawn, "maintainer", {role: "maintainer"}, hasRoads=hasRoads);
                        }
                    }

                    //once the room can have links
                    if (roomController.level > 4) {
                        //linker spawning
                        var storage = Game.rooms[room].storage;
                        if (Memory.roomsCache[room]["structures"]["links"]) {
                            var storageLinks = Memory.roomsCache[room]["structures"]["links"]["storage"];
                            if (storageLinks && storageLinks.length > 0) {
                                for (var link of storageLinks) {
                                    var assignedWorker = _.filter(Game.creeps, (creep) => creep.memory.role == 'linker' && creep.memory.assignedLink == link);
                                    if (assignedWorker.length < 1) {
                                        if (!currentlySpawning.includes("linker")) {
                                            let memory = {role: 'linker', assignedLink: link, assignedStorage: storage.id};
                                            spawnCreep(spawn, "linker", memory, hasRoads=hasRoads);
                                        }
                                    }
                                }
                            } 
                        }

                        //waller spawning
                        if (wallers.length < 1) {
                            if (!currentlySpawning.includes("waller")) {
                                spawnCreep(spawn, "waller", {role: "waller"}, hasRoads=hasRoads);
                            }
                        }
                    }
                }

                //to print the little status symbol next to the spawn
                if (spawn.spawning) { 
                    var spawningCreep = Game.creeps[roomSpawn.spawning.name];
                    Game.rooms[room].visual.text(
                        '🛠️' + spawningCreep.memory.role,
                        roomSpawn.pos.x + 1, 
                        roomSpawn.pos.y, 
                        {align: 'left', opacity: 0.8});
                }
            }
        }

        function spawnCreep(spawn, role, memory, hasRoads=true) {
            let body;
            let spawnRoom = spawn.room.name;
            switch (role) {
                case "remoteBuilder":
                    //always assume no roads
                    body = buildComposition(spawnRoom, [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], false);
                    break;
                case "reserver":
                    //always assume no roads
                    body = buildComposition(spawnRoom, [CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE], false);
                    break;
                case "remoteDefender":
                    //always assume no roads
                    body = buildComposition(spawnRoom, [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, HEAL], false)
                    break;
                case "miner":
                    //special case for optimization
                    if (!hasRoads) {
                        body = buildComposition(spawnRoom, [WORK, CARRY, MOVE, MOVE], true);
                    } else {
                        body = buildComposition(spawnRoom, [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], false);
                    }
                    break;
                case "transporter":
                    body = addMoves([CARRY], hasRoads);
                    body = buildComposition(spawnRoom, body, true, 800);
                    break;
                case "builder":
                    body = addMoves([WORK, CARRY, CARRY], hasRoads);
                    body = buildComposition(spawnRoom, body, true, 1000);
                    break;
                case "upgrader":
                    if (Memory.roomsCache[spawnRoom].structures.links.storage && Memory.roomsCache[spawnRoom].structures.links.controller.length > 0) {
                        body = addMoves([WORK, WORK, WORK, WORK, WORK, CARRY], hasRoads);
                    } else {
                        body = addMoves([WORK, CARRY], hasRoads);
                    }
                    let storage = Game.rooms[spawnRoom].storage;
                    if (storage && storage.store.getUsedCapacity() > (storage.store.getCapacity() / 1.3)) {
                        //Unlimited cost on upgraders if the storage gets above a certain capacity
                        body = buildComposition(spawnRoom, body, true);
                    } else {
                        body = buildComposition(spawnRoom, body, true, 1200);
                    }
                    break;
                case "maintainer":
                    body = addMoves([WORK, CARRY, CARRY, CARRY], hasRoads);
                    body = buildComposition(spawnRoom, body, true, 700);
                    break;
                case "linker":
                    //doesn't matter if roads or not
                    body = buildComposition(spawnRoom, [CARRY, CARRY, MOVE], false);
                    break;
                case "waller":
                    body = addMoves([WORK, CARRY, CARRY], hasRoads);
                    body = buildComposition(spawnRoom, body, true, 700);
                    break;
                case "repairer":
                    body = addMoves([WORK, CARRY, CARRY], hasRoads);
                    body = buildComposition(spawnRoom, body, true, 600);
                    break;
            }
            var newName = spawnRoom + "/" + role + "/" + Game.time;
            console.log('Spawning Creep in ' + spawnRoom + " with name " + newName);
            let spawnSuccess = spawn.spawnCreep(body, newName, {memory: memory});
            if (spawnSuccess == 0) {
                if (!Memory.roomsPersistent[room].spawns) {
                    Memory.roomsPersistent[room].spawns = {};
                }
                Memory.roomsPersistent[room].spawns[spawn.name] = role;
                Memory.roomsPersistent[room].extensionsFilled = false;
            }
        }

        function addMoves(body, hasRoads) {
            if (hasRoads) {
                let counter = body.length;
                for (var i = 0; i < Math.ceil(counter / 2); i++) {
                    body.unshift(MOVE);
                }
            } else {
                let counter = body.length;
                for (var i = 0; i < counter; i++) {
                    body.unshift(MOVE);
                }
            }
            return body;
        }
        
        function buildComposition(room, body, increase=false, maxEnergy=Game.rooms[room].energyCapacityAvailable) {
            //dynamically create body part compositions with provided array, either decreasing or increasing as needed
            if (maxEnergy > Game.rooms[room].energyCapacityAvailable) {
                maxEnergy = Game.rooms[room].energyCapacityAvailable;
            }
            
            //calculate total cost and counts of the provided body
            var bodyCounts = {};
            var totalCost = 0;
            for (let part of body) {
                totalCost += BODYPART_COST[part];
                if (!bodyCounts[part]) {
                    bodyCounts[part] = 0;
                }
                if (part == MOVE) {
                    bodyCounts[part] += 1;
                } else {
                    bodyCounts[part] += 1;
                }
            }


            //reduce the body if needed
            if (totalCost > maxEnergy) {
                var mostCommon = WORK;
                for (let part of Object.keys(bodyCounts)) {
                    if (bodyCounts[part] > bodyCounts[mostCommon] || !bodyCounts[mostCommon]) {
                        mostCommon = part;
                    }
                }
                var index = body.indexOf(mostCommon);
                if (index > -1) {
                    body.splice(index, 1);
                }
                //recursive call to decrease the array
                return buildComposition(room, body, maxEnergy);
            }

            //increase the body if needed
            else if (totalCost < maxEnergy && increase) {
                for (let part of body) {
                    if (totalCost + BODYPART_COST[part] < maxEnergy) {
                        body.push(part);
                        totalCost += BODYPART_COST[part];
                        if (body.length == 50) {
                            body.sort(compareBodyParts);
                            return body;
                        }
                    } else {
                        body.sort(compareBodyParts)
                        return body;
                    }
                }          
                //recursive call to decrease the array
                return buildComposition(room, body, maxEnergy);
            } else {
                body.sort(compareBodyParts);
                return body;
            }
            
            //helper function to compare body parts by cost
            function compareBodyParts(a, b) {
                var compareCost = {...BODYPART_COST};
                compareCost[MOVE] = 51;
                if (compareCost[a] < compareCost[b]) {
                    return -1;
                } else if (compareCost[a] > compareCost[b]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }
    }
};

module.exports = systemSpawner2;