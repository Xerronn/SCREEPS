const systemMemory = require("./system.memory");

var systemUI = {
    run: function() {
        if (Memory.config.ui.enabled) {
            for (var room of MY_ROOMS) {
                //HEADERS
                Game.rooms[room].visual.rect(0, 0, 49, 49, {opacity: 0.7});
                Game.rooms[room].visual.text("HollowBot", 24, 4, {color: "black", opacity: 0.9, font: "2.1 Consolas"});
                Game.rooms[room].visual.text(room, 24, 6, {color: "black", opacity: 0.9, font: "1.7 Consolas"});
                Game.rooms[room].visual.text("Creep Counts", 38.5, 7, {color: "black", opacity: 0.9, font: "1.7 Consolas"});
                Game.rooms[room].visual.text("Energy", 9.5, 7, {color: "black", opacity: 0.9, font: "1.7 Consolas"});

                //CREEP COUNTS
                var roomRoles = Object.keys(Memory.roomsPersistent[room].creepCounts);
                var counter = 0;
                var roleCounter = 0;
                for (var role of roomRoles) {
                    //only show them if they are greater than 0
                    let roleCount = Memory.roomsPersistent[room].creepCounts[role];
                    if (roleCount > 0) {
                        Game.rooms[room].visual.text(role, 33, (9 + (counter * 1.3)), {align: "left", color: "black", opacity: 0.9, font: "1.3 Consolas"});
                        Game.rooms[room].visual.text(roleCount, 43.5, (9 + (counter * 1.3)), {align: "left", color: "black", opacity: 0.9, font: "1.3 Consolas"});
                        roleCounter += roleCount;
                        counter++;
                    }
                }
                Game.rooms[room].visual.text("total", 33, (9 + (counter * 1.3)), {align: "left", color: "black", opacity: 0.9, font: "1.3 Consolas"});
                Game.rooms[room].visual.text(roleCounter, 43.5, (9 + (counter * 1.3)), {align: "left", color: "black", opacity: 0.9, font: "1.3 Consolas"});

                //GRAPHS
                Game.rooms[room].visual.circle(9.5, 13, {stroke: "black", opacity: 0.9, radius: 5, fill: "transparent"});
            }
        }
    }
};

module.exports = systemUI;