var systemLogistics = {
    run: function() {
        //the amount we should store of each mineral
        const BUFFER = 5000;

        //iterate through every room with a terminal
        for (var room of MY_ROOMS_TERMINAL) {
            var roomObject = Game.rooms[room];
            var roomTerminal = roomObject.terminal;

            //init memory
            if (!Memory.roomsPersistent[room].logistics) {
                Memory.roomsPersistent[room].logistics = {};
                Memory.roomsPersistent[room].logistics.primary = roomObject.find(FIND_MINERALS)[0].mineralType;
                Memory.roomsPersistent[room].logistics.needs = {};
                Memory.roomsPersistent[room].logistics.haves = {};
            }
            
            //loop through contents and append resources that are in excess
            for (var mineral of MINERALS) {
                amountStored = roomTerminal.store[mineral];
                if (amountStored > BUFFER) {
                    //store in memory how much extra we have in the terminal
                    Memory.roomsPersistent[room].logistics.haves[mineral] = amountStored - BUFFER;
                    Memory.roomsPersistent[room].logistics.needs[mineral] = 0;
                } else {
                    //store how much we need to get to our buffer
                    Memory.roomsPersistent[room].logistics.needs[mineral] = BUFFER - amountStored;
                    Memory.roomsPersistent[room].logistics.haves[mineral] = 0;
                }
            }

            //check if other terminals need resources this one has
            outerLoop:
            for (var otherRoom of MY_ROOMS_TERMINAL) {
                for (var extra of Object.keys(Memory.roomsPersistent[room].logistics.haves)) {
                    let extrasAmount = Memory.roomsPersistent[room].logistics.haves[extra];
                    let needAmount = Memory.roomsPersistent[otherRoom].logistics.needs[extra];
                    if (needAmount > 0) {
                        let amountToSend = Math.min(extrasAmount, needAmount);
                        roomTerminal.send(extra, amountToSend, otherRoom, 
                            "Routine supplies shipment of " + extra + " from " + room + " to " + otherRoom);
                        break outerLoop;
                    }
                }
            }

            //loop through haves and if there is a lot of extras, sell them
            for (var extra of Object.keys(Memory.roomsPersistent[room].logistics.haves)) {
                if (roomTerminal.store[extra] > BUFFER * 2) {
                    let mineralInfo = Game.market.getHistory(extra);
                    let mineralInfoToday = mineralInfo[mineralInfo.length - 1];
                    let amountToSell = roomTerminal.store[extra] - (BUFFER * 2);
                    let price = (mineralInfoToday["avgPrice"] * 0.9).toFixed(3);
                    let activeOrders = Game.market.orders;

                    // let success = Game.market.createOrder({
                    //     type: ORDER_SELL,
                    //     resourceType: extra,
                    //     price: price,
                    //     totalAmount: amountToSell,
                    //     roomName: room   
                    // });
                    console.log(JSON.stringify(activeOrders));
                    break;
                }
            }
        }
    }
}

module.exports = systemLogistics;