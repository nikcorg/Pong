var Game = function () {

};
Game.create = function () {
    var g = new Game();
    Game.games.push(g);
};
Game.isRunning = function () {

};
Game.games = [];
Game.constructor = Game;
Game.prototype = {
    started: false,
    ball: false,
    player1: null,
    player2: null,
    player1score: 0,
    player2score: 0,

    start: function () {

    },

    tick: function() {

    },

    addPlayer: function (p) {
        if (this.player1 === null) {
            this.player1 = p;
        } else if (this.player2 === null) {

        }
    }
};