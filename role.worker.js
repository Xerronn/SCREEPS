var roleWorker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        try {
            //iterate through tasks in order of importance(order)
            for (var task of creep.memory.tasks) {
                var taskCompleted = false;
                switch(task) {
                    case TASK_HARVEST:
                    case TASK_DROP_HARVEST:
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
                    case TASK_FILL_EXTENSIONS:
                        if (creep.fillExtensions() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_FILL_TOWERS:
                    case TASK_FILL_STORAGE:
                    case TASK_BUILD:
                        if (creep.build() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_UPGRADE:
                        if (creep.upgradeController() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_REPAIR:
                    case TASK_MANAGE_LINK:
                }
                //break the loop if it finds what it needs to do
                if (!taskCompleted) break;
            }
        } catch (err) {
            let hyperlink = "<a href='#!/room/shard3/" + creep.room.name + "'>" + creep.room.name + "</a>"
            console.log(creep.name + " has error " + err + " in room " + hyperlink);
        }
	}
};

module.exports = roleWorker;