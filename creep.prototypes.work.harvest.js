var systemPrototypesHarvest = {
    run: function() {
        global.TASK_HARVEST_ENERGY = "harvest_energy";
        global.TASK_HARVEST_ENERGY_DROP = "harvest_energy_drop";
        global.TASK_HARVEST_ENERGY_LINK = "harvest_energy_link";
        global.TASK_HARVEST_MINERAL = "harvest_mineral";
        global.TASK_HARVEST_MINERAL_DROP = "harvest_mineral_drop";
        global.TASK_WITHDRAW_STORAGE = "withdraw_storage";
        global.TASK_WITHDRAW_STORAGE_CONTAINER = "withdraw_storage_container";
        global.TASK_WITHDRAW_CONTAINER = "withdraw_container";
        global.TASK_WITHDRAW_TERMINAL = "withdraw_terminal";
        global.TASK_SALVAGE = "salvage";

        //task to distribute to different sources and harvest them
        if (!Creep.prototype.harvestEnergy) {
            Creep.prototype.harvestEnergy = function() {

                //set the state of the creep
                if (this.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                    this.memory.harvesting = true;
                } else if (this.store.getFreeCapacity(RESOURCE_ENERGY) < (this.getActiveBodyparts(WORK) * 2)) {
                    this.memory.harvesting = false;
                }
                

                //a few definitions first
                var isLinkMiner = this.memory.tasks.includes(TASK_HARVEST_ENERGY_LINK);
                var isDropMiner = this.memory.tasks.includes(TASK_HARVEST_ENERGY_DROP);


                //move to the next task if the creep is no longer harvesting and doesn't have the tasks for a container or a link
                if (!this.memory.harvesting && !isDropMiner && !isLinkMiner) {
                    return false; //move to next task
                }


                //assign creep to source that has the least miners
                if (!this.memory.assignedSource) {
                    //find all sources in the room
                    var sourceList = Memory.roomsPersistent[this.room.name].sources;
                    var leastAttended = "none";
                    //find the source with the least number of miners
                    for (var source of Object.keys(sourceList)) {
                        //get the data from memory about this source
                        let sourceMemory = Memory.roomsPersistent[this.room.name].sources[source]
                        //if the creep is a dedicated miner, increment the miner list
                        if (isDropMiner || isLinkMiner) {
                            if (!sourceMemory.miners) {
                                sourceMemory.miners = [];
                            }
                            if (leastAttended == "none" || sourceMemory.miners.length < Memory.roomsPersistent[this.room.name].sources[leastAttended].miners.length) {
                                leastAttended = source;
                            }
                        } else { //otherwise increment worker list
                            if (!sourceMemory.workers) {
                                sourceMemory.workers = [];
                            }
                            if (leastAttended == "none" || sourceMemory.workers.length < Memory.roomsPersistent[this.room.name].sources[leastAttended].workers.length) {
                                leastAttended = source;
                            }
                        }
                    }
                    //set the creep memory to that least attended source so we never have to do this again
                    this.memory.assignedSource = leastAttended;
                    if (isDropMiner || isLinkMiner) {
                        Memory.roomsPersistent[this.room.name].sources[leastAttended].miners.push(this.name);
                    } else {
                        Memory.roomsPersistent[this.room.name].sources[leastAttended].workers.push(this.name);
                    }
                }

                //once the creep definitely has an assigned source, we can use a variable to reference the game object
                var creepSource = Game.getObjectById(this.memory.assignedSource);
                

                //skip extra work if the source is empty
                if (creepSource.energy == 0) {
                    if (isDropMiner || isLinkMiner) {
                        return true; //move to next tick
                    }
                    return false; //move to next task
                }


                //now we check for containers for drop mining
                if (isDropMiner && !this.memory.assignedContainer) {
                    //find any containers within range 1
                    let sourceContainers = creepSource.pos.findInRange(FIND_STRUCTURES, 1, {filter: {structureType: STRUCTURE_CONTAINER}})
                    if (sourceContainers.length > 0) {
                        this.memory.assignedContainer = sourceContainers[0].id;
                    } else {
                        //remove drop mining from potential tasks if there is no container
                        let array = this.memory.tasks;
                        let index = array.indexOf(TASK_HARVEST_ENERGY_DROP);
                        if (index > -1) {
                            array.splice(index, 1);
                            this.memory.tasks = array;
                        }
                        this.memory.assignedContainer = "none";
                    }
                }

                let creepContainer;
                //if we have a container, assign the object into a variable
                if (this.memory.assignedContainer != "none") { 
                    creepContainer = Game.getObjectById(this.memory.assignedContainer);
                }


                //now we do the final check for links
                if (isLinkMiner && !this.memory.assignedSourceLink) {
                    //find any links within range 2
                    let allSourceLinks = Memory.roomsCache[this.room.name].structures.links.container.map(container => Game.getObjectById(container));
                    var sourceLinks = creepSource.pos.findInRange(allSourceLinks, 2);
                    if (sourceLinks.length > 0) {
                        this.memory.assignedSourceLink = sourceLinks[0].id;
                    } else {
                        //remove link mining from potential tasks if there is no link
                        let array = this.memory.tasks;
                        let index = array.indexOf(TASK_HARVEST_ENERGY_LINK);
                        if (index > -1) {
                            array.splice(index, 1);
                            this.memory.tasks = array;
                        }
                        this.memory.assignedSourceLink = "none";
                    }
                }

                let creepLink;
                //if we have a container, assign the object into a variable
                if (this.memory.assignedSourceLink != "none") { 
                    creepLink = Game.getObjectById(this.memory.assignedSourceLink);
                }


                //ends the harvesting task if it doesn't need to harvest
                if (!this.memory.harvesting && !isDropMiner && !isLinkMiner) {
                    return false; //move to next task
                }

                //if creep is full and has a link
                if (!this.memory.harvesting && creepLink) {
                    if (this.pos.inRangeTo(creepLink, 1)) {
                        this.transfer(creepLink, RESOURCE_ENERGY);
                    } else {
                        this.moveTo(creepLink, {visualizePathStyle: {stroke: COLOR_ENERGY_SPEND, lineStyle: 'undefined'}});
                    }
                    return true; //move to next tick
                }


                //at this point the creep either has to be harvesting or drop harvesting
                var distanceToTarget = 1;
                var moveTarget = creepSource;
                //if there is a container and no link we need to move to on top of it instead of the source, so that drop mining can occur
                if (this.memory.assignedContainer != "none" && this.memory.assignedSourceLink == "none" && isDropMiner) {
                    distanceToTarget = 0;
                    moveTarget = creepContainer;
                }

                //now move to the target and then harvest the source
                if (this.pos.inRangeTo(moveTarget, distanceToTarget)) {
                    let success = this.harvest(creepSource);
                    if (success == 0) {
                        let numWork = this.getActiveBodyparts(WORK);
                        //TODO: rework this when boosting is possible
                        Memory.roomsPersistent[this.room.name].stats.energyHarvested += numWork * 2;
                    }
                } else {
                    this.moveTo(moveTarget, {visualizePathStyle: {stroke: COLOR_ENERGY_GET, lineStyle: 'undefined'}});
                }
                return true; //move to next tick
            }
        }



        //task to harvest from a mineral
        if (!Creep.prototype.harvestMineral) {
            //store the original version of the function
            Creep.prototype.harvestMineral = function() {

                //set state
                if (this.store.getUsedCapacity() == 0) {
                    this.memory.harvesting = true;
                } else if (this.store.getFreeCapacity() == 0) {
                    this.memory.harvesting = false;
                }

                //skip all this if its already full from another task
                if (!this.memory.harvesting && !this.memory.tasks.includes(TASK_HARVEST_MINERAL_DROP)) {
                    return false; //move to next task
                }

                //find the extractor and assign it into memory
                if (!this.memory.assignedExtractor) {
                    let extractor = Memory.roomsCache[this.room.name].structures.extractors[0];
                    if (extractor) {
                        this.memory.assignedExtractor = extractor;
                    } else {
                        this.memory.assignedExtractor = "none";
                    }
                }

                //find the mineral and assign it into memory
                if (!this.memory.assignedMineral) {
                    let mineral = Game.rooms[this.room.name].find(FIND_MINERALS)[0];
                    
                    if (mineral) {
                        this.memory.assignedMineral = mineral.id;
                    } else {
                        this.memory.assignedExtractor = "none";
                    }
                }

                //skip if it cannot be mined
                if (this.memory.assignedMineral == "none" || this.memory.assignedExtractor == "none") {
                    return false; //move to next task
                }

                //get live extractor and mineral object
                var creepMineral = Game.getObjectById(this.memory.assignedMineral);
                var creepExtractor = Game.getObjectById(this.memory.assignedExtractor);

                if (creepExtractor.cooldown > 0 || creepMineral.mineralAmount == 0) {
                    if (creepMineral.mineralAmount == 0) {
                        Memory.roomsPersistent[this.room.name].mineralTimer = Game.time + creepMineral.ticksToRegeneration;
                    }
                    return true; //move to next task
                }

                //now we check for containers for drop mining
                if (!this.memory.assignedContainer) {
                    //find any containers within range 1
                    let extractorContainers = creepMineral.pos.findInRange(FIND_STRUCTURES, 1, {filter: {structureType: STRUCTURE_CONTAINER}})
                    if (extractorContainers.length > 0) {
                        this.memory.assignedContainer = extractorContainers[0].id;
                    } else {
                        //remove drop mining from potential tasks if there is no container
                        let array = this.memory.tasks;
                        let index = array.indexOf(TASK_HARVEST_MINERAL_DROP);
                        if (index > -1) {
                            array.splice(index, 1);
                            this.memory.tasks = array;
                        }
                        this.memory.assignedContainer = "none";
                    }
                }

                let creepContainer;
                //if we have a container, assign the object into a variable
                if (this.memory.assignedContainer != "none") { 
                    creepContainer = Game.getObjectById(this.memory.assignedContainer);
                }

                //at this point the creep either has to be harvesting or drop harvesting
                var distanceToTarget = 1;
                var moveTarget = creepMineral;
                //if there is a container and no link we need to move to on top of it instead of the source, so that drop mining can occur
                if (this.memory.assignedContainer != "none" && this.memory.tasks.includes(TASK_HARVEST_MINERAL_DROP)) {
                    distanceToTarget = 0;
                    moveTarget = creepContainer;
                }

                //now move to the target and then harvest the source
                if (this.pos.inRangeTo(moveTarget, distanceToTarget)) {
                    this.harvest(creepMineral);
                    // if (success == 0) {
                    //     let numWork = this.countBodyType(WORK);
                    //     //TODO: rework this when boosting is possible
                    //     Memory.roomsPersistent[this.room.name].stats.energyHarvested += numWork * 2;
                    // }
                } else {
                    this.moveTo(moveTarget, {visualizePathStyle: {stroke: COLOR_ENERGY_GET, lineStyle: 'undefined'}});
                }
                return true; //move to next tick
            }
        }



        //task to withdraw from a storage
        if (!Creep.prototype.withdrawStorage) {
            Creep.prototype.withdrawStorage = function() {
                //set state
                if (this.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                    this.memory.harvesting = true;
                } else if (this.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                    this.memory.harvesting = false;
                }

                var creepStorage = this.room.storage;
                if (!creepStorage || !this.memory.harvesting || creepStorage.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                    //remove this task if there is no storage
                    if (!creepStorage) {
                        let array = this.memory.tasks;
                        let index = array.indexOf(TASK_WITHDRAW_STORAGE);
                        if (index > -1) {
                            array.splice(index, 1);
                            this.memory.tasks = array;
                        }
                    }
                    return false; //move to next task if creep is full or if there is no storage
                }
                //withdraw from the storage
                if (this.pos.inRangeTo(creepStorage, 1)) {
                    this.withdraw(creepStorage, RESOURCE_ENERGY);
                } else {
                    this.moveTo(creepStorage, {visualizePathStyle: {stroke: COLOR_ENERGY_GET, lineStyle: 'undefined'}});
                }
                return true; //move to next tick
            }
        }



        //task to withdraw from a storage container
        if (!Creep.prototype.withdrawStorageContainer) {
            Creep.prototype.withdrawStorageContainer = function() {
                //set state
                if (this.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                    this.memory.harvesting = true;
                } else if (this.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                    this.memory.harvesting = false;
                }

                //get container into a live object if it exists
                var creepContainer;
                if (Memory.roomsCache[this.room.name].structures.containers.storage && Memory.roomsCache[this.room.name].structures.containers.storage.length > 0) {
                    creepContainer = Game.getObjectById(Memory.roomsCache[this.room.name].structures.containers.storage[0]);
                }

                if (!creepContainer || !this.memory.harvesting || creepContainer.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                    //remove this task if there is no storage
                    if (!creepContainer) {
                        let array = this.memory.tasks;
                        let index = array.indexOf(TASK_WITHDRAW_STORAGE_CONTAINER);
                        if (index > -1) {
                            array.splice(index, 1);
                            this.memory.tasks = array;
                        }
                    }
                    return false; //move to next task if creep is full or if there is no storage
                }
                //withdraw from the storage
                if (this.pos.inRangeTo(creepContainer, 1)) {
                    this.withdraw(creepContainer, RESOURCE_ENERGY);
                } else {
                    this.moveTo(creepContainer, {visualizePathStyle: {stroke: COLOR_ENERGY_GET, lineStyle: 'undefined'}});
                }
                return true; //move to next tick
            }
        }



        //task to withdraw from a container
        if (!Creep.prototype.withdrawContainer) {
            Creep.prototype.withdrawContainer = function() {
                //set state
                if (this.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                    this.memory.harvesting = true;
                } else if (this.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                    this.memory.harvesting = false;
                }

                //skip all this if its already full from another task
                if (!this.memory.harvesting) {
                    return false; //move to next task
                }

                //all containers from memory
                var allContainers = Object.keys(Memory.roomsCache[this.room.name].structures.containers.all).map(
                    container => Game.getObjectById(container)
                );
                //all containers that have energy in them
                var creepContainers = allContainers.filter(
                    container => container.store.getUsedCapacity(RESOURCE_ENERGY) > this.store.getFreeCapacity(RESOURCE_ENERGY)
                );
                if (creepContainers.length == 0 || !this.memory.harvesting) {
                    //remove this task if there is no containers
                    if (allContainers.length == 0) {
                        let array = this.memory.tasks;
                        let index = array.indexOf(TASK_WITHDRAW_CONTAINER);
                        if (index > -1) {
                            array.splice(index, 1);
                            this.memory.tasks = array;
                        }
                    }
                    return false; //move to next task if creep is full or if there is no container
                }
                //find the closest of the containers
                //TODO: optimize this somehow more
                if (this.memory.containerTarget && this.memory.containerTarget != "none") {
                    let creepContainerTarget = Game.getObjectById(this.memory.containerTarget);

                    //set the memory to none if it is empty
                    if (!creepContainerTarget || creepContainerTarget.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                        this.memory.containerTarget = "none";
                    }
                }

                //assign a new object that needs filling to be the target
                if (!this.memory.containerTarget || this.memory.containerTarget == "none") {
                    let closestFull = this.pos.findClosestByPath(creepContainers, {
                        filter: (structure) => {
                            return structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0}});
                    if (closestFull) {        
                        this.memory.containerTarget = closestFull.id;
                    } else {
                        this.memory.containerTarget = "none";
                        return false; //move to next task if there is no containers with something in them
                    }
                }

                var creepContainerTarget = Game.getObjectById(this.memory.containerTarget);
                if (creepContainerTarget) {
                    if (this.pos.inRangeTo(creepContainerTarget, 1)) {
                        this.withdraw(creepContainerTarget, RESOURCE_ENERGY);
                    } else {
                        this.moveTo(creepContainerTarget, {visualizePathStyle: {stroke: COLOR_ENERGY_GET, lineStyle: 'undefined'}});
                    }
                }
                return true; //move to next tick
            }
        }



        //task to withdraw from a storage
        if (!Creep.prototype.withdrawTerminal) {
            Creep.prototype.withdrawTerminal = function() {
                //set state
                if (this.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                    this.memory.harvesting = true;
                } else if (this.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                    this.memory.harvesting = false;
                }

                //skip all this if its already full from another task
                if (!this.memory.harvesting) {
                    return false; //move to next task
                }

                var creepTerminal = this.room.terminal;
                if (!creepTerminal || !this.memory.harvesting) {
                    //remove this task if there is no terminal
                    if (!creepTerminal) {
                        let array = this.memory.tasks;
                        let index = array.indexOf(TASK_WITHDRAW_TERMINAL);
                        if (index > -1) {
                            array.splice(index, 1);
                            this.memory.tasks = array;
                        }
                    }
                    return false; //move to next task if creep is full or if there is no terminal
                }
                //withdraw from the terminal
                if (this.pos.inRangeTo(creepTerminal, 1)) {
                    this.withdraw(creepTerminal, RESOURCE_ENERGY);
                } else {
                    this.moveTo(creepTerminal, {visualizePathStyle: {stroke: COLOR_ENERGY_GET, lineStyle: 'undefined'}});
                }
                return true; //move to next tick
            }
        }



        //task to pickup dropped energy
        if (!Creep.prototype.salvage) {
            Creep.prototype.salvage = function () {

                //set state
                if (this.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                    this.memory.harvesting = true;
                } else if (this.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                    this.memory.harvesting = false;
                }

                //skip all this if its already full from another task
                if (!this.memory.harvesting) {
                    return false; //move to next task
                }

                //assign closest resource to creep
                if (!this.memory.assignedSalvage || this.memory.assignedSalvage == "none") {
                    let assignedSalvage = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter : resource => resource.resourceType == RESOURCE_ENERGY});
                    if (assignedSalvage) {
                        this.memory.assignedSalvage = assignedSalvage.id;
                    } else {
                        //if there is no salvage, remove this task
                        let array = this.memory.tasks;
                        let index = array.indexOf(TASK_SALVAGE);
                        if (index > -1) {
                            array.splice(index, 1);
                            this.memory.tasks = array;
                        }
                        return false; //move to next task
                    }
                }
                //fetch live object
                var assignedSalvage = Game.getObjectById(this.memory.assignedSalvage);

                if (!assignedSalvage) {
                    this.memory.assignedSalvage = "none";
                    return false; //move to next task
                } else {
                    if (this.pos.inRangeTo(assignedSalvage, 1)) {
                        this.pickup(assignedSalvage);
                        //TODO: Track this in stats
                    } else {
                        this.moveTo(assignedSalvage, {visualizePathStyle: {stroke: COLOR_ENERGY_GET, lineStyle: 'undefined'}});
                    }
                    return true; //move to next tick
                }
            }
        }
    }
};

module.exports = systemPrototypesHarvest;