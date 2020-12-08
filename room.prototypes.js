var roomStructuresExpiration = {};
var roomStructures = {};

const CACHE_TIMEOUT = 50;
const CACHE_OFFSET  = 4;

function getCacheExpiration () {
    return CACHE_TIMEOUT + Math.round((Math.random()*CACHE_OFFSET*2)-CACHE_OFFSET);
}

function initObj (obj) {
    if (!roomStructuresExpiration[obj.name] || !roomStructures[obj.name]) {
        roomStructuresExpiration[obj.name] = {};
        roomStructures[obj.name] = {};
    }
}

Object.defineProperty(Room.prototype, "fillables", {
    get: function(){
        initObj(this);
        if(this._fillables && this._fillables_ts === Game.time){
            return this._fillables;
        } else {
            if(!roomStructuresExpiration[this.name].fillables || !roomStructures[this.name].fillables || roomStructuresExpiration[this.name].fillables < Game.time) {
                roomStructuresExpiration[this.name].fillables = Game.time + getCacheExpiration();
                roomStructures[this.name].fillables = this.find(FIND_MY_STRUCTURES, {filter: struc => [STRUCTURE_EXTENSION, STRUCTURE_SPAWN].includes(struc.structureType)}).map(obj => obj.id);
            }
            if(roomStructures[this.name].fillables) {
                this._fillables_ts = Game.time;
                return this._fillables = roomStructures[this.name].fillables.map(Game.getObjectById);
            } else {
                this._fillables_ts = Game.time;
                return this.fillables = [];
            }
        }
    },
    enumerable: false,
    configurable: true,
});