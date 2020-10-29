var roleWorker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        try {
            //iterate through tasks in order of importance(order)
            for (var task of creep.memory.tasks) {
                //if this variable gets set to true, it will stop the iteration through tasks
                var taskCompleted = false;
                switch(task) {
                    case TASK_HARVEST://move to next
                    case TASK_HARVEST_DROP://move to next
                    case TASK_HARVEST_LINK:
                        if (creep.harvest() == true) {
                            taskCompleted = true;
                        } 
                        break;
                    case TASK_WITHDRAW_STORAGE:
                        if (creep.withdrawStorage() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_WITHDRAW_CONTAINER:
                        if (creep.withdrawContainer() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_TRANSPORT:
                        if (creep.transport() == true) {
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
                    case TASK_FILL_STORAGE:
                        if (creep.fillStorage() == true) {
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
                    case TASK_MANAGE_LINK:
                        if (creep.manageLink() == true) {
                            taskCompleted = true;
                        }
                        break;
                }
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