var structureTowers = {

    /** @param {Turret} tower **/
    run: function(room) {
        //get live objects
        var roomObj = Game.rooms[room];
        var roomTowers = Memory.roomsCache[room].structures.towers.map(tower => Game.getObjectById(tower));
        var roomAnchor = Memory.roomsPersistent[room].roomPlanning.anchor;

        //all hostiles
        var hostiles = roomObj.find(FIND_HOSTILE_CREEPS);
        var repairTargets = [];
        var closeRamparts = [];
        var farRamparts = [];
        //store repair targets into cache every 20 ticks
        if (Game.time % 20 == 0) { 
            repairTargets = roomObj.find(FIND_STRUCTURES, {filter: struc => [STRUCTURE_ROAD, STRUCTURE_CONTAINER].includes(struc.structureType) && (struc.hits < struc.hitsMax)});
            var roomRamparts = roomObj.find(FIND_STRUCTURES, {filter: struc => struc.structureType == STRUCTURE_RAMPART});

            //sort the ramparts into close and far
            for (let ramp of roomRamparts) {
                if ((ramp.pos.x > roomAnchor.x - 2 && ramp.pos.x < roomAnchor.x + 12 && ramp.pos.y > roomAnchor.y - 2 && ramp.pos.y < roomAnchor.y + 12)) {
                    if (ramp.hits < 4000) {
                        closeRamparts.push(ramp.id);
                    }
                } else {
                    if (ramp.hits < 20000) {
                        farRamparts.push(ramp.id);
                    }
                }
            }
            Memory.roomsPersistent[room].towerRepairTargets = {};
            Memory.roomsPersistent[room].towerRepairTargets.repairTargets = repairTargets.map(targ => targ.id);
            Memory.roomsPersistent[room].towerRepairTargets.closeRamparts = closeRamparts;
            Memory.roomsPersistent[room].towerRepairTargets.farRamparts = farRamparts;
        } else {
            repairTargets = Memory.roomsPersistent[room].towerRepairTargets.repairTargets.map(function(targ) {
                let liveObj = Game.getObjectById(targ);
                if (liveObj && liveObj.hits < liveObj.hitsMax) {
                    return liveObj
                }
            });
            closeRamparts = Memory.roomsPersistent[room].towerRepairTargets.closeRamparts.map(function(targ) {
                let liveObj = Game.getObjectById(targ);
                if (liveObj && liveObj.hits < liveObj.hitsMax) {
                    return liveObj
                }
            });
            farRamparts = Memory.roomsPersistent[room].towerRepairTargets.farRamparts.map(function(targ) {
                let liveObj = Game.getObjectById(targ);
                if (liveObj && liveObj.hits < liveObj.hitsMax) {
                    return liveObj
                }
            });
        }

        for (var tower of roomTowers) {
            //TODO: lots of work
            if (hostiles && hostiles.length > 0) {
                let closestHostile = tower.pos.findClosestByRange(hostiles);
                let success = tower.attack(closestHostile);
                if (success == 0) {
                    Memory.roomsPersistent[tower.room.name].stats.energySpentTower += 10;
                    continue;
                }
            }

            var target;
            //target priority selection
            if (closeRamparts && closeRamparts.length > 0) {
                target = tower.pos.findClosestByRange(closeRamparts);

            } else if (repairTargets && repairTargets.length > 0) {
                target = tower.pos.findClosestByRange(repairTargets);
                
            } else if (farRamparts && farRamparts.length > 0) {
                target = tower.pos.findClosestByRange(farRamparts);

            }

            if(target && tower.store.getUsedCapacity(RESOURCE_ENERGY) > 250) {
                let success = tower.repair(target);
                if (success == 0) {
                    Memory.roomsPersistent[tower.room.name].stats.energySpentTower += 10;
                }
            }
        }
    }
};

module.exports = structureTowers;