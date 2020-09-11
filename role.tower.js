var roleTower = {

    /** @param {Turret} tower **/
    run: function(tower) {
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
    
            var target = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: function (structure) {
                        let shouldHeal = true;
                        if ([STRUCTURE_WALL, STRUCTURE_RAMPART].includes(structure.structureType) && structure.hits > 100000) {
                            shouldHeal = false;
                        }
                        return [STRUCTURE_RAMPART, STRUCTURE_ROAD, STRUCTURE_CONTAINER].includes(structure.structureType)  &&
                            structure.hits < structure.hitsMax && shouldHeal;
                    }
            });
            if(target && !closestHostile && tower.store.getUsedCapacity(RESOURCE_ENERGY) > tower.store.getCapacity(RESOURCE_ENERGY) / 2) {
                tower.repair(target);
            }
    }

};

module.exports = roleTower;