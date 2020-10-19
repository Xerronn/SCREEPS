var systemSpawner2 = {
    run: function() {
        //ADD IN PRIORITIZATION
        //THIS WHOLE FILE NEEDS TO BE REMADE, ALSO CONFIGURE SPAWNS BASED ON ATTACK STATUS
        //ADD IN CHECKS FOR ROADS AND CHANGE MOVE PARTS ACCORDINGLY

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
        var controllers = _.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_CONTROLLER);
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
                        Game.rooms[room].find(FIND_MY_SPAWNS)[0] && room != "sim" && Game.rooms[room].energyCapacityAvailable > 700);
                    var expanderRoom = _.sortBy(expanderRooms, (room) => Game.map.getRoomLinearDistance(controller.pos.roomName, room))[0];
                    let chosenSpawn = Game.rooms[expanderRoom].find(FIND_MY_SPAWNS)[0];
                    let memory = {role: 'remoteBuilder', assignedRoom: controller.pos.roomName};
                    spawnCreep(chosenSpawn, "remoteBuilder", memory);
                }
            } 
        }

        //iterate through rooms that I own and have at least one spawn
        let myRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller.my && Game.rooms[room].find(FIND_MY_SPAWNS)[0]);
        for (var room of myRooms) {

            //This block of code determines if the room is under attack or not
            if (!Memory.rooms[room].attackStatus || Game.time > Memory.rooms[room].attackStatusTimer + 150) {
                Memory.rooms[room].attackStatus = false;
            }
            let hostileCreeps = Game.rooms[room].find(FIND_HOSTILE_CREEPS);
            if (hostileCreeps.length > 0) {
                let eventLog = Game.rooms[room].getEventLog();
                let attackEvents = _.filter(eventLog, {event: EVENT_ATTACK});
                attackEvents.forEach(event => {
                    let target = Game.getObjectById(event.data.targetId);
                    if(target && target.my) {
                        Memory.rooms[room].attackStatus = true;
                        Memory.rooms[room].attackStatusTimer = Game.time;
                    }
                });
            }
            
            //begin of spawning loop. Loop through each spawn in the room
            var roomSpawns = Game.rooms[room].find(FIND_MY_SPAWNS);
            var roomController = Game.rooms[room].controller;
            for (var spawn of roomSpawns) {
                //if it is already spawn, skip it
                if (spawn.spawning) {
                    continue;
                }

                let hasRoads = Memory.gameStages[room].roadsBuilt;

                //OH CRAP PANIC setup
                var creeps = _.filter(Game.creeps, (creep) => creep.room.name == room);
                //dont do this for early rooms, though I should find a better way to do it for them too
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
                var containers = Memory.rooms[room]["structures"]["containers"];
                for (var container of containers) {
                    let assignedWorker = _.filter(Game.creeps, (creep) => creep.memory.role == 'transporter' && creep.memory.assignedContainer == container);
                    if (assignedWorker.length < 1) {
                        let memory = {role: 'transporter', assignedContainer: container}
                        spawnCreep(spawn, "transporter", memory, hasRoads);
                    }
                }

                //miners spawning
                let sources = Object.keys(Memory.rooms[room].sources)
                for (var source of sources) {
                    let assignedWorker = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner' && creep.memory.assignedSource == source && creep.ticksToLive > 50);      
                    if (assignedWorker.length < 1) {
                        let assignedContainer = Memory.rooms[Game.rooms[room].name]["sources"][source]["container"];
                        let assignedLink = Memory.rooms[Game.rooms[room].name]["sources"][source]["link"];
                        let memory = {role: 'miner', assignedSource: source, assignedContainer: assignedContainer, assignedLink: assignedLink};
                        spawnCreep(spawn, "miner", memory, hasRoads);
                    }
                }
                
                //builder spawning
                var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.room.name == room);
                var constructionSites = Game.rooms[room].find(FIND_MY_CONSTRUCTION_SITES);
                if (builders.length < 2 && constructionSites.length > 0) {
                    spawnCreep(spawn, "builder", {role: "builder"}, hasRoads=hasRoads);
                }

                let upgraderCount = 1;
                if (roomController.level < 4) upgraderCount = 3;
                //upgrader spawning
                var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.room.name == room && creep.ticksToLive > 150);
                if (upgraders.length < upgraderCount) {
                    spawnCreep(spawn, "upgrader", {role: "upgrader"}, hasRoads=hasRoads);
                }

                //remoteDefender spawning
                var towers = _.filter(Game.rooms[room].find(FIND_MY_STRUCTURES), (structure) => structure.structureType == STRUCTURE_TOWER);
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
                var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer' && creep.room.name == room);
                if (containers.length > 0 && towers.length < 1){
                    if (repairers.length < 1) {
                        spawnCreep(spawn, "repairer", {role: "repairer"}, hasRoads=hasRoads);
                    }
                }
                
                //once the room can have towers
                if (roomController.level > 2) {
                    //maintainer spawning
                    var maintainers = _.filter(Game.creeps, (creep) => creep.memory.role == 'maintainer' && creep.room.name == room);
                    if (maintainers.length < 1 && towers) {
                        spawnCreep(spawn, "maintainer", {role: "maintainer"}, hasRoads=hasRoads);
                    }

                    //once the room can have links
                    if (roomController.level > 4) {
                        //linker spawning
                        var storage = Game.rooms[room].storage;
                        if (Memory.rooms[room]["structures"]["links"]) {
                            var storageLinks = Memory.rooms[room]["structures"]["links"]["storage"];
                            if (storageLinks && storageLinks.length > 0) {
                                for (var link of storageLinks) {
                                    var assignedWorker = _.filter(Game.creeps, (creep) => creep.memory.role == 'linker' && creep.memory.assignedLink == link);
                                    if (assignedWorker.length < 1) {
                                        let memory = {role: 'linker', assignedLink: link, assignedStorage: storage.id};
                                        spawnCreep(spawn, "linker", memory, hasRoads=hasRoads);
                                    }
                                }
                            } 
                        }

                        //waller spawning
                        var wallers = _.filter(Game.creeps, (creep) => creep.memory.role == 'waller' && creep.room.name == room);
                        if (wallers.length < 1) {
                            spawnCreep(spawn, "waller", {role: "waller"}, hasRoads=hasRoads);
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
                    body = addMoves([WORK, WORK, WORK, WORK, WORK, CARRY], hasRoads);
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
            var newName = Game.rooms[room].name + "/" + role + "/" + Game.time;
            console.log('Spawning Creep in ' + Game.rooms[room].name + " with name " + newName);
            spawn.spawnCreep(body, newName, {memory: memory});
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
                if (BODYPART_COST[a] < BODYPART_COST[b]) {
                    return -1;
                } else if (BODYPART_COST[a] > BODYPART_COST[b]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }
    }
};

module.exports = systemSpawner2;