var systemLogistics = {
    run: function() {
        //the amount we should store of each mineral
        const ENERGY_STORE = 50000;
        const STORE_BUFFER = 10000;
        const SELL_BUFFER = 5000;

        //iterate through every room with a terminal
        for (var room of MY_ROOMS_TERMINAL) {
            var roomObject = Game.rooms[room];
            var roomTerminal = roomObject.terminal;
            var roomSellOrders = _.filter(Game.market.orders, order => order.roomName == room && order.type == ORDER_SELL);
            var roomBuyOrders = _.filter(Game.market.orders, order => order.roomName == room && order.type == ORDER_BUY);

            //init memory
            if (!Memory.roomsPersistent[room].logistics) {
                Memory.roomsPersistent[room].logistics = {};
                Memory.roomsPersistent[room].logistics.primary = roomObject.find(FIND_MINERALS)[0].mineralType;
                Memory.roomsPersistent[room].logistics.needs = {};
                Memory.roomsPersistent[room].logistics.haves = {};
                Memory.roomsPersistent[room].logistics.selling = {};
                Memory.roomsPersistent[room].logistics.buying = {};
            }

            //loop through sell orders
            Memory.roomsPersistent[room].logistics.selling = {};
            for (order of roomSellOrders) {
                //set it back to zero, then increment it to cover cases where there are multiple orders
                if (!Memory.roomsPersistent[room].logistics.selling[order.resourceType]) {
                    //avoids it from being null
                    Memory.roomsPersistent[room].logistics.selling[order.resourceType] = 0;
                }
                Memory.roomsPersistent[room].logistics.selling[order.resourceType] += order.remainingAmount;
                if (order.remainingAmount == 0) {
                    Game.market.cancelOrder(order.id);
                }
            }

            //loop through buy orders
            Memory.roomsPersistent[room].logistics.buying = {};
            for (order of roomBuyOrders) {
                //set it back to zero, then increment it to cover cases where there are multiple orders
                if (!Memory.roomsPersistent[room].logistics.buying[order.resourceType]) {
                    //avoids it from being null
                    Memory.roomsPersistent[room].logistics.buying[order.resourceType] = 0;
                }
                Memory.roomsPersistent[room].logistics.buying[order.resourceType] += order.remainingAmount;
                if (order.remainingAmount == 0) {
                    Game.market.cancelOrder(order.id);
                }
            }
            
            //mineral demand and excess

            //loop through contents and append resources that are in excess

            for (var mineral of MINERALS) {
                //set the selling memory to zero if it doesn't exist
                if (!Object.keys(Memory.roomsPersistent[room].logistics.selling).includes(mineral)) {
                    Memory.roomsPersistent[room].logistics.selling[mineral] = 0;
                }
                //subtract the amount we are selling from the amount we have
                let amountStored = roomTerminal.store[mineral] - Memory.roomsPersistent[room].logistics.selling[mineral];
                if (amountStored > STORE_BUFFER) {
                    //store in memory how much extra we have in the terminal
                    Memory.roomsPersistent[room].logistics.haves[mineral] = amountStored - STORE_BUFFER;
                    Memory.roomsPersistent[room].logistics.needs[mineral] = 0;
                } else {
                    //store how much we need to get to our buffer
                    Memory.roomsPersistent[room].logistics.needs[mineral] = STORE_BUFFER - amountStored;
                    Memory.roomsPersistent[room].logistics.haves[mineral] = 0;
                }
            }

            //buying
            for (var need of Object.keys(Memory.roomsPersistent[room].logistics.needs)) {
                if (need == RESOURCE_ENERGY) continue; //skip energy for now
                if (Memory.roomsPersistent[room].logistics.needs[need] - (Memory.roomsPersistent[room].logistics.buying[need] || 0) > 7500) {
                    let mineralInfo = Game.market.getHistory(need);
                    let mineralInfoToday = mineralInfo[mineralInfo.length - 1];
                    let amountToBuy = Memory.roomsPersistent[room].logistics.needs[need];
                    let price = (mineralInfoToday["avgPrice"] * 1.15).toFixed(3);
                    let success = Game.market.createOrder({
                        type: ORDER_BUY,
                        resourceType: need,
                        price: price,
                        totalAmount: amountToBuy,
                        roomName: room   
                    });

                    if (success == 0) {
                        Memory.roomsPersistent[room].logistics.buying[need] += amountToBuy;
                    }
                    break;
                }
            }

            //Energy demand and excess
            //init memory object for selling energy TODO: actually sell energy?
            if (!Object.keys(Memory.roomsPersistent[room].logistics.selling).includes(RESOURCE_ENERGY)) {
                Memory.roomsPersistent[room].logistics.selling[RESOURCE_ENERGY] = 0;
            }
            //subtract the amount we are selling from the amount we have
            let amountStored = roomTerminal.store[RESOURCE_ENERGY] - Memory.roomsPersistent[room].logistics.selling[RESOURCE_ENERGY];
            if (amountStored > ENERGY_STORE) {
                //store in memory how much extra we have in the terminal
                Memory.roomsPersistent[room].logistics.haves[RESOURCE_ENERGY] = amountStored - ENERGY_STORE;
                Memory.roomsPersistent[room].logistics.needs[RESOURCE_ENERGY] = 0;
            } else {
                //store how much we need to get to our buffer
                Memory.roomsPersistent[room].logistics.needs[RESOURCE_ENERGY] = ENERGY_STORE - amountStored;
                Memory.roomsPersistent[room].logistics.haves[RESOURCE_ENERGY] = 0;
            }

            if (roomTerminal.cooldown > 0) {
                continue; //move to next terminal
            }

            //check if other terminals need resources this one has
            //TODO: change from brute iteration into placing orders in memory
            let sentResource = false;
            
            outerLoop: for (var otherRoom of MY_ROOMS_TERMINAL) {
                if (!Memory.roomsPersistent[otherRoom].logistics) continue;
                for (var extra of Object.keys(Memory.roomsPersistent[room].logistics.haves)) {
                    let extrasAmount = Memory.roomsPersistent[room].logistics.haves[extra];
                    let needAmount = Memory.roomsPersistent[otherRoom].logistics.needs[extra];
                    if (needAmount > 0 && extrasAmount > 0) {
                        let amountToSend = Math.min(extrasAmount, needAmount);
                        let success = roomTerminal.send(extra, amountToSend, otherRoom, 
                            "Routine supplies shipment of " + extra + " from " + room + " to " + otherRoom);
                        sentResource = true;
                        break outerLoop;
                    }
                }
            }

            //loop through haves and if there is a lot of extras, sell them
            if (!sentResource) {
                for (var extra of Object.keys(Memory.roomsPersistent[room].logistics.haves)) {
                    if (Memory.roomsPersistent[room].logistics.haves[extra] > SELL_BUFFER) {
                        let mineralInfo = Game.market.getHistory(extra);
                        let mineralInfoToday = mineralInfo[mineralInfo.length - 1];
                        let amountToSell = Memory.roomsPersistent[room].logistics.haves[extra];
                        let price = (mineralInfoToday["avgPrice"] * 0.85).toFixed(3);
                        let success = Game.market.createOrder({
                            type: ORDER_SELL,
                            resourceType: extra,
                            price: price,
                            totalAmount: amountToSell,
                            roomName: room   
                        });

                        // if the deal is successfully placed, add it to the selling memory
                        if (success == 0) {
                            Memory.roomsPersistent[room].logistics.selling[extra] += amountToSell;
                        }
                        break;
                    }
                }
            }
        }
    }
}

module.exports = systemLogistics;