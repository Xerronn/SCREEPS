var roleCombat = {

    /** @param {Creep} creep **/
    run: function(creep) {
        try {
            //iterate through tasks in order of importance(order)
            for (var task of creep.memory.tasks) {
                //if this variable gets set to true, it will stop the iteration through tasks
                var taskCompleted = false;
                switch(task) {
                    case TASK_REMOTE:
                        if (creep.remote() == true) {
                            taskCompleted = true;
                        }
                        break;
                    case TASK_COMBAT_MELEE_DEFEND:
                        if (creep.meleeDefend() == true) {
                            taskCompleted = true;
                        }
                        break;
                }
                //break the loop if it finds what it needs to do
                if (taskCompleted) break;
            }
        } catch (err) {
            let hyperlink = "<a href='#!/room/shard3/" + creep.room.name + "'>" + creep.room.name + "</a>"
            console.log("Combat unit " + creep.name + " has error " + err + " in room " + hyperlink);
        }
	}
};

module.exports = roleCombat;