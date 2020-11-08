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
        
        //check for things to repair
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            let success = tower.attack(closestHostile);
            if (success == 0) {
                Memory.roomsPersistent[tower.room.name].stats.energySpentTower += 10;
            }
        }

        var targets = tower.room.find(FIND_STRUCTURES, {
                filter: function (structure) {
                    let shouldHeal = true;
                    if ([STRUCTURE_WALL, STRUCTURE_RAMPART].includes(structure.structureType) && structure.hits > 1000) {
                        shouldHeal = false;
                    }
                    //disabled walls but added ramparts back to get them kickstarted
                    return [STRUCTURE_ROAD, STRUCTURE_CONTAINER, STRUCTURE_RAMPART].includes(structure.structureType)  &&
                        structure.hits < structure.hitsMax && shouldHeal;
                }
        });
        var target =  _.sortBy(targets, (struc) => struc.hits/struc.hitsMax)[0];
        if(target && !closestHostile && tower.store.getUsedCapacity(RESOURCE_ENERGY) > 250) {
            let success = tower.repair(target);
            if (success == 0) {
                Memory.roomsPersistent[tower.room.name].stats.energySpentTower += 10;
            }
        }
    }
};

module.exports = structureTower;