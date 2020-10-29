var systemGlobals = {
    run: function() {
        //global declarations of some things
        if (!INITIALIZED) {
            global.INITIALIZED = true;
            global.TASK_HARVEST = "harvest"; //implemented
            global.TASK_HARVEST_DROP = "harvest_drop"; //implemented
            global.TASK_HARVEST_LINK = "harvest_link"; //implemented
            global.TASK_WITHDRAW_STORAGE = "withdraw_storage"; //implemented
            global.TASK_WITHDRAW_CONTAINER = "withdraw_container"; //implemented
            global.TASK_TRANSPORT = "transport"; //implemented
            
            global.TASK_FILL_EXTENSION = "fill_extension"; //implemented
            global.TASK_FILL_TOWER = "fill_tower"; //implemented
            global.TASK_FILL_STORAGE = "fill_storage"; //implemented

            global.TASK_UPGRADE = "upgrade"; //implemented
            global.TASK_UPGRADE_LINK = "upgrade_link"; //implemented
            global.TASK_BUILD = "build"; //implemented
            global.TASK_MANAGE_LINK = "manage_link"; //implemented
            global.TASK_REPAIR = "repair";
            global.TASK_REPAIR_WALL = "repair_wall";
    
            global.TASK_REMOTE = "remote"; //task placed in highest priority to move a creep to a distance room
            global.TASK_ROOM_CLAIM = "claim";
            global.TASK_ROOM_RESERVE = "reserve";

            //color constants for actions
            global.COLOR_ENERGY_GET = "dae028";
            global.COLOR_ENERGY_SPEND = "1dde20";
            global.COLOR_ATTACK = "ff1900";
            global.COLOR_MOVE = "ffffff";
        }
    }
};

module.exports = systemGlobals;