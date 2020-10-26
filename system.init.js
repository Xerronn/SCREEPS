var systemInit = {
    run: function() {
        //global declarations of some things
        global.TASK_HARVEST = "harvest";
        global.TASK_DROP_HARVEST = "drop_harvest";
        global.TASK_WITHDRAW_STORAGE = "withdraw_storage";
        global.TASK_WITHDRAW_CONTAINER = "withdraw_container";        
        global.TASK_FILL_EXTENSIONS = "fill_extensions";
        global.TASK_FILL_TOWERS = "fill_towers";
        global.TASK_TRANSPORT = "transport_to_storage";
        global.TASK_MANAGE_LINK = "manage_link"

        global.TASK_BUILD = "build";
        global.TASK_UPGRADE = "upgrade";
        global.TASK_REPAIR = "repair";

        global.TASK_REMOTE = "remote"; //task placed in highest priority to move a creep to a distance room
        
        
        global.ALL_TASKS = [
            TASK_HARVEST,
            TASK_DROP_HARVEST,
            TASK_WITHDRAW_STORAGE,
            TASK_WITHDRAW_CONTAINER,

            TASK_FILL_EXTENSIONS,
            TASK_FILL_TOWERS,
            TASK_TRANSPORT,
            TASK_MANAGE_LINK,
            
            TASK_BUILD,
            TASK_UPGRADE,
            TASK_REPAIR,

            TASK_REMOTE
        ];

        //prototype overrides
        //prototype returns true if the task is complete

        //task to distribute to different sources and harvest them
        if (!Creep.prototype._harvest) {
            //store the original version of the function
            Creep.prototype._harvest = Creep.prototype.harvest;

            Creep.prototype.harvest = function() {
                
                //set state
                if (this.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                    this.memory.harvesting = true;
                } else if (this.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                    this.memory.harvesting = false;
                }

                //assign creep to source that has the least workers
                //TODO: Handle source numWorkers memory and also link mining
                if (!this.memory.assignedSource) {
                    var sourceList = Memory.roomsPersistent[this.room.name].sources;
                    var leastAttended = "none";
                    //find the source with the least number of workers
                    for (var source of Object.keys(sourceList)) {
                        let sourceMemory = Memory.roomsPersistent[this.room.name].sources[source]
                        if (!sourceMemory.workers) {
                            sourceMemory.workers = [];
                        }
                        if (leastAttended == "none" || sourceMemory.workers.length < Memory.roomsPersistent[this.room.name].sources[leastAttended].workers.length) {
                            leastAttended = source;
                        }
                    }
                    //set the creep memory to that least attended source so we never have to do this again
                    this.memory.assignedSource = leastAttended;
                    Memory.roomsPersistent[this.room.name].sources[leastAttended].workers.push(this.name);
                }

                //once the creep definitely has an assigned source, we can use a variable to reference the game object
                var creepSource = Game.getObjectById(this.memory.assignedSource);

                //now we check for containers for drop mining
                if (!this.memory.assignedContainer) {
                    //find any containers within range 1
                    let sourceContainers = creepSource.pos.findInRange(FIND_STRUCTURES, 1, {filter: {structureType: STRUCTURE_CONTAINER}})
                    if (sourceContainers.length > 0) {
                        this.memory.assignedContainer = sourceContainers[0].id;
                    } else {
                        //remove drop mining from potential tasks if there is no container
                        let array = this.memory.tasks;
                        let index = array.indexOf(TASK_DROP_HARVEST);
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
                if (!this.memory.assignedSourceLink) {
                    //find any links within range 1
                    let sourceLinks = creepSource.pos.findInRange(FIND_STRUCTURES, 1, {filter: {structureType: STRUCTURE_LINK}});
                    if (sourceLinks.length > 0) {
                        this.memory.assignedSourceLink = sourceLinks[0].id;
                    } else {
                        this.memory.assignedSourceLink = "none";
                    }
                }

                let creepLink;
                //if we have a container, assign the object into a variable
                if (this.memory.assignedSourceLink != "none") { 
                    creepLink = Game.getObjectById(this.memory.assignedSourceLink);
                }
                
                //ends the harvesting task if it doesn't need to harvest
                if (!this.memory.harvesting && !this.memory.tasks.includes(TASK_DROP_HARVEST)) {
                    return true; //move to next task
                } 

                var distanceToTarget = 1;
                var moveTarget = creepSource;
                //if there is a container and no link we need to move to on top of it instead of the source, so that drop mining can occur
                if (this.memory.assignedContainer != "none" && this.memory.assignedSourceLink == "none" && this.memory.tasks.includes(TASK_DROP_HARVEST)) {
                    distanceToTarget = 0;
                    moveTarget = creepContainer;
                }

                //now move to the target and then harvest the source
                if (this.pos.inRangeTo(moveTarget, distanceToTarget)) {
                    this._harvest(creepSource);
                } else {
                    this.moveTo(moveTarget, {visualizePathStyle: {stroke: '#f2fe00', lineStyle: 'undefined'}});
                }
                return false; //do it again
            }
        }



        //task to fill extensions and spawn
        if (!Creep.prototype.fillExtensions) {
            Creep.prototype.fillExtensions = function() {
                //check memory if the room needs to be filled
                if (!Memory.roomsPersistent[this.pos.roomName].extensionsFilled && this.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && !this.memory.harvesting) {
                    //find the closest extensions
                    //TODO: optimize this somehow more
                    if (this.memory.fillTarget && this.memory.fillTarget != "none") {
                        let creepfillTarget = Game.getObjectById(this.memory.fillTarget);

                        //set the memory to none if it is full
                        if (creepfillTarget.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                            this.memory.fillTarget = "none";
                        }
                    }

                    //assign a new object that needs filling to be the target
                    if (!this.memory.fillTarget || this.memory.fillTarget == "none") {
                        this.memory.fillTarget = this.pos.findClosestByPath(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}
                                }).id;
                    }
                    
                } else {
                    return true; //move to next task
                }

                //if there is a target, move towards it and transfer
                var creepFillTarget = Game.getObjectById(this.memory.fillTarget);
                if(creepFillTarget) {
                    if (this.pos.inRangeTo(creepFillTarget, 1)) {
                        this.transfer(creepFillTarget, RESOURCE_ENERGY);
                    } else {
                        this.moveTo(creepFillTarget, {visualizePathStyle: {stroke: '#00dbfe', lineStyle: 'undefined'}});
                    }
                }
                return false; //do it again
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
                    if (Memory.roomsCache[this.room.name].structures.links.controller) {
                        this.memory.link = Memory.roomsCache[this.room.name].structures.links.controller[0];
                    } else {
                        this.memory.link = "none";
                    }
                }

                if (!this.memory.harvesting) {
                    if (this.pos.inRangeTo(creepController, 3)) {
                        this._upgradeController(creepController);
                    } else {
                        this.moveTo(creepController, {visualizePathStyle: {stroke: '#fe4100', lineStyle: 'undefined'}});
                    }
                    return false; //do it again
                } else {
                    return true; //move on to next task
                }
            }
        }



        //task to build structures
        if (!Creep.prototype._build) {
            //store the original version of the function
            Creep.prototype._build = Creep.prototype.build;

            Creep.prototype.build = function() {
                //check memory if the room has any construction sites
                if (Memory.roomsPersistent[this.pos.roomName].constructionSites.length > 0 && this.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && !this.memory.harvesting) {
                    //find the closest site
                    //TODO: optimize this somehow more
                    if (this.memory.siteTarget && this.memory.siteTarget != "none") {
                        let creepSiteTarget = Game.getObjectById(this.memory.siteTarget);

                        //set the memory to none if it no longer exists
                        if (!creepSiteTarget) {
                            this.memory.siteTarget = "none";
                        }
                    }
                    //assign a new object that needs siteing to be the target
                    if (!this.memory.siteTarget || this.memory.siteTarget == "none") {
                        console.log("test2");
                        let siteList = Memory.roomsPersistent[this.pos.roomName].constructionSites.map(site => Game.getObjectById(site));
                        this.memory.siteTarget = this.pos.findClosestByPath(siteList).id;
                    }
                    
                } else {
                    return true; //move to next task
                }

                //if there is a target, move towards it and transfer
                var creepSiteTarget = Game.getObjectById(this.memory.siteTarget);
                if(creepSiteTarget) {
                    if (this.pos.inRangeTo(creepSiteTarget, 1)) {
                        this._build(creepSiteTarget, RESOURCE_ENERGY);
                    } else {
                        this.moveTo(creepSiteTarget, {visualizePathStyle: {stroke: '#4dfe00', lineStyle: 'undefined'}});
                    }
                }
                return false; //do it again
            }
        }
    }
};

module.exports = systemInit;