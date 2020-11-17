var systemSpawner2 = {
    run: function() {
        //constant task lists
        const TASK_LIST_CLAIMER = [TASK_REMOTE, TASK_ROOM_CLAIM, TASK_ROOM_SIGN];
        const TASK_LIST_WALLER = [TASK_WITHDRAW_STORAGE, TASK_WITHDRAW_CONTAINER, TASK_HARVEST_ENERGY, TASK_REPAIR_WALL];
        const TASK_LIST_REPAIRER = [TASK_WITHDRAW_STORAGE, TASK_WITHDRAW_CONTAINER, TASK_HARVEST_ENERGY, TASK_REPAIR];
        const TASK_LIST_HARVESTER = [TASK_HARVEST_ENERGY, TASK_HARVEST_ENERGY_DROP, TASK_HARVEST_ENERGY_LINK, TASK_FILL_EXTENSION, TASK_BUILD, TASK_UPGRADE];//maybe make them put into container
        const TASK_LIST_UPGRADER = [TASK_WITHDRAW_STORAGE, TASK_WITHDRAW_CONTAINER,TASK_HARVEST_ENERGY, TASK_UPGRADE, TASK_UPGRADE_LINK];
        const TASK_LIST_BUILDER = [TASK_WITHDRAW_STORAGE, TASK_WITHDRAW_CONTAINER, TASK_HARVEST_ENERGY, TASK_BUILD, TASK_UPGRADE];
        const TASK_LIST_MAINTAINER = [TASK_WITHDRAW_STORAGE, TASK_WITHDRAW_CONTAINER, TASK_HARVEST_ENERGY, TASK_FILL_TOWER, TASK_FILL_EXTENSION];
        const TASK_LIST_TRANSPORTER = [TASK_TRANSPORT_ENERGY, TASK_FILL_STORAGE, TASK_FILL_EXTENSION];
        const TASK_LIST_FILLER = [TASK_WITHDRAW_STORAGE, TASK_FILL_EXTENSION, TASK_FILL_TOWER];
        const TASK_LIST_PANIC = [TASK_WITHDRAW_CONTAINER, TASK_HARVEST_ENERGY, TASK_FILL_EXTENSION];
        const TASK_LIST_REMOTE_BUILDER = [TASK_REMOTE, TASK_WITHDRAW_CONTAINER, TASK_HARVEST_ENERGY, TASK_BUILD, TASK_UPGRADE];

        const TASK_LIST_REMOTE_DEFENDER = [TASK_REMOTE, TASK_COMBAT_MELEE_DEFEND];
        //TODO PROBABLY CAN COMBINE MAINTAINER AND FILLER AS LONG AS THERE ISN't AN ATTACK GOING ON

        //ADD IN PRIORITIZATION
        //TODO:
        //CHECK IF THERE IS AN ONGOING ATTACK, IF SO STALL ALL NON ESSENTIAL CREEP SPAWNING AND SPAWN DEFENDERS
        //

        //code snippet that handles expansions into new rooms
        //Add a new expansion target by executing Memory.config.expansion.push(target) in console

        if (Memory.config.expansion.length > 0) {
            for (var exp of Memory.config.expansion) {
                //finds the closest spawn
                let expanderRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller.my && 
                    Game.rooms[room].find(FIND_MY_SPAWNS)[0] && room != "sim" && Game.rooms[room].energyCapacityAvailable > 850);
                var expanderRoom = _.sortBy(expanderRooms, (room) => Game.map.getRoomLinearDistance(exp, room))[0];
                var claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer' && creep.memory.assignedRoom == exp);
                if (claimers.length < 1) {
                    let chosenSpawn = Game.rooms[expanderRoom].find(FIND_MY_SPAWNS)[0];
                    let memory = {type: "worker", role: 'claimer', tasks: TASK_LIST_CLAIMER, assignedRoom: exp};
                    spawnCreep(chosenSpawn, "claimer", memory);
                }
            }
        }

        //handles the automatic creation of remote workers in case of a new territory being claimed
        //first find any claimed controllers that do not have a spawn
        var controllers = _.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_CONTROLLER && !structure.room.storage);
        for (var controller of controllers) {
            if (Object.keys(Game.spawns).length > 0) { 
                //remove from memory expansions
                if (Memory.config.expansion.includes(controller.room.name)) {
                    let index = Memory.config.expansion.indexOf(controller.room.name);
                    Memory.config.expansion.splice(index, 1);
                }
                var remoteBuilders = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteBuilder' && creep.memory.assignedRoom == controller.pos.roomName);
                if (remoteBuilders.length < 3) {
                    let expanderRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller.my && 
                    Memory.roomsCache[room].structures["spawns"].length > 0 && room != "sim" && room != controller.room.name && Game.rooms[room].energyCapacityAvailable > 700);
                    var expanderRoom = _.sortBy(expanderRooms, (room) => Game.map.getRoomLinearDistance(controller.pos.roomName, room))[0];
                    let chosenSpawn = Game.rooms[expanderRoom].find(FIND_MY_SPAWNS)[0];
                    let memory = {type: "worker", role: 'remoteBuilder', tasks: TASK_LIST_REMOTE_BUILDER, assignedRoom: controller.pos.roomName};
                    spawnCreep(chosenSpawn, "remoteBuilder", memory);
                }
            }
        }

        //iterate through rooms that I own and have at least one spawn
        let myRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller.my && Memory.roomsCache[room].structures["spawns"].length > 0);
        for (var room of myRooms) {
            
            //begin of spawning loop. Loop through each spawn in the room and save the spawns and controller to variables
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
            //list to hold everything that needs to spawn
            var spawnQueue = [];
            
            //set spawning memory to not spawning
            if (!Memory.roomsPersistent[room].spawns) {
                Memory.roomsPersistent[room].spawns = {};
            }
            Memory.roomsPersistent[room].spawns[spawn.name] = "none";
            let hasRoads = true;

            if (Memory.roomsPersistent[room].roomPlanning && Memory.roomsPersistent[room].roomPlanning.travelRoadsBuilt) {
                hasRoads = Memory.roomsPersistent[room].roomPlanning.bunkerRoads;
            }

            //last resort room bootstrapping
            //TODO: BUGGED AF
            if (!Memory.roomsPersistent[room].creepCounts["panic"]) {
                Memory.roomsPersistent[room].creepCounts["panic"] = 0;
            }
            var numCreeps = Object.values(Memory.roomsPersistent[room].creepCounts);
            numCreeps = numCreeps.reduce((a,b) => a+b, 0);
            if (numCreeps < 2) {
                let panicTasks = TASK_LIST_PANIC;
                if (Game.rooms[room].storage.store.getUsedCapacity > 50000) panicTasks.unshift(TASK_WITHDRAW_STORAGE);
                let memory = {type: "worker", role: 'panic', tasks: panicTasks};
                spawnCreep(roomSpawns[0], "panic", memory, hasRoads);
                break;
            }

            //transporter spawning
            //TODO: breaking with containerse on extractors
            if (!Memory.roomsPersistent[room].creepCounts["transporter"]) {
                Memory.roomsPersistent[room].creepCounts["transporter"] = 0;
            }
            var containers = Memory.roomsCache[room].structures.sourceContainers;
            for (var container of containers) {
                let numTransporters = _.filter(Game.creeps, (creep) => creep.memory.role == 'transporter' && creep.memory.assignedContainer == container).length;
                if (numTransporters < 1) {
                    if (!currentlySpawning.includes("transporter")) {
                        let memory = {type: 'worker', role: 'transporter', tasks: TASK_LIST_TRANSPORTER}
                        spawnQueue.unshift({
                            creepName: "transporter",
                            creepMemory: memory,
                            creepHasRoads: hasRoads
                        });
                    }
                }
            }

            //miners spawning
            if (!Memory.roomsPersistent[room].creepCounts["miner"]) {
                Memory.roomsPersistent[room].creepCounts["miner"] = 0;
            }
            var sources = Object.keys(Memory.roomsPersistent[room].sources);
            for (var source of sources) {
                //TODO: FIGURE OUT HOW TO HANDLE creep.ticksToLive > 100 with my new source assignment
                let numWorker = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner' && creep.memory.assignedSource == source).length;      
                if (numWorker < 1) {
                    if (!currentlySpawning.includes("miner")) {
                        let memory = {type: "worker", role: 'miner', tasks: TASK_LIST_HARVESTER};
                        spawnQueue.unshift({
                            creepName: "miner",
                            creepMemory: memory,
                            creepHasRoads: hasRoads
                        });
                    }
                }
            }
            
            //builder spawning
            if (!Memory.roomsPersistent[room].creepCounts["builder"]) {
                Memory.roomsPersistent[room].creepCounts["builder"] = 0;
            }
            let numConstructionSites = Memory.roomsCache[room].constructionSites.length;
            let numBuilders = Memory.roomsPersistent[room].creepCounts["builder"]; 
            if (numBuilders < 2 && numConstructionSites > 0) {
                if (!currentlySpawning.includes("builder")) {
                    spawnQueue.push({
                        creepName: "builder",
                        creepMemory: {type: "worker", role: "builder", tasks: TASK_LIST_BUILDER},
                        creepHasRoads: hasRoads
                    });
                }
            }


            //upgrader spawning
            if (!Memory.roomsPersistent[room].creepCounts["upgrader"]) {
                Memory.roomsPersistent[room].creepCounts["upgrader"] = 0;
            }
            let numUpgraders = Memory.roomsPersistent[room].creepCounts["upgrader"];
            let numToSpawn = 1;
            if (roomController.level < 4) numToSpawn = 3;
            if (numUpgraders < numToSpawn) {
                if (!currentlySpawning.includes("upgrader")) {
                    spawnQueue.push({
                        creepName: "upgrader",
                        creepMemory: {type: "worker", role: "upgrader", tasks: TASK_LIST_UPGRADER},
                        creepHasRoads: hasRoads
                    });
                }
            }

            //remote defender spawning
            var numTowers = Memory.roomsCache[room].structures.towers.length;
            if (numTowers == 0) {
                if (!Memory.roomsPersistent[room].creepCounts["remoteDefender"]) {
                    Memory.roomsPersistent[room].creepCounts["remoteDefender"] = 0;
                }
                let numRemoteDefenders = Memory.roomsPersistent[room].creepCounts["remoteDefender"];
                if (numRemoteDefenders < 1) {
                    let expanderRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller.my && 
                    Game.rooms[room].find(FIND_MY_SPAWNS)[0] && room != "sim" && Game.rooms[room].energyCapacityAvailable > 700);
                    if (expanderRooms.length > 0) {
                        var expanderRoom = _.sortBy(expanderRooms, (room) => Game.map.getRoomLinearDistance(controller.pos.roomName, room))[0];
                        let chosenSpawn = Game.rooms[expanderRoom].find(FIND_MY_SPAWNS)[0];
                        let memory = {type: 'attacker', role: "remoteDefender", assignedRoom: room, tasks: TASK_LIST_REMOTE_DEFENDER};
                        if (spawnCreep(chosenSpawn, "remoteDefender", memory, hasRoads) == true) {
                            Memory.roomsPersistent[room].creepCounts["remoteDefender"] ++;
                        }
                        break;
                    }
                }
            }

            //repairer spawning
            if (!Memory.roomsPersistent[room].creepCounts["repairer"]) {
                Memory.roomsPersistent[room].creepCounts["repairer"] = 0;
            }
            let numRepairers = Memory.roomsPersistent[room].creepCounts["repairer"]; 
            
            if (containers.length > 0 && !Game.rooms[room].storage){
                if (numRepairers < 1) {
                    if (!currentlySpawning.includes("repairer")) {
                        spawnQueue.push({
                            creepName: "repairer",
                            creepMemory: {type: "worker", role: "repairer", tasks: TASK_LIST_REPAIRER},
                            creepHasRoads: hasRoads
                        });
                    }
                }
            }
            
            //once the room can have towers
            if (roomController.level > 2) {

                if (!Memory.roomsPersistent[room].creepCounts["maintainer"]) {
                    Memory.roomsPersistent[room].creepCounts["maintainer"] = 0;
                }
                let numMaintainers = Memory.roomsPersistent[room].creepCounts["maintainer"]; 
                //maintainer spawning
                if (numMaintainers < 1 && numTowers > 0 && (Memory.roomsPersistent[room].attackStatus || !Game.rooms[room].storage)) {
                    if (!currentlySpawning.includes("maintainer")) {
                        spawnQueue.push({
                            creepName: "maintainer",
                            creepMemory: {type: "worker", role: "maintainer", tasks: TASK_LIST_MAINTAINER},
                            creepHasRoads: hasRoads
                        });
                    }
                }

                //waller spawning
                if (!Memory.roomsPersistent[room].creepCounts["waller"]) {
                    Memory.roomsPersistent[room].creepCounts["waller"] = 0;
                }
                let numWallers = Memory.roomsPersistent[room].creepCounts["waller"];
                if (numWallers < 1) {
                    if (!currentlySpawning.includes("waller")) {
                        spawnQueue.push({
                            creepName: "waller",
                            creepMemory: {type: "worker", role: "waller", tasks: TASK_LIST_WALLER},
                            creepHasRoads: hasRoads
                        });
                    }
                }
                
                //once the room can have links
                if (roomController.level > 4) {
                    //linker spawning
                    if (!Memory.roomsPersistent[room].creepCounts["linker"]) {
                        Memory.roomsPersistent[room].creepCounts["linker"] = 0;
                    }
                    let numLinkers = Memory.roomsPersistent[room].creepCounts["linker"];
                    let numStorageLinks = Memory.roomsCache[room].structures.links.storage.length;
                    if (numLinkers < 1 && numStorageLinks > 0) {
                        if (!currentlySpawning.includes("linker")) {
                            spawnQueue.push({
                                creepName: "linker",
                                creepMemory: {type: "worker", role: "linker", tasks: [TASK_MANAGE_LINK]},
                                creepHasRoads: hasRoads
                            });
                        }
                    } 
                }
                //if there is a storage, create dedicated filler role
                if (Game.rooms[room].storage) {
                    //filler spawning
                    if (!Memory.roomsPersistent[room].creepCounts["filler"]) {
                        Memory.roomsPersistent[room].creepCounts["filler"] = 0;
                    }
                    let numFillers = Memory.roomsPersistent[room].creepCounts["filler"];
                    if (numFillers < 1) {
                        if (!currentlySpawning.includes("filler")) {
                            if (Game.rooms[room].storage.store.getUsedCapacity() > 10000) {
                                spawnQueue.unshift({
                                    creepName: "filler",
                                    creepMemory: {type: "worker", role: "filler", tasks: TASK_LIST_FILLER},
                                    creepHasRoads: hasRoads
                                });
                            } else {
                                spawnQueue.push({
                                    creepName: "filler",
                                    creepMemory: {type: "worker", role: "filler", tasks: TASK_LIST_FILLER},
                                    creepHasRoads: hasRoads
                                });
                            }
                        }
                    }
                }
            }

            //loop through each spawn in a room
            for (var spawn of roomSpawns) {
                //if the spawn is already spawning, print out the message and then skip
                if (spawn.spawning) { 
                    var spawningCreep = Game.creeps[spawn.spawning.name];
                    Game.rooms[room].visual.text(
                        '🛠️' + spawningCreep.memory.role,
                        spawn.pos.x + 1, 
                        spawn.pos.y, 
                        {align: 'left', opacity: 0.8});
                    continue;
                }
    
                if (spawnQueue.length > 0) {
                    //if the spawn is successful, remove the spawned creep from the queue then move to next spawn.
                    if (spawnCreep(spawn, spawnQueue[0]["creepName"], spawnQueue[0]["creepMemory"], spawnQueue[0]["creepHasRoads"])) {
                        spawnQueue.shift();
                    }
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
                case "claimer":
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
                        body = buildComposition(spawnRoom, [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], false);
                    }
                    break;
                case "transporter":
                    //TODO: calculate how many parts there should be depending on distance
                    body = addMoves([CARRY], hasRoads);
                    body = buildComposition(spawnRoom, body, true, 800);
                    break;
                case "panic":
                    body = addMoves([WORK, CARRY, CARRY, CARRY], hasRoads);
                    console.log(body);
                    body = buildComposition(spawnRoom, body, true, 300);
                    break;
                case "builder":
                    body = addMoves([WORK, CARRY, CARRY], hasRoads);
                    body = buildComposition(spawnRoom, body, true, 1000);
                    break;
                case "upgrader":
                    if (Memory.roomsCache[spawnRoom].structures.links.controller && Memory.roomsCache[spawnRoom].structures.links.controller.length > 0) {
                        body = addMoves([WORK, WORK, WORK, WORK, WORK, CARRY, CARRY], hasRoads);
                    } else {
                        body = addMoves([WORK, CARRY], hasRoads);
                    }
                    let storage = Game.rooms[spawnRoom].storage;
                    if (storage && storage.store.getUsedCapacity() > (storage.store.getCapacity() / 2)) {
                        //Unlimited cost on upgraders if the storage gets above a certain capacity
                        body = buildComposition(spawnRoom, body, true);
                    } else {
                        body = buildComposition(spawnRoom, body, true, 1200);
                    }
                    break;
                case "maintainer":
                    body = addMoves([CARRY], hasRoads);
                    body = buildComposition(spawnRoom, body, true, 700);
                    break;
                case "linker":
                    //doesn't matter if roads or not
                    body = buildComposition(spawnRoom, [CARRY, CARRY, MOVE], false);
                    break;
                case "waller":
                    body = addMoves([WORK, CARRY], hasRoads);
                    body = buildComposition(spawnRoom, body, true, 800);
                    break;
                case "repairer":
                    body = addMoves([WORK, CARRY, CARRY], hasRoads);
                    body = buildComposition(spawnRoom, body, true, 600);
                    break;
                case "filler":
                    body = addMoves([CARRY], hasRoads);
                    body = buildComposition(spawnRoom, body, true, 800);
                    break;
            }
            memory["spawnRoom"] = spawnRoom;
            var newName = spawnRoom + "/" + role + "/" + Game.time;
            let spawnSuccess = spawn.spawnCreep(body, newName, {memory: memory});
            if (spawnSuccess == 0) {
                let hyperLink = "<a href='#!/room/shard3/" + spawnRoom + "'>" + spawnRoom + "</a>"
                console.log('Spawning Creep in ' + hyperLink + " with name " + newName);

                //if the spawn is successful, increment the number of creeps of that role in the room
                Memory.roomsPersistent[spawnRoom].creepCounts[role]++;
                Memory.roomsPersistent[room].stats.creepsSpawned++;
                
                //keep track of energy spent on creeps
                let totalCost = 0;
                for (let part of body) {
                    totalCost += BODYPART_COST[part];
                }
                Memory.roomsPersistent[room].stats.energySpentSpawning += totalCost;
                
                
                //this code keeps two spawns from spawning the same creep
                if (!Memory.roomsPersistent[spawnRoom].spawns) {
                    Memory.roomsPersistent[spawnRoom].spawns = {};
                }
                Memory.roomsPersistent[spawnRoom].spawns[spawn.name] = role;
                return true; //spawn succeeded so return true
            }
            return false; //spawn failed so return false
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
                return buildComposition(room, body, increase, maxEnergy);
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