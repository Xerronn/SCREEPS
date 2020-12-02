const work = require('creep.work');
const combat = require('creep.combat');

const roomDefense = require('system.defense');
const structureLink = require('structure.link');

var systemTaskManager = {
    run: function() {
        //task assignment:
        for (var name in Game.creeps) {
            var creep = Game.creeps[name];
            let startCpu = Game.cpu.getUsed();
            switch (creep.memory.type) {
                case 'worker':
                    work.run(creep);
                    break;
                case 'attacker':
                    combat.run(creep);
                    break;
            }
            let endCpu = Game.cpu.getUsed() - startCpu;
            //cpu logging per creep
            if (endCpu > 2) {
                let hyperlink = "[<a href='#!/room/shard3/" + creep.room.name + "'>" + creep.room.name + "</a>] "
                console.log(hyperlink + name + " is using " + endCpu + " CPU!");
            }
        }
        //loop through all rooms
        
        // 
        // for (var room of myRooms) {
        //     //find all structures in each room that have something to execute
        //     var structures = Game.rooms[room].find(FIND_STRUCTURES, {
        //         filter: (structure) => {
        //             return [STRUCTURE_TOWER, STRUCTURE_LINK].includes(structure.structureType);
        //         }
        //     });
        //     //execute for each structure
        //     for (var structure of structures) {
                
        //         switch (structure.structureType) {
        //             case STRUCTURE_TOWER:
        //                 structureTower.run(structure);
        //                 break;
        //             case STRUCTURE_LINK:
        //                 structureLink.run(structure);
        //                 break;
        //         }
        //     }
        // }
       
        var myRooms = Object.keys(Memory.roomsPersistent);

        //execute once per room
        for (var room of myRooms) {
            //get live objects of towers and links
            
            var roomLinks = Object.keys(Memory.roomsCache[room].structures.links.all).map(link => Game.getObjectById(link))
            for (let link of roomLinks) {
                structureLink.run(link);
            }
            
            //run tower code for this room
            roomDefense.run(room);
        }
        
        
        
    }
};

module.exports = systemTaskManager;