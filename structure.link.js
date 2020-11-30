var structureLink = {

    /** @param {Turret} link **/
    run: function(link) {
        try {
            let startCpu = Game.cpu.getUsed();
            var linkType = Memory.roomsCache[link.room.name]["structures"]["links"]["all"][link.id]["type"];
            
            var storageLink = Game.getObjectById(Memory.roomsCache[link.room.name]["structures"]["links"]["storage"][0]);
            
            // var containerLinks = Memory.roomsCache[link.room.name]["structures"]["links"]["container"].map(
            //     (struc) => {return Game.getObjectById(struc)});

            var controllerLink = Game.getObjectById(Memory.roomsCache[link.room.name]["structures"]["links"]["controller"][0]);

            // var noneLinks = Memory.roomsCache[link.room.name]["structures"]["links"]["none"].map(
            //     (struc) => {return Game.getObjectById(struc)});

            switch (linkType) {
                case "storage":
                    if (link.store.getUsedCapacity(RESOURCE_ENERGY) >= 200 && controllerLink) {
                        if (controllerLink.store.getUsedCapacity(RESOURCE_ENERGY) < 650) {
                            link.transferEnergy(controllerLink);
                        }
                    }
                    break;
                case "container":
                case "none":
                    if (link.store.getFreeCapacity(RESOURCE_ENERGY) <= 400 && storageLink) {
                        if (storageLink.store.getFreeCapacity(RESOURCE_ENERGY) != 0) {
                            link.transferEnergy(storageLink);
                        }
                    }
                    break;
            }
            //console.log(Game.cpu.getUsed() - startCpu);
        } catch (err) {
        //do nothing
        }
    } 
};

module.exports = structureLink;