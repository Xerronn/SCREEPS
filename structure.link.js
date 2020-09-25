var structureLink = {

    /** @param {Turret} link **/
    run: function(link) {
        var linkType = Memory.rooms[link.room.name]["structures"]["links"]["all"][link.id]["type"];
        
        var storageLinks = Memory.rooms[link.room.name]["structures"]["links"]["storage"].map(
            (struc) => {return Game.getObjectById(struc)});
        
        var containerLinks = Memory.rooms[link.room.name]["structures"]["links"]["container"].map(
            (struc) => {return Game.getObjectById(struc)});

        var controllerLinks = Memory.rooms[link.room.name]["structures"]["links"]["controller"].map(
            (struc) => {return Game.getObjectById(struc)});

        var noneLinks = Memory.rooms[link.room.name]["structures"]["links"]["none"].map(
            (struc) => {return Game.getObjectById(struc)});

        switch (linkType) {
            case "storage":
                if (link.store.getFreeCapacity(RESOURCE_ENERGY) >= link.store.getCapacity(RESOURCE_ENERGY) / 2 && controllerLinks[0]) {
                    if (controllerLinks[0].store.getUsedCapacity(RESOURCE_ENERGY) <= controllerLinks[0].store.getCapacity(RESOURCE_ENERGY) / 2) {
                        link.transferEnergy(controllerLinks[0]);
                    }
                }
                break;
            case "container":
            case "none":
                if (link.store.getFreeCapacity(RESOURCE_ENERGY) >= link.store.getCapacity(RESOURCE_ENERGY) / 2 && storageLinks[0]) {
                    if (storageLinks[0].store.getFreeCapacity != 0) {
                        link.transferEnergy(storageLinks[0]);
                    }
                }
                break;
        }
    }

};

module.exports = structureLink;