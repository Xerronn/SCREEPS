const systemRouter = {
    run: function () {
        if (!Creep.prototype._moveTo) {
            Creep.prototype._moveTo = Creep.prototype.moveTo;

            Creep.prototype.moveTo = function(destination, options = {}) {
                if (this.inRangeTo(destination, 4)) {
                    options.maxOps = 100;
                    this.travelTo(destination, options); 
                } else {
                    options.range = 4;
                    this.travelTo(destination, options);
                }
            }
        }

    }
}
module.exports = systemRouter;