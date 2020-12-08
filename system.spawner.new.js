var systemSpawner2 = {
    run: function() {
        //console.log(buildComposition("E42N21", addMoves([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], true), false, 300));
        //constant task lists
        const TASK_LIST_CLAIMER = [TASK_REMOTE, TASK_ROOM_CLAIM, TASK_ROOM_SIGN];
        const TASK_LIST_WALLER = [TASK_WITHDRAW_STORAGE_CONTAINER, TASK_WITHDRAW_STORAGE, TASK_WITHDRAW_CONTAINER, TASK_HARVEST_ENERGY, TASK_REPAIR_WALL];
        const TASK_LIST_REPAIRER = [TASK_WITHDRAW_STORAGE, TASK_WITHDRAW_CONTAINER, TASK_HARVEST_ENERGY, TASK_REPAIR];
        const TASK_LIST_HARVESTER = [TASK_HARVEST_ENERGY, TASK_HARVEST_ENERGY_DROP, TASK_HARVEST_ENERGY_LINK, TASK_FILL_EXTENSION, TASK_BUILD, TASK_UPGRADE];//maybe make them put into container
        const TASK_LIST_QUARRIER = [TASK_HARVEST_MINERAL, TASK_HARVEST_MINERAL_DROP, TASK_FILL_TERMINAL];
        const TASK_LIST_UPGRADER = [TASK_WITHDRAW_STORAGE, TASK_WITHDRAW_CONTAINER,TASK_HARVEST_ENERGY, TASK_UPGRADE, TASK_UPGRADE_LINK];
        const TASK_LIST_BUILDER = [TASK_WITHDRAW_STORAGE_CONTAINER, TASK_WITHDRAW_STORAGE, TASK_WITHDRAW_TERMINAL, TASK_WITHDRAW_CONTAINER, TASK_HARVEST_ENERGY, TASK_BUILD, TASK_UPGRADE];
        const TASK_LIST_MAINTAINER = [TASK_WITHDRAW_STORAGE_CONTAINER, TASK_WITHDRAW_CONTAINER, TASK_FILL_TOWER, TASK_FILL_EXTENSION];
        const TASK_LIST_TRANSPORTER = [TASK_TRANSPORT_ENERGY, TASK_FILL_STORAGE, TASK_FILL_TERMINAL, TASK_FILL_STORAGE_CONTAINER, TASK_FILL_EXTENSION];
        const TASK_LIST_TRANSPORTER_MINERAL = [TASK_TRANSPORT_MINERALS, TASK_FILL_TERMINAL];
        const TASK_LIST_FILLER = [TASK_WITHDRAW_STORAGE_CONTAINER, TASK_WITHDRAW_STORAGE, TASK_WITHDRAW_TERMINAL, TASK_FILL_EXTENSION, TASK_RENEW, TASK_FILL_TOWER, TASK_MANAGE_TERMINAL]; //TODO: potential terminal manager?
        const TASK_LIST_PANIC = [TASK_WITHDRAW_STORAGE, TASK_WITHDRAW_TERMINAL, TASK_WITHDRAW_CONTAINER, TASK_HARVEST_ENERGY, TASK_FILL_EXTENSION];
        const TASK_LIST_REMOTE_BUILDER = [TASK_REMOTE, TASK_SALVAGE, TASK_PILLAGE, TASK_WITHDRAW_CONTAINER, TASK_HARVEST_ENERGY, TASK_BUILD, TASK_UPGRADE];
        const TASK_LIST_LINKER = [TASK_MANAGE_LINK, TASK_WITHDRAW_STORAGE, TASK_FILL_TOWER_STATIC, TASK_FILL_STORAGE_CONTAINER]
        const TASK_LIST_REMOTE_DEFENDER = [TASK_REMOTE, TASK_COMBAT_MELEE_DEFEND];

        //handles the automatic creation of claimers when I manually say to expand
        //this happens outside of our spawn loop currently
        if (Memory.config.expansion.length > 0) {
            for (var exp of Memory.config.expansion) {
                //finds the closest room that meets the requirements
                let expanderRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller && Game.rooms[room].controller.my && 
                    Game.rooms[room].find(FIND_MY_SPAWNS)[0] && room != "sim" && Game.rooms[room].energyCapacityAvailable > 850);
                var expanderRoom = _.sortBy(expanderRooms, (room) => Game.map.getRoomLinearDistance(exp, room))[0];
                //spawns
                var claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer' && creep.memory.assignedRoom == exp);
                if (claimers.length < 1) {
                    let chosenSpawn = Game.rooms[expanderRoom].find(FIND_MY_SPAWNS)[0];
                    let memory = {type: "worker", role: 'claimer', tasks: TASK_LIST_CLAIMER, assignedRoom: exp};
                    spawnCreep(chosenSpawn, "claimer", memory);
                }
            }
        }

        
        //handles the automatic creation of remote workers in case of a new territory being claimed
        //first find any rooms that the bot owns that do not have spawns
        var newRooms = _.filter(Game.rooms, room => room.controller && room.controller.my && Memory.roomsCache[room.name] && Memory.roomsCache[room.name].structures["spawns"].length == 0);
        for (var newRoom of newRooms) {
            //check to make sure that I have spawns to spawn helpers from
            if (Object.keys(Game.spawns).length > 0) { 
                //remove from memory expansions
                if (Memory.config.expansion.includes(newRoom.name)) {
                    let index = Memory.config.expansion.indexOf(newRoom.name);
                    Memory.config.expansion.splice(index, 1);
                }
                var remoteBuilders = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteBuilder' && creep.memory.assignedRoom == newRoom.name);
                if (remoteBuilders.length < 3) {
                    let expanderRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller && Game.rooms[room].controller.my && 
                    Memory.roomsCache[room].structures["spawns"].length > 0 && room != "sim" && room != newRoom.name && Game.rooms[room].energyCapacityAvailable > 700);
                    var expanderRoom = _.sortBy(expanderRooms, (room) => Game.map.getRoomLinearDistance(newRoom.name, room))[0];
                    let chosenSpawn = Game.rooms[expanderRoom].find(FIND_MY_SPAWNS)[0];
                    let memory = {type: "worker", role: 'remoteBuilder', tasks: TASK_LIST_REMOTE_BUILDER, assignedRoom: newRoom.name};
                    spawnCreep(chosenSpawn, "remoteBuilder", memory);
                }
            }
        }


        var myRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller && Game.rooms[room].controller.my && Memory.roomsCache[room].structures["spawns"].length > 0);

        //iterate through each room that has at least one spawn
        for (let room of myRooms) {

            //define a few variables that might be useful
            let roomObj = Game.rooms[room];
            let roomController = roomObj.controller;
            let roomStorage = roomObj.storage;
            let numTowers = Memory.roomsCache[room].structures.towers.length;
            let roomContainers = Memory.roomsCache[room].structures.containers.source;
            let roomSpawns = roomObj.find(FIND_MY_SPAWNS);
            let roomExtractor = Game.getObjectById(Memory.roomsCache[room].structures.extractors[0]);
            let roomMineralContainer = Game.getObjectById(Memory.roomsCache[room].structures.containers.mineral[0]);
            let roomAttackStatus = Memory.roomsPersistent[room].attackStatus;
            let hasRoads = Memory.roomsPersistent[room].roomPlanning.bunkerRoads;


            for (var spawn of roomSpawns) {
                //if the spawn is already spawning, print out the message and then skip
                if (spawn.spawning) { 
                    var spawningCreep = Game.creeps[spawn.spawning.name];
                    Game.rooms[room].visual.text(
                        '🛠️' + spawningCreep.memory.role,
                        spawn.pos.x + 1, 
                        spawn.pos.y, 
                        {align: 'left', opacity: 0.8});
                }
            }
            

            if (Memory.roomsPersistent[room].needsSpawning == false) {
                continue;
            }

            //list to hold everything that needs to spawn at different priorities. avoids sorting
            let spawnQueue = {};
            //6 priorities 0-5
            for (let i = 0; i < 6; i++) {
                spawnQueue[i] = [];
            }

            //only execute on one spawn in the room per tick. helps avoid double spawning and other issues
            let selectedSpawn = roomSpawns[Game.time % roomSpawns.length];

            

            /////////////////
            // PANIC CREEP //
            /////////////////
            if (!Memory.roomsPersistent[room].creepCounts["panic"]) {
                Memory.roomsPersistent[room].creepCounts["panic"] = 0;
            }
            var numCreeps = Object.values(Memory.roomsPersistent[room].creepCounts);
            numCreeps = numCreeps.reduce((a,b) => a+b, 0);
            if (numCreeps < 2 && roomController.level > 2) {
                let panicTasks = TASK_LIST_PANIC;

                let body = [MOVE, MOVE, CARRY, CARRY, WORK];

                //withdraw from storage if we can
                if (Game.rooms[room].storage && Game.rooms[room].storage.store.getUsedCapacity > 5000) {
                    panicTasks.unshift(TASK_WITHDRAW_STORAGE);
                    body = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE]; //no need for work if storage
                }
                let memory = {type: "worker", role: 'panic', tasks: panicTasks};
                spawnCreep(selectedSpawn, "panic", memory);
                break; //this doesn't follow the priority system, so it skips the rest of the execution
            }



            //////////////////////////////
            // REQUEST REMOTE DEFENDERS //
            //////////////////////////////
            // if (numTowers == 0) {
            //     if (!Memory.roomsPersistent[room].creepCounts["remoteDefender"]) {
            //         Memory.roomsPersistent[room].creepCounts["remoteDefender"] = 0;
            //     }
            //     let numRemoteDefenders = Memory.roomsPersistent[room].creepCounts["remoteDefender"];
            //     if (numRemoteDefenders < 1) {
            //         let expanderRooms = _.filter(Object.keys(Game.rooms), (room) => Game.rooms[room].controller.my && 
            //         Game.rooms[room].find(FIND_MY_SPAWNS)[0] && room != "sim" && Game.rooms[room].energyCapacityAvailable > 700);
            //         if (expanderRooms.length > 0) {
            //             var expanderRoom = _.sortBy(expanderRooms, (room) => Game.map.getRoomLinearDistance(controller.pos.roomName, room))[0];
            //             let chosenSpawn = Game.rooms[expanderRoom].find(FIND_MY_SPAWNS)[0];
            //             let memory = {type: 'attacker', role: "remoteDefender", assignedRoom: room, tasks: TASK_LIST_REMOTE_DEFENDER};
            //             if (spawnCreep(chosenSpawn, "remoteDefender", memory, hasRoads) == true) {
            //                 Memory.roomsPersistent[room].creepCounts["remoteDefender"] ++;
            //             }
            //             break;
            //         }
            //     }
            // }



            ////////////////////////
            // BASIC WORKER UNITS //
            ////////////////////////

            //miners spawning
            if (!Memory.roomsPersistent[room].creepCounts["miner"]) {
                Memory.roomsPersistent[room].creepCounts["miner"] = 0;
            }
            //TODO: FIGURE OUT HOW TO HANDLE creep.ticksToLive > 100 with my new source assignment
            let numMiner = Memory.roomsPersistent[room].creepCounts["miner"]; 
            if (numMiner < 2) { //assumption that the room has 2 sources

                let memory = {type: "worker", role: 'miner', tasks: TASK_LIST_HARVESTER};
                let baseBody = {WORK: 6, CARRY: 4};
                let body = buildBody(room, baseBody, hasRoads);

                spawnQueue[3].push({
                    creepMemory: memory,
                    creepBody: body
                });
            }


            //transporter spawning
            if (!Memory.roomsPersistent[room].creepCounts["transporter"]) {
                Memory.roomsPersistent[room].creepCounts["transporter"] = 0;
            }
            for (var container of roomContainers) {
                let numTransporters = _.filter(Game.creeps, (creep) => creep.memory.role == 'transporter' && creep.memory.assignedContainer == container).length;
                if (numTransporters < 1) {

                    let memory = {type: 'worker', role: 'transporter', tasks: TASK_LIST_TRANSPORTER};
                    let baseBody = {CARRY: 10};
                    let body = buildBody(room, baseBody, hasRoads);

                    spawnQueue[3].push({
                        creepMemory: memory,
                        creepBody: body
                    });
                }
            }


            //builder spawning
            if (!Memory.roomsPersistent[room].creepCounts["builder"]) {
                Memory.roomsPersistent[room].creepCounts["builder"] = 0;
            }
            let numConstructionSites = Memory.roomsCache[room].constructionSites.length;
            let numBuilders = Memory.roomsPersistent[room].creepCounts["builder"];
            //TODO: not always 2 builders?
            if (numBuilders < 2 && numConstructionSites > 0) {

                let memory = {type: "worker", role: "builder", tasks: TASK_LIST_BUILDER};
                let baseBody = {WORK: 7, CARRY:14};
                let body = buildBody(room, baseBody, hasRoads);

                spawnQueue[4].push({
                    creepMemory: memory,
                    creepBody: body
                });
            }


            //upgrader spawning
            if (!Memory.roomsPersistent[room].creepCounts["upgrader"]) {
                Memory.roomsPersistent[room].creepCounts["upgrader"] = 0;
            }
            let numUpgraders = Memory.roomsPersistent[room].creepCounts["upgrader"];
            let numToSpawn = 1;
            if (roomController.level < 4) numToSpawn = 3;
            if (numUpgraders < numToSpawn) {

                let memory = {type: "worker", role: "upgrader", tasks: TASK_LIST_UPGRADER};
                let baseBody = {WORK: 25, CARRY: 7};
                let body = buildBody(room, baseBody, hasRoads);

                spawnQueue[5].push({
                    creepMemory: memory,
                    creepBody: body
                });
            }



            /////////////////
            // PRE STORAGE //
            /////////////////

            //maintainer spawning
            if (!Memory.roomsPersistent[room].creepCounts["maintainer"]) {
                Memory.roomsPersistent[room].creepCounts["maintainer"] = 0;
            }
            let numMaintainers = Memory.roomsPersistent[room].creepCounts["maintainer"]; 
            if (numMaintainers < 1 && numTowers > 0 && (roomAttackStatus || !roomStorage)) {

                let memory = {type: "worker", role: "maintainer", tasks: TASK_LIST_MAINTAINER};
                let baseBody = {CARRY: 6};
                let body = buildBody(room, baseBody, hasRoads);

                spawnQueue[4].push({
                    creepMemory: memory,
                    creepBody: body
                });
            }


            //repairer spawning
            if (!Memory.roomsPersistent[room].creepCounts["repairer"]) {
                Memory.roomsPersistent[room].creepCounts["repairer"] = 0;
            }
            let numRepairers = Memory.roomsPersistent[room].creepCounts["repairer"]; 
            if (roomContainers.length > 0 && !roomStorage){
                if (numRepairers < 1) {

                    let memory = {type: "worker", role: "repairer", tasks: TASK_LIST_REPAIRER}
                    let baseBody = {WORK: 4, CARRY: 8};
                    let body = buildBody(room, baseBody, hasRoads);

                    spawnQueue[4].push({
                        creepMemory: memory,
                        creepBody: body
                    });
                }
            }



            //////////////////
            // POST STORAGE //
            //////////////////

            if (roomStorage) {

                //filler spawning
                if (!Memory.roomsPersistent[room].creepCounts["filler"]) {
                    Memory.roomsPersistent[room].creepCounts["filler"] = 0;
                }
                let numFillers = Memory.roomsPersistent[room].creepCounts["filler"];
                if (numFillers < 1) {      

                    let memory = {type: "worker", role: "filler", tasks: TASK_LIST_FILLER};
                    let baseBody = {CARRY: 12};
                    let body = buildBody(room, baseBody, hasRoads);

                    spawnQueue[1].push({
                        creepMemory: memory,
                        creepBody: body
                    });  
                }

                
                //waller spawning
                if (!Memory.roomsPersistent[room].creepCounts["waller"]) {
                    Memory.roomsPersistent[room].creepCounts["waller"] = 0;
                }
                let numWallers = Memory.roomsPersistent[room].creepCounts["waller"];
                if (numWallers < 1) {

                    let memory = {type: "worker", role: "waller", tasks: TASK_LIST_WALLER};
                    let baseBody = {WORK: 4, CARRY: 3};
                    let body = buildBody(room, baseBody, hasRoads);

                    spawnQueue[4].push({
                        creepMemory: memory,
                        creepBody: body
                    });
                }


                //linker spawning
                if (!Memory.roomsPersistent[room].creepCounts["linker"]) {
                    Memory.roomsPersistent[room].creepCounts["linker"] = 0;
                }
                let numLinkers = Memory.roomsPersistent[room].creepCounts["linker"];
                let numStorageLinks = Memory.roomsCache[room].structures.links.storage.length;
                if (numLinkers < 1 && numStorageLinks > 0) {

                    let memory = {type: "worker", role: "linker", tasks: TASK_LIST_LINKER};
                    let baseBody = {CARRY: 10};
                    let body = buildBody(room, baseBody, hasRoads);

                    spawnQueue[2].push({
                        creepMemory: memory,
                        creepBody: body
                    });
                }
            }


            ////////////////////
            // POST EXTRACTOR //
            ////////////////////

            if (roomExtractor && roomMineralContainer) {

                if (!Memory.roomsPersistent[room].creepCounts["quarrier"]) {
                    Memory.roomsPersistent[room].creepCounts["quarrier"] = 0;
                }
                let numQuarriers = Memory.roomsPersistent[room].creepCounts["quarrier"];
                if (numQuarriers < 1 && Memory.roomsPersistent[room].mineralTimer < Game.time) {
                    
                    let memory = {type: "worker", role: "quarrier", tasks: TASK_LIST_QUARRIER};
                    let baseBody = {WORK: 15};
                    let body = buildBody(room, baseBody, hasRoads);

                    spawnQueue[5].push({
                        creepMemory: memory,
                        creepBody: body
                    });
                }

                //spawn mineral transporter once the container is mostly full
                if (roomMineralContainer && roomMineralContainer.store.getUsedCapacity() > 1100) {
                    if (!Memory.roomsPersistent[room].creepCounts["mineralTransporter"]) {
                        Memory.roomsPersistent[room].creepCounts["mineralTransporter"] = 0;
                    }
                    let numMineralTransporters = Memory.roomsPersistent[room].creepCounts["mineralTransporter"];
                    if (numMineralTransporters < 1) {

                        let memory = {type: "worker", role: "mineralTransporter", tasks: TASK_LIST_TRANSPORTER_MINERAL};
                        let baseBody = {WORK: 15};
                        let body = buildBody(room, baseBody, hasRoads);

                        spawnQueue[5].push({
                            creepMemory: memory,
                            creepBody: body
                        });
                    }
                }
            }



            //spawn the creeps based of the queue
            //TODO: store this between ticks?
            let queueFull = false;
            for (var i = 0; i < 6; i++) {
                if (spawnQueue[i].length > 0) {
                    //if the spawn is successful, remove the spawned creep from the queue then move to next spawn.
                    queueFull = true;
                    if (spawnCreep(selectedSpawn, spawnQueue[i][0].creepBody, spawnQueue[i][0].creepMemory) == 0) {
                        spawnQueue[i].shift(); //remove the first element from the priority
                    }
                    break;
                }
            }

            //if there is nothing in the queue, nothing needs to spawn
            if (queueFull == false) {
                Memory.roomsPersistent[room].needsSpawning = false;
            }
        }

        /**
         * function to spawn a creep
         * @param {object} spawn 
         * @param {array} body 
         * @param {object} memory 
         */
        function spawnCreep(spawn, body, memory) {
            let spawnRoom = spawn.room.name;

            memory["spawnRoom"] = spawnRoom;


            var newName = spawnRoom + "/" + memory.role + "/" + Game.time;
            let spawnSuccess = spawn.spawnCreep(body, newName, {memory: memory});
            if (spawnSuccess == 0) {
                let hyperLink = "<a href='#!/room/shard3/" + spawnRoom + "'>" + spawnRoom + "</a>"
                console.log('Spawning Creep in ' + hyperLink + " with name " + newName);

                //if the spawn is successful, increment the number of creeps of that role in the room
                Memory.roomsPersistent[spawnRoom].creepCounts[memory.role]++;
                Memory.roomsPersistent[spawnRoom].stats.creepsSpawned++;
                
                //keep track of energy spent on creeps
                let totalCost = 0;
                for (let part of body) {
                    totalCost += BODYPART_COST[part];
                }
                Memory.roomsPersistent[spawnRoom].stats.energySpentSpawning += totalCost;
                
                return true; //spawn succeeded so return true
            }
            return false; //spawn failed so return false
        }


        /**
         * function to create a bodypart array from an object and scale it to the room
         * @param {string} room
         * @param {object} body 
         * @param {boolean} increase 
         * @param {integer} maxEnergy 
         */
        function buildBody(room, body, roads, maxSpend=0) {
            body = bodyFromObject(body);
            body = addMoves(body, roads);
            let ratio = 0.5;//half the body will be MOVE
            if (roads == true) ratio = 0.33;//reduced down to a ~third if there are roads

            //cap maxEnergy to the available energy in the room
            if (maxSpend == 0 || maxSpend > Game.rooms[room].energyCapacityAvailable) {
                maxSpend = Game.rooms[room].energyCapacityAvailable;
            }

            var bodyCounts = {};
            var totalCost = 0;
            for (let part of body) {
                totalCost += BODYPART_COST[part];
                if (!bodyCounts[part]) {
                    bodyCounts[part] = 0;
                }
                bodyCounts[part] += 1;
            }

            //decrease the array if it costs too much
            if (totalCost > maxSpend || (bodyCounts[MOVE] / body.length) > ratio || body.length > 50) {
                let counter = 0;
                while(totalCost > maxSpend) {

                    //scale the move ratio depending on how big the creep is. at smaller creeps it will be closer to 0.5
                    let scaledBody = body.length
                    if (scaledBody > 9) scaledBody = 12;
                    let scaledRatio = ratio * (1 + (1 - (scaledBody / 12)));
                    if (scaledRatio > 0.65) scaledRatio = 0.65;
                    let selected; //bodypart to remove
                    if (counter > 100) break;

                    //check to make sure moves are in the appropriate ratio
                    if ((bodyCounts[MOVE] / body.length) > scaledRatio) {
                        selected = MOVE;
                    } else {
                        //find the most common part
                        let most = {num: 0, type: "none"};
                        for (let part of Object.keys(bodyCounts)) {
                            if (part == MOVE) {
                                continue; //skip if move part
                            }
                            if (bodyCounts[part] > most.num) {
                                most = {num: bodyCounts[part], type: part};
                            }
                        }
                        selected = most.type;
                    }

                    var index = body.indexOf(selected);
                    if (index > -1) {
                        body.splice(index, 1);
                        totalCost -= BODYPART_COST[selected];
                        bodyCounts[selected]--;
                    }



                    counter++;
                }
                return body;

            }
        }


        /**
         * function to return a body array from a simplified object form
         * @param {object} bodyObj 
         */
        function bodyFromObject(bodyObj) {
            bodyArr = [];

            for (let bodypart of Object.keys(bodyObj)) {
                for (var i = 0; i < bodyObj[bodypart]; i++) {
                    bodyArr.push(bodypart.toLowerCase());
                }
            }
            bodyArr.sort(compareBodyParts);
            return bodyArr;
        }


        /**
         * function to sort a bodypart array
         * @param {bodypart} a 
         * @param {bodypart} b 
         */
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


        /**
         * function to add the appropriate ratio of moves onto a body
         * @param {array} body the body to add moves onto
         * @param {boolean} roads whether the room has roads or not
         */
        function addMoves(body, roads) {
            let ratio = 1; //double the body with roads
            if (roads) {
                ratio = 0.5; //only one move per 2 parts
            }

            let numMoves = Math.ceil(body.length * ratio);
            let newBody = body;
            
            for (var i = 0; i < numMoves; i++) {
                newBody.unshift(MOVE);
            }
            return newBody;
        }
    }
};

module.exports = systemSpawner2;