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
            tower.attack(closestHostile);
        }

        var targets = tower.room.find(FIND_STRUCTURES, {
                filter: function (structure) {
                    let shouldHeal = true;
                    if ([STRUCTURE_WALL, STRUCTURE_RAMPART].includes(structure.structureType) && structure.hits > 100000) {
                        shouldHeal = false;
                    }
                    //disabled walls and ramparts
                    return [STRUCTURE_ROAD, STRUCTURE_CONTAINER].includes(structure.structureType)  &&
                        structure.hits < structure.hitsMax && shouldHeal;
                }
        });
        var target =  _.sortBy(targets, (struc) => struc.hits/struc.hitsMax)[0];
        if(target && !closestHostile && tower.store.getUsedCapacity(RESOURCE_ENERGY) > 750) {
            tower.repair(target);
        }
    }
};

module.exports = structureTower;