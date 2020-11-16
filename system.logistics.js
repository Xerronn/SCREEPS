var systemLogistics = {
    run: function() {
        //iterate through every room with a terminal
        for (var room of MY_ROOMS_TERMINAL) {
            var roomObject = Game.rooms[room];
            var roomTerminal = roomObject.terminal;

            //TODO everything
            //Im thinking I maintain a certain inventory of things in each terminal, then request when blow and sell
            //when above idkkkkkk
        }
    }
}

module.exports = systemLogistics;