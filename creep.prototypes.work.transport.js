var systemPrototypes = {
    run: function() {
        global.TASK_TRANSPORT_ENERGY = "transport_energy"; 
        global.TASK_TRANSPORT_MINERALS = "transport_minerals";
        global.TASK_FILL_EXTENSION = "fill_extension"; 
        global.TASK_FILL_TOWER = "fill_tower"; 
        global.TASK_FILL_TOWER_STATIC = "fill_tower_static"; 
        global.TASK_FILL_STORAGE = "fill_storage"; 
        global.TASK_FILL_TERMINAL = "fill_terminal";
        global.TASK_FILL_STORAGE_CONTAINER = "fill_storage_container";

        //task to withdraw from assigned source container
        //TODO: check for energy to pick up along its path?
        if (!Creep.prototype.transportEnergy) {
            Creep.prototype.transportEnergy = function() {
                //TODO: fix the transporter having nothing to do if the source has no container
                //TODO: allow transporters to do more than just energy from source transporting
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

                //assign creep to source that has the least transporters
                if (!this.memory.assignedContainerSource) {
                    var sourceList = Memory.roomsPersistent[this.room.name].sources;
                    var leastAttended = "none";
                    //find the source with the least number of transporters
                    for (var source of Object.keys(sourceList)) {
                        let sourceMemory = Memory.roomsPersistent[this.room.name].sources[source]
                        if (!sourceMemory.transporters) {
                            sourceMemory.transporters = [];
                        }
                        if (leastAttended == "none" || sourceMemory.transporters.length < Memory.roomsPersistent[this.room.name].sources[leastAttended].transporters.length) {
                            leastAttended = source;
                        }
                    }
                    //set the creep memory to that least attended source so we never have to do this again
                    this.memory.assignedContainerSource = leastAttended;
                    Memory.roomsPersistent[this.room.name].sources[leastAttended].transporters.push(this.name);
                }

                //once the creep definitely has an assigned source, we can use a variable to reference the game object
                var creepSource = Game.getObjectById(this.memory.assignedContainerSource);

                //now we check for a container to withdraw from
                if (!this.memory.assignedContainer) {
                    //find any containers within range 1
                    let sourceContainers = creepSource.pos.findInRange(FIND_STRUCTURES, 1, {filter: {structureType: STRUCTURE_CONTAINER}})
                    if (sourceContainers.length > 0) {
                        this.memory.assignedContainer = sourceContainers[0].id;
                    } else {
                        //remove transport from potential tasks if there is no container
                        let array = this.memory.tasks;
                        let index = array.indexOf(TASK_TRANSPORT_ENERGY);
                        if (index > -1) {
                            array.splice(index, 1);
                            this.memory.tasks = array;
                        }
                        return false; //move to next task if there is no container to transport from
                    }
                }

                //get live object of our container
                var creepContainer = Game.getObjectById(this.memory.assignedContainer);
                
                //ends the withdraw if there it is done
                if (!this.memory.harvesting) {
                    return false; //move to next task if full
                }

                //now move to the container and withdraw
                if (this.pos.inRangeTo(creepContainer, 1)) {
                    this.withdraw(creepContainer, RESOURCE_ENERGY);
                } else {
                    this.moveTo(creepContainer, {visualizePathStyle: {stroke: COLOR_ENERGY_GET, lineStyle: 'undefined'}});
                }
                return true; //move to next tick
            }
        }



        if (!Creep.prototype.transportMinerals) {
            Creep.prototype.transportMinerals = function() {
                if (this.store.getUsedCapacity() == 0) {
                    this.memory.harvesting = true;
                } else if (this.store.getFreeCapacity() == 0) {
                    this.memory.harvesting = false;
                }

                //skip all this if its already full from another task
                if (!this.memory.harvesting) {
                    return false; //move to next task
                }

                //assign creep to source that has the least transporters
                if (!this.memory.assignedContainer) {
                    let creepContainer = Memory.roomsCache[this.room.name].structures.containers.mineral[0];
                    if (creepContainer) {
                        this.memory.assignedContainer = creepContainer;
                    } else {
                        this.memory.assignedContainer = "none";
                    }
                }

                if (this.memory.assignedContainer == "none") {
                    return false; //move to next task if no container
                }

                var creepContainer = Game.getObjectById(this.memory.assignedContainer);
                
                if (this.pos.inRangeTo(creepContainer, 1)) {
                    //only do something when the container has enough to fill
                    if (creepContainer.store.getUsedCapacity() >= this.store.getCapacity()) {
                        for(var resourceType in creepContainer.store) {
                            this.withdraw(creepContainer, resourceType);
                        }
                    }
                } else {
                    this.moveTo(creepContainer);
                }
                return true; //move to next tick
            }
        }



        //task to fill extensions and spawn
        if (!Creep.prototype.fillExtensions) {
            Creep.prototype.fillExtensions = function() {
                //check memory if the room needs to be filled
                if (!Memory.roomsPersistent[this.pos.roomName].extensionsFilled && this.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && !this.memory.harvesting) {
                    //find the closest extensions
                    //TODO: optimize this somehow more
                    if (this.memory.fillTarget && this.memory.fillTarget != "none" && Game.getObjectById(this.memory.fillTarget)) {
                        let creepFillTarget = Game.getObjectById(this.memory.fillTarget);

                        //set the memory to none if it is full
                        if (!creepFillTarget || creepFillTarget.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                            this.memory.fillTarget = "none";
                        }
                    }

                    //assign a new object that needs filling to be the target
                    if (!this.memory.fillTarget || this.memory.fillTarget == "none") {
                        let closestFillTarget = this.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}
                                });
                        if (closestFillTarget) {
                            this.memory.fillTarget = closestFillTarget.id;
                        }
                    }
                    
                } else {
                    return false; //move to next task
                }

                //if there is a target, move towards it and transfer
                var creepFillTarget = Game.getObjectById(this.memory.fillTarget);
                if(creepFillTarget) {
                    if (this.pos.inRangeTo(creepFillTarget, 1)) {
                        this.transfer(creepFillTarget, RESOURCE_ENERGY);
                    } else {
                        this.moveTo(creepFillTarget, {visualizePathStyle: {stroke: COLOR_ENERGY_SPEND, lineStyle: 'undefined'}});
                    }
                }
                return true; //move to next tick
            }
        }


        //task to fill tower
        if (!Creep.prototype.fillTowers) {
            Creep.prototype.fillTowers = function() {
                //check memory if the room needs to be filled
                if (!Memory.roomsPersistent[this.pos.roomName].towersFilled && this.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && !this.memory.harvesting) {
                    //find the closest extensions
                    //TODO: optimize this somehow more
                    if (this.memory.towerTarget && this.memory.towerTarget != "none") {
                        let creepTowerTarget = Game.getObjectById(this.memory.towerTarget);

                        //set the memory to none if it is full
                        if (!creepTowerTarget || creepTowerTarget.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                            this.memory.towerTarget = "none";
                        }
                    }

                    //assign a new object that needs towering to be the target
                    if (!this.memory.towerTarget || this.memory.towerTarget == "none") {
                        var towerTarget = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_TOWER) &&
                                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}
                                });
                        if (towerTarget) {
                            this.memory.towerTarget = towerTarget.id;
                        } else {
                            return false; //move to next task
                        }
                    }
                    
                } else {
                    return false; //move to next task
                }

                //if there is a target, move towards it and transfer
                var creepTowerTarget = Game.getObjectById(this.memory.towerTarget);
                if(creepTowerTarget) {
                    if (this.pos.inRangeTo(creepTowerTarget, 1)) {
                        this.transfer(creepTowerTarget, RESOURCE_ENERGY);
                    } else {
                        this.moveTo(creepTowerTarget, {visualizePathStyle: {stroke: COLOR_ENERGY_SPEND, lineStyle: 'undefined'}});
                    }
                }
                return true; //move to next tick
            }
        }



        //task to fill tower
        if (!Creep.prototype.fillTowersStatic) {
            Creep.prototype.fillTowersStatic = function() {
                //check memory if the room needs to be filled
                if (!Memory.roomsPersistent[this.pos.roomName].towersFilled && this.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && !this.memory.harvesting) {
                    //find the closest extensions
                    //TODO: optimize this somehow more
                    if (this.memory.towerTarget && this.memory.towerTarget != "none") {
                        let creepTowerTarget = Game.getObjectById(this.memory.towerTarget);

                        //set the memory to none if it is full
                        if (!creepTowerTarget || creepTowerTarget.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                            this.memory.towerTarget = "none";
                        }
                    }

                    //assign a new object that needs towering to be the target
                    if (!this.memory.towerTarget || this.memory.towerTarget == "none") {
                        var towers = Memory.roomsCache[this.room.name].structures.towers.map(id => Game.getObjectById(id));
                        let towerTarget;
                        for (tower of towers) {
                            if (tower && this.pos.isNearTo(tower) && tower.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                                towerTarget = tower;
                                break;
                            }
                        }
                        if (towerTarget) {
                            this.memory.towerTarget = towerTarget.id;
                        } else {
                            return false; //move to next task
                        }
                    }
                    
                } else {
                    return false; //move to next task
                }

                //if there is a target, move towards it and transfer
                var creepTowerTarget = Game.getObjectById(this.memory.towerTarget);
                if(creepTowerTarget) {
                    this.transfer(creepTowerTarget, RESOURCE_ENERGY);
                }
                return true; //move to next tick
            }
        }



        //task to fill a storage
        if (!Creep.prototype.fillStorage) {
            Creep.prototype.fillStorage = function() {
                //set state
                var creepStorage = this.room.storage;
                //skip the task if there is no storage, the creep is harvesting or the creep has no energy
                if (!creepStorage || this.memory.harvesting || !this.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    //remove this task if there is no storage
                    if (!creepStorage) {
                        let array = this.memory.tasks;
                        let index = array.indexOf(TASK_FILL_STORAGE);
                        if (index > -1) {
                            array.splice(index, 1);
                            this.memory.tasks = array;
                        }
                    }
                    return false; //move to next task if creep is harvesting
                }
                //fill the storage
                if (this.pos.inRangeTo(creepStorage, 1)) {
                    for(var resourceType in this.store) {
                        this.transfer(creepStorage, resourceType);
                    }
                } else {
                    this.moveTo(creepStorage, {visualizePathStyle: {stroke: COLOR_ENERGY_SPEND, lineStyle: 'undefined'}});
                }
                return true; //move to next tick
            }
        }



        //task to fill a storage container
        if (!Creep.prototype.fillStorageContainer) {
            Creep.prototype.fillStorageContainer = function() {
                //get container into a live object if it exists
                var creepContainer;
                if (Memory.roomsCache[this.room.name].structures.containers.storage && Memory.roomsCache[this.room.name].structures.containers.storage.length > 0) {
                    creepContainer = Game.getObjectById(Memory.roomsCache[this.room.name].structures.containers.storage[0]);
                }
                
                //skip the task if there is no storage container, the creep is harvesting or the creep has no energy
                if (!creepContainer || this.memory.harvesting || !this.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    //remove this task if there is no storage
                    if (!creepContainer) {
                        let array = this.memory.tasks;
                        let index = array.indexOf(TASK_FILL_STORAGE_CONTAINER);
                        if (index > -1) {
                            array.splice(index, 1);
                            this.memory.tasks = array;
                        }
                    }
                    return false; //move to next task if creep is harvesting
                }
                //fill the storage
                if (this.pos.inRangeTo(creepContainer, 1)) {
                    for(var resourceType in this.store) {
                        this.transfer(creepContainer, resourceType);
                    }
                } else {
                    this.moveTo(creepContainer, {visualizePathStyle: {stroke: COLOR_ENERGY_SPEND, lineStyle: 'undefined'}});
                }
                return true; //move to next tick
            }
        }



        //task to fill a terminal
        if (!Creep.prototype.fillTerminal) {
            Creep.prototype.fillTerminal = function() {
                //set state
                var creepTerminal = this.room.terminal;
                //skip the task if there is no terminal, the creep is harvesting or the creep has no energy
                if (!creepTerminal || this.memory.harvesting || !this.store.getUsedCapacity() > 0) {
                    //remove this task if there is no terminal
                    if (!creepTerminal) {
                        let array = this.memory.tasks;
                        let index = array.indexOf(TASK_FILL_TERMINAL);
                        if (index > -1) {
                            array.splice(index, 1);
                            this.memory.tasks = array;
                        }
                    }
                    return false; //move to next task if creep is harvesting
                }
                //fill the terminal
                if (this.pos.inRangeTo(creepTerminal, 1)) {
                    for(var resourceType in this.store) {
                        this.transfer(creepTerminal, resourceType);
                    }
                } else {
                    this.moveTo(creepTerminal, {visualizePathStyle: {stroke: COLOR_ENERGY_SPEND, lineStyle: 'undefined'}});
                }
                return true; //move to next tick
            }
        }



        if (!Creep.prototype.manageTerminal) {
            Creep.prototype.manageTerminal = function () {
                var creepTerminal = this.room.terminal;
                //skip the task if there is no terminal, the creep is harvesting or the creep has no energy
                if (!creepTerminal || this.memory.harvesting || !this.store.getUsedCapacity() > 0) {
                    //remove this task if there is no terminal
                    if (!creepTerminal) {
                        let array = this.memory.tasks;
                        let index = array.indexOf(TASK_MANAGE_TERMINAL);
                        if (index > -1) {
                            array.splice(index, 1);
                            this.memory.tasks = array;
                        }
                    }
                    return false; //move to next task if creep is harvesting
                }

                //fill the terminal
                let fillAmount = 20000; //default amount
                //amount to use if we are moving all contents to the terminal
                if (Memory.roomsPersistent[this.room.name].rePlanning) filAmount = creepTerminal.store.getCapacity();
                if (creepTerminal.store.getUsedCapacity(RESOURCE_ENERGY) > fillAmount) {
                    return false; //move to next task
                }
                if (this.pos.inRangeTo(creepTerminal, 1)) {
                    this.transfer(creepTerminal, RESOURCE_ENERGY);
                } else {
                    this.moveTo(creepTerminal, {visualizePathStyle: {stroke: COLOR_ENERGY_SPEND, lineStyle: 'undefined'}});
                }
                return true; //move to next tick
            }
        }


    
        //task to upgrade the controller
        if (!Creep.prototype._upgradeController) {
            //store the original version of the function
            Creep.prototype._upgradeController = Creep.prototype.upgradeController;

            Creep.prototype.upgradeController = function () {
                var creepController = this.room.controller;
                
                //use cached memory to check if there is a controller link
                if (!this.memory.assignedControllerLink) {
                    if (Memory.roomsCache[this.room.name].structures.links.controller.length > 0) {
                        this.memory.assignedControllerLink = Memory.roomsCache[this.room.name].structures.links.controller[0];
                        //get rid of all other tasks if there is a link
                        this.memory.tasks = [TASK_UPGRADE_LINK];
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
                    if (this.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                        this.memory.harvesting = true;
                    } else if (this.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                        this.memory.harvesting = false;
                    }
                }
                if (!this.memory.harvesting) {
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
                    if (this.pos.inRangeTo(creepSiteTarget, 1)) {
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
                var creepStorage = this.room.storage;
                var creepLink = Game.getObjectById(Memory.roomsCache[this.room.name].structures.links.storage[0]);
                //remove this task if there is no storage or storage link
                if (!creepStorage || !creepLink) {
                    //remove this task if there is no storage or storage link
                    let array = this.memory.tasks;
                    let index = array.indexOf(TASK_MANAGE_LINK);
                    if (index > -1) {
                        array.splice(index, 1);
                        this.memory.tasks = array;
                    }
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
                        if (this.pos.inRangeTo(creepLink, 1)) {
                            this.withdraw(creepLink, RESOURCE_ENERGY);
                        } else {
                            this.moveTo(creepLink);
                        }
                        return true; //move to next tick
                    }
                    
                    //pull from creepStorage itself if the creepLink is lower than the good spot
                    if (this.pos.inRangeTo(creepStorage, 1)) {
                        this.withdraw(creepStorage, RESOURCE_ENERGY);
                    } else {
                        this.moveTo(creepStorage);
                    }
                    return true; //move to next tick     
                } else {
                    //transfer to the creepLink if it is less than the sweet spot
                    if (creepLink.store.getUsedCapacity(RESOURCE_ENERGY) <= 400) {
                        if (this.pos.inRangeTo(creepLink, 1)) {
                            this.transfer(creepLink, RESOURCE_ENERGY);
                        } else {
                            this.moveTo(creepLink);
                        }
                        return true; //move to next tick
                    }

                    //otherwise transfer to the creepStorage
                    if (this.pos.inRangeTo(creepStorage, 1)) {
                        this.transfer(creepStorage, RESOURCE_ENERGY);
                    } else {
                        this.moveTo(creepStorage);
                    }
                    return true; //move to next tick
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
                        checkList.push(STRUCTURE_ROAD, STRUCTURE_CONTAINER, STRUCTURE_WALL);
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
                    if (this.pos.inRangeTo(target, 1)) {
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
                            this.moveTo(new RoomPosition(25,25, this.room.name));
                        }
                        return false; //move to next task if it is a drainer
                    }
                    //if it is not in the room or on the edge of that room
                    if (this.room.name != this.memory.assignedRoom || 
                        (this.pos.x == 0 || this.pos.y == 0 || this.pos.x == 49 || this.pos.y == 49)) {
                        //avoid annoying bug where they get stuck on room edges
                        if (this.pos.x == 0 || this.pos.y == 0 || this.pos.x == 49 || this.pos.y == 49) {
                            this.moveTo(new RoomPosition(25,25, this.room.name));
                        } else {
                            this.moveTo(new RoomPosition(25,25, this.memory.assignedRoom), {reusePath: 25, serializeMemory: true, maxOps: 2000, visualizePathStyle: {stroke: '#ffffff'}});
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
                        this.moveTo(controller, {visualizePathStyle: {stroke: COLOR_MOVE}});
                    }
                    return true; //move to next tick
                }
                return false; //move to next task
            }
        }



        //task to refresh body at nearest spawn
        //TODO: needs work
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