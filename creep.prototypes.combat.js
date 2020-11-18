var systemCombatPrototypes = {
    run: function() {
        //creep prototypes for combat

        //prototype for melee defender
        if (!Creep.prototype.meleeDefend) {
            Creep.prototype.meleeDefend = function () {
                var closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                var closestHostileBuilding = this.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
                var friends = this.room.find(FIND_MY_CREEPS, { filter: (creep) => creep.hits < creep.hitsMax});
                if(closestHostile) {
                    if (this.pos.inRangeTo(closestHostile, 1)) {
                        this.attack(closestHostile);
                    } else {
                        this.moveTo(closestHostile, {visualizePathStyle: {stroke: COLOR_ATTACK}});
                    }
                    return true;//move to next tick
                }
                else if (friends.length > 0) {
                    var target = _.sortBy(friends, (f) => f.pos.getRangeTo(this.pos))[0];
                    if (this.pos.inRangeTo(target, 1)) {
                        this.heal(target);
                    } else {
                        this.moveTo(target, {visualizePathStyle: {stroke: COLOR_MOVE}});
                    }
                    return true; //move to next tick
                } else {
                    if(closestHostileBuilding) {
                            if (this.pos.inRangeTo(closestHostileBuilding, 1)) {
                                this.attack(closestHostileBuilding);
                            } else {
                                this.moveTo(closestHostileBuilding, {visualizePathStyle: {stroke: COLOR_ATTACK}});
                            }
                            return true; //move to next tick
                    } else {
                        //TODO: THIS WILL MAKE IT ALWAYs MOVE THERE. ADD A TASK FOR THIS PROBABLY
                        let restingPoint = new RoomPosition(35,31, this.room.name);
                        if (!this.pos.inRangeTo(restingPoint, 5)) {
                            this.moveTo(restingPoint);
                        } else {
                            return false; //move to next task
                        }
                    }
                }
            }
        }



        //prototype to drain turrets in a room
        //TODO: this needs so much more polishing
        if (!Creep.prototype.drainTurret) {
            Creep.prototype.drainTurret = function() {
                //if hits are less than half, move out of assigned room
                if (this.hits < this.hitsMax/3 && this.room.name == this.memory.assignedRoom) {
                    this.moveTo(this.pos.findClosestByRange(FIND_EXIT));
                }

                //move off the edge
                if (this.pos.x == 0 || this.pos.y == 0 || this.pos.x == 49 || this.pos.y == 49) {
                    this.moveTo(new RoomPosition(25,25, this.room.name));
                }

            }
        }



        //prototype for attacking things in a room
        //TODO: make this way better. lots of code can be deleted here
        if (!Creep.prototype.attackRoom) {
            Creep.prototype.attackRoom = function () {
                //find all targets
                let hostiles = this.room.find(FIND_HOSTILE_CREEPS);
                let hostileCombatants = _.filter(hostiles, hst => hst.getActiveBodyparts(ATTACK) > 0 || hst.getActiveBodyparts(RANGED_ATTACK) > 0)
                let hostileBuildings = this.room.find(FIND_HOSTILE_STRUCTURES, {filter: struc => struc.structureType != STRUCTURE_CONTROLLER && struc.structureType != STRUCTURE_STORAGE});
                let hostileTowers = this.room.find(FIND_HOSTILE_STRUCTURES, {filter: struc => struc.structureType == STRUCTURE_TOWER})
                let hostileSpawns = this.room.find(FIND_HOSTILE_SPAWNS);

                //creeps first
                if (hostileCombatants && hostileCombatants.length > 0) {
                    if (!this.memory.attackTarget || this.memory.attackTarget == "none") {
                        let nearestCreep = this.pos.findClosestByRange(hostileCombatants);
                        this.memory.attackTarget = nearestCreep.id;
                    }
                    let creepTarget = Game.getObjectById(this.memory.attackTarget);
                    if (!creepTarget) {
                        this.memory.attackTarget = "none";
                        return true; //move to next tick
                    }
                    if (this.pos.inRangeTo(creepTarget, 1)) {
                        this.attack(creepTarget);
                    } else {
                        this.moveTo(creepTarget, {visualizePathStyle: {stroke: COLOR_ATTACK}});
                    }
                    return true; //move to next tick

                }

                //buildings next
                if (hostileBuildings && hostileBuildings.length > 0) {
                    if (!this.memory.attackTarget || this.memory.attackTarget == "none") {
                        let nearestBuilding;
                        //towers first
                        if (hostileTowers && hostileTowers.length > 0){
                            nearestBuilding = this.pos.findClosestByRange(hostileTowers);
                        } else if (hostileSpawns && hostileSpawns.length > 0){
                            //spawns second
                            nearestBuilding = this.pos.findClosestByRange(hostileSpawns);
                        } else {
                            nearestBuilding = this.pos.findClosestByRange(hostileBuildings);
                        }
                        this.memory.attackTarget = nearestBuilding.id;
                    }
                    let creepTarget = Game.getObjectById(this.memory.attackTarget);
                    if (!creepTarget) {
                        this.memory.attackTarget = "none";
                        return true; //move to next tick
                    }
                    if (this.pos.inRangeTo(creepTarget, 1)) {
                        this.attack(creepTarget);
                    } else {
                        this.moveTo(creepTarget, {visualizePathStyle: {stroke: COLOR_ATTACK}});
                    }
                    return true; //move to next tick
                }

                //regular creeps last
                if (hostiles && hostiles.length > 0) {
                    if (!this.memory.attackTarget || this.memory.attackTarget == "none") {
                        let nearestCreep = this.pos.findClosestByRange(hostiles);
                        this.memory.attackTarget = nearestCreep.id;
                    }
                    let creepTarget = Game.getObjectById(this.memory.attackTarget);
                    if (!creepTarget) {
                        this.memory.attackTarget = "none";
                        return true; //move to next tick
                    }
                    if (this.pos.inRangeTo(creepTarget, 1)) {
                        this.attack(creepTarget);
                    } else {
                        this.moveTo(creepTarget, {visualizePathStyle: {stroke: COLOR_ATTACK}});
                    }
                    return true; //move to next tick
                }

            }
        }



        //prototype for healing itself every tick
        if (!Creep.prototype.healSelf) {
            Creep.prototype.healSelf = function () {
                if (this.hits < this.hitsMax) {
                    this.heal(this);
                }
                return false; //move to next task
            }
        }
    }
};

module.exports = systemCombatPrototypes;