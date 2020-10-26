var roleWorker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        //iterate through tasks in order of importance(order)
        for (var task of creep.memory.tasks) {
            var taskCompleted = false;
            switch(task) {
                case TASK_HARVEST:
                case TASK_DROP_HARVEST:
                    if (creep.harvest() == true) {
                        taskCompleted = true;
                        console.log("yeeted");
                    } 
                    break;          
                case TASK_FILL_EXTENSIONS:
                    if (creep.fillExtensions() == true) {
                        taskCompleted = true;
                        console.log("yeeted2")
                    }
                    break;
                case TASK_FILL_TOWERS:
                case TASK_TRANSPORT:
                case TASK_BUILD:
                    if (creep.build() == true) {
                        taskCompleted = true;
                        console.log("yeeted4")
                    }
                    break;
                case TASK_UPGRADE:
                    if (creep.upgradeController() == true) {
                        taskCompleted = true;
                        console.log("yeeted3")
                    }
                    break;
                case TASK_REPAIR:
                case TASK_MANAGE_LINK:
            }
            //break the loop if it finds what it needs to do
            if (!taskCompleted) break;
        }
	}
};

module.exports = roleWorker;