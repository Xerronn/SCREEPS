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
    }
};

module.exports = systemCombatPrototypes;