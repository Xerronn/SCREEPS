var structureTower = {

    /** @param {Turret} tower **/
    run: function(tower) {
        //NEEDS OPTIMIZATION
        // var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        //     filter: (structure) => structure.hits < structure.hitsMax
        // });
        // if(closestDamagedStructure) {
        //     tower.repair(closestDamagedStructure);
        // }
        //TODO: rewrite
        //check for things to repair

        //TODO
        // var enemies = tower.pos.room.find(FIND_HOSTILE_CREEPS);
        // var hostiles;

        //TODO
        // if (enemies.length > 0) {
        //     hostiles = _.sortBy(enemies, hst => hst.getActiveBodyparts(ATTACK) > 0 || hst.getActiveBodyparts(RANGED_ATTACK) > 0);
        // }
        let startCpu = Game.cpu.getUsed();
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            
            let success = tower.attack(closestHostile);
            if (success == 0) {
                Memory.roomsPersistent[tower.room.name].stats.energySpentTower += 10;
            }
        }

        //TODO, don't do this for every tower, do it once per room, maybe once every few ticks
        var targets;
        if (!Memory.roomsPersistent[tower.room.name].towerRepairTargets || Memory.roomsPersistent[tower.room.name].towerRepairTargetsRefresh < Game.time) {
            targets = tower.room.find(FIND_STRUCTURES, {filter: struc => [STRUCTURE_ROAD, STRUCTURE_CONTAINER].includes(struc.structureType) && (struc.hits < struc.hitsMax)});
            let outerRamparts = Memory.roomsCache[tower.room.name].structures.ramparts.outer.map(ramp => Game.getObjectById(ramp));
            let bunkerRamparts = Memory.roomsCache[tower.room.name].structures.ramparts.bunker.map(ramp => Game.getObjectById(ramp));
        

            //append outer ramparts if their hp is less than 45k. dont want waller walking all the way out there
            for (let ramp of outerRamparts) {
                if (ramp.hits < 45000) {
                    targets.push(ramp);
                }
            }

            //help the bunker ramparts get started
            for (let ramp of bunkerRamparts) {
                if (ramp.hits < 5000) {
                    targets.push(ramp);
                }
            }

            targets =  _.sortBy(targets, (struc) => struc.hits/struc.hitsMax);

            Memory.roomsPersistent[tower.room.name].towerRepairTargets = targets.map(struc => struc.id);
            Memory.roomsPersistent[tower.room.name].towerRepairTargetsRefresh = Game.time + 300;
        } else {
            targets = Memory.roomsPersistent[tower.room.name].towerRepairTargets.map(struc => Game.getObjectById(struc));
        }
        
        var target;
        for (let targ of targets) {
            if (targ.hits < hitsMax) {
                target = targ;
            }
        }

        if(target && !closestHostile && tower.store.getUsedCapacity(RESOURCE_ENERGY) > 250) {
            let success = tower.repair(target);
            if (success == 0) {
                Memory.roomsPersistent[tower.room.name].stats.energySpentTower += 10;
            }
        }
    }
};

module.exports = structureTower;