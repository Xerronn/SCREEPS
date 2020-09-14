var structureLink = {

    /** @param {Turret} link **/
    run: function(link) {

        var controller = link.room.controller;
        var storage = Game.spawns['French Armada From Spain'].room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_STORAGE})[0];
        var controllerLink, storageLink;
        //determins which link is the storage link vs controller link
        if (controller && storage) {
            var targets = link.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return [STRUCTURE_LINK].includes(structure.structureType);
                }
            });
            if(targets.length > 0) {
                controllerLink = controller.pos.findInRange(targets,6)[0];
                storageLink = storage.pos.findInRange(targets,6)[0];
            }
        }
        if (link.store.getFreeCapacity(RESOURCE_ENERGY) == 0 && storageLink && controllerLink && link.id == storageLink.id) {
            link.transferEnergy(controllerLink);
        }
    }

};

module.exports = structureLink;