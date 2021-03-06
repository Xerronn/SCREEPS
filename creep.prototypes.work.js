/**
 * Definitions of creep prototypes for actions
 */
var systemPrototypes = {
    run: function() {
        global.TASK_UPGRADE = "upgrade";
        global.TASK_UPGRADE_LINK = "upgrade_link";
        global.TASK_BUILD = "build";
        global.TASK_MANAGE_LINK = "manage_link";
        global.TASK_MANAGE_TERMINAL = "manage_terminal";
        global.TASK_REPAIR = "repair";
        global.TASK_REPAIR_WALL = "repair_wall";
        global.TASK_RENEW = "renew";
        global.TASK_REMOTE = "remote";
        global.TASK_ROOM_SIGN = "sign";
        global.TASK_ROOM_CLAIM = "claim";
        global.TASK_ROOM_RESERVE = "reserve";

        //wrapper for moveTo to hopefully improve efficiency
        if (!Creep.prototype._moveTo) {
            Creep.prototype._moveTo = Creep.prototype.moveTo;

            //TODO: fix for remote. 500 not enough
            Creep.prototype.moveTo = function(destination, options = {}) {
                if (Object.keys(Memory.roomsPersistent).includes(this.room.name)) {
                    options.obstacles = [];
                    if (!this.memory.tasks.includes(TASK_MANAGE_LINK) && this.room.controller.level >= 5) {
                        let linkerPos = Memory.roomsPersistent[this.room.name].roomPlanning.linkerSpot;
                        options.obstacles.push({pos: new RoomPosition(linkerPos.x, linkerPos.y, this.room.name)});
                    }
                    if (!this.memory.tasks.includes(TASK_MANAGE_TERMINAL) && this.room.controller.level >= 6) {
                        let alchPos = Memory.roomsPersistent[this.room.name].roomPlanning.treasurerSpot;
                        options.obstacles.push({pos: new RoomPosition(alchPos.x, alchPos.y, this.room.name)});
                    }
                }
                options.maxOps = 500;
                if (this.pos.inRangeTo(destination, 4)) {
                    options.maxOps = 100;
                    this.travelTo(destination, options); 
                } else {
                    options.range = 4;
                    this.travelTo(destination, options);
                }
            }
        }

        //MY ATTEMPT AT CUSTOM MOVE CODE
        // if (!Creep.prototype._moveTo) {
        //     Creep.prototype._moveTo = Creep.prototype.moveTo;

        //     //TODO: fix for remote. 500 not enough
        //     Creep.prototype.moveTo = function(destination, options = {maxOps: 500}) {
        //         let startCpu = Game.cpu.getUsed();
        //         options = {"maxOps": 500, "costCallback": getCostMatrix, "reusePath": 10, "range": 1};

        //         //check if the creep is stuck
        //         if (!this.memory.moveData || !this.memory.moveData.lastCoords) {
        //             if (!this.memory.moveData) {
        //                 this.memory.moveData = {};
        //             }
        //             this.memory.moveData.lastCoords = this.pos;
        //         }
        //         if (this.pos.isEqualTo(this.memory.moveData.lastCoords.x, this.memory.moveData.lastCoords.y)) {
        //             if (!this.memory.moveData.stuckCount) {
        //                 this.memory.moveData.stuckCount = 1;
        //             } else {
        //                 this.memory.moveData.stuckCount++;
        //             }
        //         } else {
        //             this.memory.moveData.stuckCount = 0;
        //             this.memory.moveData.lastCoords = this.pos;
        //         }

        //         if (this.memory.moveData.stuckCount >= 3) {
        //             if (this.memory.moveData.stuckCount >= 6) {
        //                 console.log(this.name + " STUCK!");
        //             }
        //             options.costCallback = getCreepMatrix;
        //             options.maxOps = 500;
        //             this._moveTo(destination, options);
        //             return;
        //         }

        //         if (this.pos.inRangeTo(destination, 4)) {
        //             // options.maxOps = 100;
        //             this._moveTo(destination, options); 
        //         } else {
        //             // options.range = 4;
        //             this._moveTo(destination, options);
        //         }
        //     }

        //     function getCostMatrix (room, mat) {
        //         let matrix;
        //         if (!Memory.roomsPersistent[room].costMatrix || !Memory.roomsPersistent[room].costMatrixRefresh || Memory.roomsPersistent[room].costMatrixRefresh < Game.time) {
        //             matrix = generateCostMatrix(room);
        //             Memory.roomsPersistent[room].costMatrix = matrix.serialize();
        //             Memory.roomsPersistent[room].costMatrixRefresh = Game.time + 1500;
        //             return matrix;
        //         } else {
        //             matrix = PathFinder.CostMatrix.deserialize(Memory.roomsPersistent[room].costMatrix);
        //             return matrix;
        //         }
        //     }

        //     function generateCostMatrix (room) {
        //         let impassibleStructures = [];
        //         let matrix = new PathFinder.CostMatrix();
        //         room = Game.rooms[room];
        //         //dissuade creeps from pathing across the linker position
        //         let roomAnchor = Memory.roomsPersistent[room.name].roomPlanning.anchor; 
        //         matrix.set(roomAnchor.x, roomAnchor.y, 100);
        //         for (let structure of room.find(FIND_STRUCTURES)) {
        //             if (structure instanceof StructureRampart) {
        //                 if (!structure.my && !structure.isPublic) {
        //                     impassibleStructures.push(structure);
        //                 }
        //             }
        //             else if (structure instanceof StructureRoad) {
        //                 matrix.set(structure.pos.x, structure.pos.y, 1);
        //             }
        //             else if (structure instanceof StructureContainer) {
        //                 matrix.set(structure.pos.x, structure.pos.y, 5);
        //             }
        //             else {
        //                 impassibleStructures.push(structure);
        //             }
        //         }
        //         for (let site of room.find(FIND_MY_CONSTRUCTION_SITES)) {
        //             if (site.structureType === STRUCTURE_CONTAINER || site.structureType === STRUCTURE_ROAD
        //                 || site.structureType === STRUCTURE_RAMPART) {
        //                 continue;
        //             }
        //             matrix.set(site.pos.x, site.pos.y, 0xff);
        //         }
        //         for (let structure of impassibleStructures) {
        //             matrix.set(structure.pos.x, structure.pos.y, 0xff);
        //         }
        //         return matrix;
        //     }

        //     function getCreepMatrix(room) {
        //         return addCreepsToMatrix(room, generateCostMatrix(room));
        //     }

        //     function addCreepsToMatrix(room, matrix) {
        //         room = Game.rooms[room];
        //         room.find(FIND_CREEPS).forEach((creep) => matrix.set(creep.pos.x, creep.pos.y, 0xff));
        //         return matrix;
        //     }
        // }


    
        //task to upgrade the controller
        if (!Creep.prototype._upgradeController) {
            //store the original version of the function
            Creep.prototype._upgradeController = Creep.prototype.upgradeController;
            //TODO: fix link upgrading. creeps will first stop by a storage, hugely inefficient
            Creep.prototype.upgradeController = function () {
                var creepController = this.room.controller;
                
                //use cached memory to check if there is a controller link
                if (!this.memory.assignedControllerLink) {
                    if (Memory.roomsCache[this.room.name].structures.links.controller.length > 0) {
                        this.memory.assignedControllerLink = Memory.roomsCache[this.room.name].structures.links.controller[0];
                        //get rid of all other tasks if there is a link
                        //this.memory.tasks = [TASK_UPGRADE_LINK];
                    } else {
                        //remove link upgrading if there is no link
                        let array = this.memory.tasks;
                        let index = array.indexOf(TASK_UPGRADE_LINK);
                        if (index > -1) {
                            array.splice(index, 1);
                            this.memory.tasks = array;
                        }
                        this.memory.assignedControllerLink = "none";
                    }
                }
                //set state only if it has link mining
                if (this.memory.tasks.includes(TASK_UPGRADE_LINK) && this.memory.assignedControllerLink != "none") {
                    if (this.store.getUsedCapacity(RESOURCE_ENERGY) - this.countBodyType(WORK) <= 0) {
                        this.memory.linkHarvesting = true;
                    } else if (this.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                        this.memory.linkHarvesting = false;
                    }
                }
                if (!this.memory.harvesting && !this.memory.linkHarvesting) {
                    if (this.pos.inRangeTo(creepController, 3)) {
                        let success = this._upgradeController(creepController);
                        if (success == 0) {
                            let numWork = this.countBodyType(WORK);
                            Memory.roomsPersistent[this.room.name].stats.energySpentUpgrading += numWork;
                        }
                    } else {
                        this.moveTo(creepController, {visualizePathStyle: {stroke: COLOR_ENERGY_SPEND, lineStyle: 'undefined'}});
                    }
                    return true; //move to next tick
                } else {
                    if (this.memory.tasks.includes(TASK_UPGRADE_LINK) && this.memory.assignedControllerLink != "none") {
                        var creepLink = Game.getObjectById(this.memory.assignedControllerLink);
                        if (this.pos.inRangeTo(creepLink, 1)) {
                            this.withdraw(creepLink, RESOURCE_ENERGY);
                        } else {
                            this.moveTo(creepLink, {visualizePathStyle: {stroke: COLOR_ENERGY_GET, lineStyle: 'undefined'}});
                        }
                        return true; //move to next tick
                    } else {
                        return false; //move on to next task
                    }
                }
            }
        }



        //task to build structures
        if (!Creep.prototype._build) {
            //store the original version of the function
            Creep.prototype._build = Creep.prototype.build;

            Creep.prototype.build = function() {
                //check memory if the room has any construction sites
                if (Memory.roomsCache[this.pos.roomName].constructionSites.length > 0 && this.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && !this.memory.harvesting) {
                    //find the closest site
                    //TODO: optimize this somehow more
                    if (this.memory.siteTarget && this.memory.siteTarget != "none") {
                        let creepSiteTarget = Game.getObjectById(this.memory.siteTarget);

                        //set the memory to none if it no longer exists
                        if (!creepSiteTarget) {
                            this.memory.siteTarget = "none";
                        }
                    }
                    //assign a new object that needs building to be the target
                    if (!this.memory.siteTarget || this.memory.siteTarget == "none") {
                        //filter out null sites and then convert to live objects
                        let siteList = Memory.roomsCache[this.pos.roomName].constructionSites.filter(
                                site => Game.getObjectById(site) != null
                        ).map(
                            site => Game.getObjectById(site)
                        );
                        //if there are any sites
                        if (siteList.length > 0) {
                            this.memory.siteTarget = this.pos.findClosestByRange(siteList).id;
                        } else {
                            return false; //move to next task if the last construction site is finished
                        }
                    }
                    
                } else {
                    return false; //move to next task
                }

                //if there is a target, move towards it and transfer
                var creepSiteTarget = Game.getObjectById(this.memory.siteTarget);
                if(creepSiteTarget) {
                    if (this.pos.inRangeTo(creepSiteTarget, 3)) {
                        this._build(creepSiteTarget, RESOURCE_ENERGY);
                    } else {
                        this.moveTo(creepSiteTarget, {visualizePathStyle: {stroke: COLOR_ENERGY_SPEND, lineStyle: 'undefined'}});
                    }
                }
                return true; //move to next tick
            }
        }



        //task to manage link energy levels
        if (!Creep.prototype.manageLink) {
            Creep.prototype.manageLink = function() {
                //assign the room storage and storage link to memory
                let testCpu = Game.cpu.getUsed();
                var creepStorage = this.room.storage;
                var creepLink = Game.getObjectById(Memory.roomsCache[this.room.name].structures.links.storage[0]);
                var linkerSpot = Memory.roomsPersistent[this.room.name].roomPlanning.linkerSpot;
                var creepPos = new RoomPosition(linkerSpot.x, linkerSpot.y, this.room.name);
                
                
                if (!this.pos.isEqualTo(creepPos)) {
                    this.moveTo(creepPos);
                    return true; //move to next tick while we move
                }
                
                
                //move to next task if there isn't one of these
                if (!creepStorage || !creepLink) {
                    return false; //move to next task
                }

                //set the state
                if (this.store.getUsedCapacity() == 0) {
                    this.memory.harvesting = true;
                } else if (this.store.getFreeCapacity() == 0) {
                    this.memory.harvesting = false;
                }

                //do nothing if the creepLink is sitting at a good spot
                if (creepLink.store.getUsedCapacity(RESOURCE_ENERGY) >= 350 && creepLink.store.getUsedCapacity(RESOURCE_ENERGY) <= 450 ) {
                    return false; //move to next task
                }
                if (this.memory.harvesting) {
                    //pull from the creepStorage creepLink if it is higher than the sweet spot
                    if (creepLink.store.getUsedCapacity(RESOURCE_ENERGY) >= 400) {
                        let amountWithdraw = creepLink.store.getUsedCapacity(RESOURCE_ENERGY) - 400;
                        if (amountWithdraw > this.store.getFreeCapacity()) amountWithdraw = this.store.getFreeCapacity();
                        this.withdraw(creepLink, RESOURCE_ENERGY, amountWithdraw);
                        return true; //move to next tick
                    }
                    //else pull from creepStorage itself if the creepLink is lower than the good spot
                    this.withdraw(creepStorage, RESOURCE_ENERGY);
                    return true; //move to next tick     
                } else {
                    //transfer to the creepLink if it is less than the sweet spot
                    if (creepLink.store.getUsedCapacity(RESOURCE_ENERGY) <= 400) {
                        let amountNeeded = 400 - creepLink.store.getUsedCapacity(RESOURCE_ENERGY);
                        if (amountNeeded > this.store.getUsedCapacity(RESOURCE_ENERGY)) amountNeeded = this.store.getUsedCapacity(RESOURCE_ENERGY);
                        this.transfer(creepLink, RESOURCE_ENERGY, amountNeeded);
                        return true; //move to next tick
                    }

                    //otherwise transfer to the creepStorage
                    this.transfer(creepStorage, RESOURCE_ENERGY);
                    return true; //move to next tick
                }
            }
        }



        //task to manage the terminal
        if (!Creep.prototype.manageTerminal) {
            Creep.prototype.manageTerminal = function () {

                let roomTerminal = this.room.terminal;
                let linkerPos = Memory.roomsPersistent[this.room.name].roomPlanning.treasurerSpot; //middle of bunker
                linkerPos = new RoomPosition(linkerPos.x, linkerPos.y, this.room.name); //room pos obj of middle

                if (!this.pos.isEqualTo(linkerPos)) {
                    this.moveTo(linkerPos);
                    return true; //next tick until we get to our position
                }

                let terminalEnergy = roomTerminal.store.getUsedCapacity(RESOURCE_ENERGY);
                if (terminalEnergy < 30000) {
                    let neededEnergy = 30000 - terminalEnergy;
                    if (neededEnergy > this.store.getUsedCapacity(RESOURCE_ENERGY)) {
                        neededEnergy = this.store.getUsedCapacity(RESOURCE_ENERGY);
                    }
                    this.transfer(roomTerminal, RESOURCE_ENERGY, neededEnergy);
                    return true; //move to next tick if we transfer to terminal
                }

            }
        }



        //task to repair objects
        if (!Creep.prototype._repair) {
            //store the original prototype
            Creep.prototype._repair = Creep.prototype.repair;

            Creep.prototype.repair = function () {
                if (!this.memory.repairTarget || this.memory.repairTarget == "none") {
                    var checkList = [];
                    //variable target checking depending on assigned tasks
                    if (this.memory.tasks.includes(TASK_REPAIR_WALL)) {
                        checkList.push(STRUCTURE_RAMPART);
                    }
                    if (this.memory.tasks.includes(TASK_REPAIR)) {
                        checkList.push(STRUCTURE_ROAD, STRUCTURE_CONTAINER);
                    }
                    //find the closest of all the structures you are searching for
                    var targets = this.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return checkList.includes(structure.structureType);
                        }
                    });   
                    if (targets && targets.length > 0) {
                        this.memory.repairTarget = _.sortBy(targets, function(struc) {
                            if (struc.structureType != STRUCTURE_RAMPART) {
                                return struc.hits / struc.hitsMax;
                            } else {
                                return struc.hits / (struc.hitsMax * 10);
                            }
                        })[0].id;
                    } else {
                        this.memory.repairTarget = "none";
                        return false; //move to next task
                    }
                }
                //fetch object pointed by memory
                var target = Game.getObjectById(this.memory.repairTarget);
                if (target && this.memory.repairTarget != "none") {
                    
                    if (target.hits == target.hitsMax) {
                        this.memory.repairTarget = "none";
                    }
                    //TODO: figure out ways to keep wallers out of the way
                    if (this.pos.inRangeTo(target, 3)) {
                        let success = this._repair(target, RESOURCE_ENERGY);
                        if (success == 0) {
                            let numWork = this.countBodyType(WORK);
                            Memory.roomsPersistent[this.room.name].stats.energySpentRepairing += numWork;
                        }

                        //set target to none when the creep runs out of energy to repair it
                        if (this.store.getUsedCapacity(RESOURCE_ENERGY) < 15) {
                            let numWork = this.countBodyType(WORK);
                            if (this.store.getUsedCapacity(RESOURCE_ENERGY) - numWork <= 0) {
                                this.memory.repairTarget = "none";
                            }
                        }
                    } else {
                        this.moveTo(target, {visualizePathStyle: {stroke: COLOR_ENERGY_SPEND, lineStyle: 'undefined'}});
                    }
                    return true; //move to next tick
                }
                this.memory.repairTarget = "none"; //set memory to none in case it is null
                return false; //move to next task
            }
        }



        //task to move to a remote room
        if (!Creep.prototype.remote) {
            Creep.prototype.remote = function () {
                if (!this.memory.assignedRoom) {
                    console.log("REMOTE CREEP HAS NO DESIGNATED ROOM!!");
                    return true; //move to next tick
                } else {
                    if (this.memory.tasks.includes(TASK_COMBAT_ATTACK_DRAIN) && this.hits < this.hitsMax) {
                        //move off the edge
                        if (this.pos.x == 0 || this.pos.y == 0 || this.pos.x == 49 || this.pos.y == 49) {
                            this.travelTo(new RoomPosition(25,25, this.room.name));
                        }
                        return false; //move to next task if it is a drainer
                    }
                    //if it is not in the room or on the edge of that room
                    if (this.room.name != this.memory.assignedRoom || 
                        (this.pos.x == 0 || this.pos.y == 0 || this.pos.x == 49 || this.pos.y == 49)) {
                        //avoid annoying bug where they get stuck on room edges
                        if (this.pos.x == 0 || this.pos.y == 0 || this.pos.x == 49 || this.pos.y == 49) {
                            this.travelTo(new RoomPosition(25,25, this.room.name));
                        } else {
                            this.travelTo(new RoomPosition(25,25, this.memory.assignedRoom), {reusePath: 25, serializeMemory: true, maxOps: 2000, visualizePathStyle: {stroke: '#ffffff'}});
                        }
                        return true; //move to next tick
                    } else {
                        return false; //move to next task when inside the target room
                    }
                }
            }
        }



        //task to sign a room controller
        if (!Creep.prototype.sign) {
            Creep.prototype.sign = function () {
                var hollowKnightSigns = [
                    "...Soul of Wyrm. Soul of Root. Heart of Void...",
                    "Higher beings, these words are for you alone.",
                    "No cost too great. No mind to think. No will to break. No voice to cry suffering.",
                    "Born of God and Void. You shall seal the blinding light that plagues their dreams.",
                    "You are the Vessel. You are the Hollow Knight.",
                    "Our pure Vessel has ascended. Beyond lies only the refuse and regret of its creation.",
                    "Bear witness to the last and only civilization, the eternal Kingdom. Hallownest.",
                    "Vessel. Though bound, you shall know the state of the world. Hallownest will be whole again.",
                    "The great gates have been sealed. None shall enter. None shall leave.",
                    "Cursed are those who turn against the King.",
                    "A true servant gives all for the Kingdom. Let Hallownest's Pale King relieve you of your burden.",
                    "To witness secrets sealed, one must endure the harshest punishment.",
                    "...Void... Power... Without unity..."
                ];
                var controller = Game.rooms[this.room.name].controller;
                if (controller.sign.username != "Xerronn") {
                    if (this.pos.inRangeTo(controller, 1)) {

                        //selected a random message from the message array then sign it with that message
                        let selectedMessage = hollowKnightSigns[Math.floor(Math.random() * hollowKnightSigns.length)];
                        this.signController(controller, selectedMessage);
                    } else {
                        this.moveTo(controller, {visualizePathStyle: {stroke: COLOR_MOVE}});
                    }
                    return true; //move to next tick
                }
                return false; //move to next task
            }
        }



        //task to claim a controller
        if (!Creep.prototype.claim) {
            Creep.prototype.claim = function () {
                var controller = Game.rooms[this.room.name].controller;
                if (!controller.my) {
                    if (this.pos.inRangeTo(controller, 1)) {
                        this.claimController(controller);
                    } else {
                        this.travelTo(controller, {visualizePathStyle: {stroke: COLOR_MOVE}});
                    }
                    return true; //move to next tick
                }
                return false; //move to next task
            }
        }



        //task to refresh body at nearest spawn
        //TODO: needs alot of work
        if (!Creep.prototype.renew) {
            Creep.prototype.renew = function () {
                if (this.ticksToLive < 100 || this.memory.renewing) {

                    if (this.ticksToLive < 100) {
                        this.memory.renewing = true;
                    }

                    if (this.ticksToLive > 600) {
                        this.memory.renewing = false;
                    }

                    //find not busy spawn and set it to memory
                    if (!this.memory.renewSpawn || this.memory.renewSpawn == "none") {
                        let creepSpawns = Memory.roomsCache[this.room.name].structures.spawns;
                        let freeSpawns = _.filter(creepSpawns, struc => !struc.spawning);
                        if (freeSpawns && freeSpawns.length > 0) {
                            creepSpawns = freeSpawns.map(struc => Game.getObjectById(struc));
                            let selectedSpawn = this.pos.findClosestByRange(creepSpawns);
                            this.memory.renewSpawn = selectedSpawn.id;
                        }
                    }

                    //fetch live game object
                    var creepSpawn = Game.getObjectById(this.memory.renewSpawn);

                    //only move towards spawn when nearby
                    if (!this.pos.inRangeTo(creepSpawn, 6)) {
                        return false; //move to next task
                    }

                    if (this.pos.inRangeTo(creepSpawn, 1)) {
                        let success = creepSpawn.renewCreep(this);

                        if (success == -4) {
                            this.memory.renewSpawn = "none";
                        }
                    } else {
                        this.moveTo(creepSpawn, {visualizePathStyle: {stroke: COLOR_MOVE}})
                    }
                    return true; // move to next tick
                } else {
                    return false; //move to next task
                }
            }
        }



        if (!Creep.prototype.countBodyType) {
            Creep.prototype.countBodyType = function (type) {
                return _.filter(this.body, function(bp){return bp.type == type;}).length;
            }
        }
    }
};

module.exports = systemPrototypes;