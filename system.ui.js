const systemMemory = require("./system.memory");

var systemUI = {
    run: function() {
        if (Memory.config.ui.enabled) {
            for (var room of MY_ROOMS) {

                //get stats object
                var stats = Memory.roomsPersistent[room].stats;
                var numTicks = stats.timeSinceReset;

                //background
                Game.rooms[room].visual.rect(-1, -1, 51, 51, {opacity: 0.7});

                //HEADERS
                //game time
                Game.rooms[room].visual.text(Game.time, 49, 0.75, {align: "right", color: "black", opacity: 0.9, font: "1.3 Consolas"});

                Game.rooms[room].visual.text("HollowBot", 24.5, 3, {color: "black", opacity: 0.9, font: "2.1 Consolas"});
                Game.rooms[room].visual.text(room, 24.5, 4.7, {color: "black", opacity: 0.9, font: "1.7 Consolas"});
                Game.rooms[room].visual.text(numTicks + " ticks", 24.5, 6, {color: "black", opacity: 0.9, font: "1.3 Consolas"});

                //RCL STATS
                let progressLeft = CONTROLLER_LEVELS[Game.rooms[room].controller.level] - Game.rooms[room].controller.progress;
                let timeToGo = Math.ceil(progressLeft / (stats.energySpentUpgrading / stats.timeSinceReset));
                
                Game.rooms[room].visual.text("RCL Stats", 24.5, 15, {color: "black", opacity: 0.9, font: "1.7 Consolas"});
                Game.rooms[room].visual.line(19, 15.5, 30, 15.5, {color: "black", opacity: 0.9});

                //TODO: MAYBE ADD IN A GRAPH FOR THIS
                Game.rooms[room].visual.text("Level " + Game.rooms[room].controller.level + "/" + "8", 24.5, 17, {color: "black", opacity: 0.9, font: "1.3 Consolas"});
                Game.rooms[room].visual.text(Game.rooms[room].controller.progress + "/" + CONTROLLER_LEVELS[Game.rooms[room].controller.level], 24.5, 18.5, {color: "black", opacity: 0.9, font: "1.3 Consolas"});
                Game.rooms[room].visual.text(timeToGo + " ticks left", 24.5, 20, {color: "black", opacity: 0.9, font: "1.3 Consolas"});

                //CREEP COUNTS
                Game.rooms[room].visual.text("Creep Counts", 39.5, 7, {color: "black", opacity: 0.9, font: "1.7 Consolas"});
                Game.rooms[room].visual.line(32, 7.5, 47, 7.5, {color: "black", opacity: 0.9});

                var roomRoles = Object.keys(Memory.roomsPersistent[room].creepCounts);
                var counter = 0;
                var roleCounter = 0;
                for (var role of roomRoles) {
                    //only show them if they are greater than 0
                    let roleCount = Memory.roomsPersistent[room].creepCounts[role];
                    if (roleCount > 0) {
                        Game.rooms[room].visual.text(role, 34, (9 + (counter * 1.3)), {align: "left", color: "black", opacity: 0.9, font: "1.3 Consolas"});
                        Game.rooms[room].visual.text(roleCount, 44.5, (9 + (counter * 1.3)), {align: "left", color: "black", opacity: 0.9, font: "1.3 Consolas"});
                        roleCounter += roleCount;
                        counter++;
                    }
                }
                Game.rooms[room].visual.text("total", 34, (9 + (counter * 1.3)), {align: "left", color: "black", opacity: 0.9, font: "1.3 Consolas"});
                Game.rooms[room].visual.text(roleCounter, 44.5, (9 + (counter * 1.3)), {align: "left", color: "black", opacity: 0.9, font: "1.3 Consolas"});

                //net energy graph
                Game.rooms[room].visual.text("Net Energy", 24.5, 9, {color: "black", opacity: 0.9, font: "1.7 Consolas"});
                Game.rooms[room].visual.line(19, 9.5, 30, 9.5, {color: "black", opacity: 0.9});

                netEnergyGraph(room, 18, 11, 13, 1.5);  

                //bar graph
                Game.rooms[room].visual.text("Energy Costs", 9.5, 7, {color: "black", opacity: 0.9, font: "1.7 Consolas"});
                Game.rooms[room].visual.line(2, 7.5, 17, 7.5, {color: "black", opacity: 0.9});

                energyExpenditureBarGraph(room, 3, 8, 14, 12);
            }    
        }

        /**
         * Draws a graph showing net energy in a given room at given coords
         * 
         * @param {string} graphRoom 
         * @param {float} baseX 
         * @param {float} baseY 
         * @param {float} baseW 
         * @param {float} baseH 
         */
        function netEnergyGraph(graphRoom, baseX, baseY, baseW, baseH) {
            //data definitions
            let stats = Memory.roomsPersistent[graphRoom].stats;
            let totalMined = stats.energyHarvested;
            let totalSpent = stats.energySpentTotal;
            let net = Math.abs(totalMined - totalSpent);
            let percentSpent = totalSpent / totalMined;

            //draw the graph
            if (percentSpent <= 1) {
                let inverseSpent = 1 - percentSpent;
                //rect of spent energy
                Game.rooms[graphRoom].visual.rect(baseX, baseY, (baseW * percentSpent), baseH, {fill: "black", stroke: "black", opacity: 0.9});
                
                //line separating
                Game.rooms[graphRoom].visual.line(baseX + (baseW * percentSpent), (baseY + 1), baseX + (baseW * percentSpent), (baseY - 1), {color: "black", opacity: 0.9});
                
                //labels
                Game.rooms[graphRoom].visual.text("+" + net, baseX + (baseW * percentSpent) + 0.1, (baseY - 0.5), {color: "black", align: "left", opacity: 0.9, font: "0.75 Consolas"});
                Game.rooms[graphRoom].visual.text(totalSpent + "-", baseX + (baseW * percentSpent) - 0.1, (baseY - 0.5), {color: "black", align: "right", opacity: 0.9, font: "0.75 Consolas"});
                
                //rect of gained energy
                Game.rooms[graphRoom].visual.rect(baseX + (baseW * percentSpent), baseY, (baseW * inverseSpent), baseH, {fill: "green", stroke: "black", opacity: 0.9});
                
            } else {
                let percentNegative = percentSpent - 1;
                //full rect for spending more than receiving
                Game.rooms[graphRoom].visual.rect(baseX, baseY, baseW, baseH, {fill: "black", stroke: "black", opacity: 0.9});

                //line separating
                Game.rooms[graphRoom].visual.line(baseX + baseW, (baseY + 1), baseX + baseW, (baseY - 1), {color: "black", opacity: 0.9});
                
                //label
                Game.rooms[graphRoom].visual.text("-"+ net, baseX + baseW + 0.1, (baseY - 0.5), {color: "black", align: "left", opacity: 0.9, font: "0.75 Consolas"});

                //rect of spent energy
                Game.rooms[graphRoom].visual.rect(baseX + baseW, baseY, (baseW * percentNegative), baseH, {fill: "red", stroke: "black", opacity: 0.9});
            }
        }

        /**
         * function to draw bar graph for energy spending data at given coords
         * 
         * @param {string} graphRoom 
         * @param {int} baseX 
         * @param {int} baseY 
         * @param {int} baseW 
         * @param {int} baseH 
         */
        function energyExpenditureBarGraph(graphRoom, baseX, baseY, baseW, baseH) {
            //data definitions
            let stats = Memory.roomsPersistent[graphRoom].stats;
            let totalSpent = stats.energySpentTotal;
            let towerSpent = stats.energySpentTower;
            let spawnerSpent = stats.energySpentSpawning;
            let repairSpent = stats.energySpentRepairing;
            let upgradeSpent = stats.energySpentUpgrading;
            let spentList = [towerSpent, spawnerSpent, repairSpent, upgradeSpent];
            let spentListNames = ["twr", "spwn", "rpr", "upgrd"];

            
            //outline
            Game.rooms[graphRoom].visual.line(baseX, baseY, baseX, (baseY + baseH), {color: "black", opacity: 0.9});
            Game.rooms[graphRoom].visual.line(baseX, (baseY + baseH), (baseX + baseW), (baseY + baseH), {color: "black", opacity: 0.9});

            let max = totalSpent;
            let increment = Math.floor(max / 8);
            
            //labels
            counter = 0;
            for (var i = 0.5; i < 12; i += 1.5) {
                let label = Math.ceil((max - (increment * counter)) / 1000) * 1000;
                counter ++;
                Game.rooms[graphRoom].visual.text(label, (baseX - 0.2), (baseY + i), {align: "right", color: "black", opacity: 0.9, font: "1 Consolas"});
            }
            
            //draw rectangles
            max = spentList.length
            increment = 14 / max
            for (var i = 0; i < max; i++) {
                let offset = 1.5 + (increment * i);
                Game.rooms[graphRoom].visual.text(spentListNames[i], (baseX + offset), (baseY + baseH + 1), {color: "black", opacity: 0.9, font: "1 Consolas"});
                Game.rooms[graphRoom].visual.rect((baseX + offset - 0.75), (baseY + baseH), 1.5, -(baseH * (spentList[i] / totalSpent)), {fill: "black", stroke: "black", opacity: 0.9});
            }
        }
    }
};

module.exports = systemUI;