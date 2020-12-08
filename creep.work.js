var roleWorker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        try {
            //store the cpu used per task over the last ticks
            if (!creep.memory.cpuLog) {
                creep.memory.cpuLog = {};
            }
            creep.memory.cpuLog[(Game.time % 5) + 1] = [];

            //TODO: change this so the try is in the prototypes instead of here
            //iterate through tasks in order of importance(order)
            for (var task of creep.memory.tasks) {
                let taskCpu = Game.cpu.getUsed();

                //if this variable gets set to true, it will stop the iteration through tasks
                var taskCompleted = false;
                switch(task) {
                    case TASK_HARVEST_ENERGY://move to next
                    case TASK_HARVEST_ENERGY_DROP://move to next
                    case TASK_HARVEST_ENERGY_LINK:
                        if (creep.harvestEnergy() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_HARVEST_MINERAL:
                    case TASK_HARVEST_MINERAL_DROP:
                        if (creep.harvestMineral() == true) {
                            taskCompleted = true;
                        } 
                        break;
                    case TASK_WITHDRAW_STORAGE:
                        if (creep.withdrawStorage() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_WITHDRAW_STORAGE_CONTAINER:
                        if (creep.withdrawStorageContainer() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_WITHDRAW_CONTAINER:
                        if (creep.withdrawContainer() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_WITHDRAW_TERMINAL:
                        if (creep.withdrawTerminal() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_TRANSPORT_ENERGY:
                        if (creep.transportEnergy() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_TRANSPORT_MINERALS:
                        if (creep.transportMinerals() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_SALVAGE:
                        if (creep.salvage() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_PILLAGE:
                        if (creep.pillage() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_FILL_EXTENSION:
                        if (creep.fillExtensions() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_FILL_TOWER:
                        if (creep.fillTowers() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_FILL_TOWER_STATIC:
                        if (creep.fillTowersStatic() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_FILL_STORAGE:
                        if (creep.fillStorage() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_FILL_STORAGE_CONTAINER:
                        if (creep.fillStorageContainer() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_FILL_TERMINAL:
                        if (creep.fillTerminal() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_BUILD:
                        if (creep.build() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_UPGRADE:
                    case TASK_UPGRADE_LINK:
                        if (creep.upgradeController() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_REPAIR:
                    case TASK_REPAIR_WALL:
                        if (creep.repair() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_MANAGE_LINK:
                        if (creep.manageLink() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_MANAGE_TERMINAL:
                        if (creep.manageTerminal() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_RENEW:
                        if (creep.renew() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_REMOTE:
                        if (creep.remote() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_ROOM_SIGN:
                        if (creep.sign() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_ROOM_CLAIM:
                        if (creep.claim() == true) {
                            taskCompleted = true;
                        }
                        break;
                }
                //push the cpu used during the task to the list
                creep.memory.cpuLog[(Game.time % 5) + 1].push(Game.cpu.getUsed() - taskCpu);

                //break the loop if it finds what it needs to do
                if (taskCompleted) break;
            }
        } catch (err) {
            let hyperlink = "<a href='#!/room/shard3/" + creep.room.name + "'>" + creep.room.name + "</a>"
            console.log(creep.name + " has error " + err + " in room " + hyperlink);
        }
	}
};

module.exports = roleWorker;