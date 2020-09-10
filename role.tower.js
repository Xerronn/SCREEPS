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
    
            var targets = tower.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return [STRUCTURE_ROAD, STRUCTURE_CONTAINER].includes(structure.structureType)  &&
                            structure.hits < structure.hitsMax;
                    }
            });
            if(targets.length > 0 && !closestHostile && tower.store.getUsedCapacity(RESOURCE_ENERGY) > tower.store.getCapacity(RESOURCE_ENERGY) / 2) {
                tower.repair(targets[0]);
            }
    }

};

module.exports = roleTower;