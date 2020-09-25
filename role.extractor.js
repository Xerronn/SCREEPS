var roleExtractor = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (!creep.memory.extractor) {
            creep.memory.extractor = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTRACTOR)
                }}).id;
            creep.memory.mineral = creep.pos.findClosestByRange(FIND_MINERALS).id;
        } else {
            var extractor = Game.getObjectById(creep.memory.extractor);
            var mineral = Game.getObjectById(creep.memory.mineral);

            if (creep.store.getUsedCapacity(mineral.mineralType) == 0) {
                creep.memory.mining = true;
            } else if (creep.store.getFreeCapacity(mineral.mineralType) == 0) {
                creep.memory.mining = false;
            }

            if (creep.memory.mining) {
                if (creep.pos.inRangeTo(extractor, 1)) {
                    creep.harvest(mineral);
                } else {
                    creep.moveTo(extractor);
                }
            } else {
                var lab = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_LAB)
                    }});
                if (creep.pos.inRangeTo(lab, 1)) {
                    creep.transfer(lab, mineral.mineralType);
                } else {
                    creep.moveTo(lab);
                }
            }
        }
	}
};

module.exports = roleExtractor;