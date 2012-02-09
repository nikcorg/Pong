// This code is fallback for https://github.com/Worlize/WebSocket-Node

// add the broadcast to  https://gist.github.com/1219165
//    2011.11.30 tato@http://www.facebook.com/javascripting

// Example of how to fallback to alternative websocket library for old protocol clients
// see https://gist.github.com/1148686

var http = require('http'),
    WebSocketRequest = require('websocket').request,
    WebSocketServer = require('websocket').server,
    ws = require('websocket-server');

//Copy to WebSocketRequest

WebSocketRequest.prototype.connections = [];
WebSocketRequest.prototype.handleRequestAccepted = WebSocketServer.prototype.handleRequestAccepted;
WebSocketRequest.prototype.handleConnectionClose = WebSocketServer.prototype.handleConnectionClose;
WebSocketRequest.prototype.broadcastUTF = WebSocketServer.prototype.broadcastUTF;

var httpServer = http.createServer(function(request, response) {
    console.log((new Date()) + " Received request for " + request.url);
    response.writeHead(404);
    response.end();
});
httpServer.listen(8080, function() {
    console.log((new Date()) + " Server is listening on port 8080");
});

// node-websocket-server

var miksagoConnection = require('./node_modules/websocket-server/lib/ws/connection');

var miksagoServer = ws.createServer();
miksagoServer.server = httpServer;

miksagoServer.addListener('connection', function(connection) {
    // Add remoteAddress property
    connection.remoteAddress = connection._socket.remoteAddress;

    // We want to use "sendUTF" regardless of the server implementation
    connection.sendUTF = connection.send;
    handleConnection(connection);
});


// WebSocket-Node config

var wsServerConfig =  {
    // All options *except* 'httpServer' are required when bypassing
    // WebSocketServer.
    maxReceivedFrameSize: 0x10000,
    maxReceivedMessageSize: 0x100000,
    fragmentOutgoingMessages: true,
    fragmentationThreshold: 0x4000,
    keepalive: true,
    keepaliveInterval: 20000,
    assembleFragments: true,
    // autoAcceptConnections is not applicable when bypassing WebSocketServer
    // autoAcceptConnections: false,
    disableNagleAlgorithm: true,
    closeTimeout: 5000
};


// Handle the upgrade event ourselves instead of using WebSocketServer

var wsRequest={};
httpServer.on('upgrade', function(req, socket, head) {

    if (typeof req.headers['sec-websocket-version'] !== 'undefined') {

        // WebSocket hybi-08/-09/-10 connection (WebSocket-Node)
        wsRequest = new WebSocketRequest(socket, req, wsServerConfig);
        try {
            wsRequest.readHandshake();
            var wsConnection = wsRequest.accept(wsRequest.requestedProtocols[0], wsRequest.origin);
            wsRequest.handleRequestAccepted(wsConnection);
            handleConnection(wsConnection);
        }
        catch(e) {
            console.log("WebSocket Request unsupported by WebSocket-Node: " + e.toString());
            return;
        }

    } else {

        // WebSocket hixie-75/-76/hybi-00 connection (node-websocket-server)
        if (req.method === 'GET' &&
            (req.headers.upgrade && req.headers.connection) &&
            req.headers.upgrade.toLowerCase() === 'websocket' &&
            req.headers.connection.toLowerCase() === 'upgrade') {
            new miksagoConnection(miksagoServer.manager, miksagoServer.options, req, socket, head);
        }

    }

});


// A common connection handler

function handleConnection(connection) {
    console.log((new Date()) + " Connection accepted.");
    //connection.sendUTF(" Connection accepted.");

    connection.once('message', function(wsMessage) {
        var message = wsMessage, sock;

        // WebSocket-Node adds a "type", node-websocket-server does not
        if (typeof wsMessage.type !== 'undefined') {
            if (wsMessage.type !== 'utf8') {
                return;
            }
            message = wsMessage.utf8Data;
        }
        console.log((new Date()) + " Received Message: " + message);

        //connection.sendUTF(message);
        /*
        if(miksagoServer.broadcast)miksagoServer.broadcast('broadcastUTF0:'+message);
        if(wsRequest.broadcastUTF)wsRequest.broadcastUTF('broadcastUTF1:'+message);
        */
        if(miksagoServer.broadcast) {
            //connection.send = miksagoServer.broadcast;
        }
        if(wsRequest.broadcastUTF) {
            //connection.send = wsRequest.broadcastUTF;
        }

        firstConnect(message, connection);
    });

    connection.addListener('close', function() {
        console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
    });
}

var Projection = require('./projection.js').Projection,
    Ball = require('./ball.js').Ball,
    Player = require('./player.js').Player;

console.log('server started');

function firstConnect(message, sock) {
    try {
        var data = JSON.parse(message);

        if ('type' in data) {
            switch (data.type) {
                case 'projection':
                    console.log((new Date()) + ' new projection');
                    var setup = {
                            paddle: {
                                width: Player.prototype.width,
                                height: Player.prototype.height
                            },
                            ball: {
                                width: Ball.prototype.width,
                                height: Ball.prototype.height
                            }
                        };

                    var projection = new Projection(sock, setup);
                    projectionConnect(projection);
                    break;

                case 'player':
                    console.log((new Date()) + ' new player');
                    var p = new Player(sock, true);
                    p.onDisconnect(disconnectWhileQueueing);
                    playerConnect(p);
                    break;
            }
        } else {
            console.log((new Date()) + 'invalid init message: ' + message);
            throw new Error('Invalid init message');
        }
    } catch (e) {
        console.dir(e);
        sock.close();
    }
}

var tickDelay = 1000 / 60,
    projections = [],
    players = [],
    playerOne = null,
    playerTwo = null,
    ball = new Ball(),
    p1score = 0,
    p2score = 0,
    p1bg = 'rgb(255,17,247)',
    p2bg = 'rgb(255,158,6)';

var Game = {
        state: 0,
        messages: [],
        update: {},
        bannerTicks: 0,
        restore: 0,
        states: {
            IDLE: 0,
            RUNNING: 1,
            PAUSED: 2,
            BANNER: 3
        },
        setState: function (state) {
            Game.previousState = Game.state;
            Game.state = state;
        },

        restorePreviousState: function () {
            Game.state = Game.previousState;
        }
    };

Game.setState(Game.states.IDLE);

function updateQueuePositions() {
    if (players.length > 0) {
        for (var i = 0, l = players.length; i < l; i++) {
            var pl = players[i];

            pl.sendMessage("You are queuing.\nYou are #" + (i + 1));
        }
    }
}

function disconnectWhileQueueing(p) {
    console.log((new Date()) + ' disconnected from queue');

    for (var i = 0, l = players.length; i < l; i++) {
        if (players[i] === p) {
            console.log((new Date()) + ' removed player from queue');
            players.splice(i, 1);
            break;
        }
    }

    updateQueuePositions();
}

function startGame() {
    if (Game.state === Game.states.IDLE && players.length >= 2) {
        playerOne = players.shift();
        playerTwo = players.shift();

        updateQueuePositions();
    } else {
        return;
    }

    console.log((new Date()) + ' starting game');

    /**
     * Start new game
     */

    p1score = 0;
    p2score = 0;

    playerOne.setX(0).setY(0.5);
    playerTwo.setX(1).setY(0.5);
    playerOne.setColor(p1bg);
    playerTwo.setColor(p2bg);

    playerOne.onDisconnect(playerDisconnect);
    playerTwo.onDisconnect(playerDisconnect);

    Game.update.left = playerOne.getPosition();
    Game.update.right = playerTwo.getPosition();
    Game.update.ball = ball.reset().getPosition();
    Game.update.leftC = p1bg;
    Game.update.rightC = p2bg;

    Game.messages.push({message: ['Game', 'start'], delay: 2000, wall: true});
    Game.messages.push({message: ['First', 'to 10', 'wins'], delay: 2000, wall: true});
    Game.messages.push({message: ['Get', 'ready'], delay: 1500, wall: true});
    Game.messages.push({message: '3', delay: 1000, wall: true});
    Game.messages.push({message: '2', delay: 1000, wall: true});
    Game.messages.push({message: '1', delay: 1000, wall: true});

    Game.setState(Game.states.RUNNING);
}

function playerWins(p) {
    console.log((new Date()) + ' player wins');

    Game.setState(Game.states.IDLE);

    Game.messages.push({
            message: ['Game', 'over'],
            delay: 1500
            });

    if (p === playerOne) {
        Game.messages.push({
            message: ['Left', 'player', 'wins!'],
            delay: 1500
            });

        playerOne.winner();
        playerTwo.loser();
    } else {
        Game.messages.push({
            message: ['Right', 'player', 'wins!'],
            delay: 1500
            });

        playerTwo.winner();
        playerOne.loser();
    }

    startGame();
}

function projectionConnect(p) {
    Projection.add(p);

    if (Game.state === Game.states.IDLE) {
        switch (players.length) {
            case 1:
                Game.messages.push({
                    message: ["One", "player", "needed"],
                    delay: 0
                    });

            break;
            case 0:
                Game.messages.push({
                    message: ["No", "players"],
                    delay: 0
                    });
            break;
        }
    }

    Game.update.leftC = p1bg;
    Game.update.rightC = p2bg;
}

function playerConnect(p) {
    players.push(p);
    p.sendMessage("You are queuing.\nYou are #" + (players.length));

    if (Game.state === Game.states.IDLE) {
        console.log((new Date()) + ' player connect when idle');
        switch (players.length) {
            case 1:
                Game.messages.push({
                    message: ["One", "player", "needed"],
                    delay: 0
                    });
            break;
            case 0:
                Game.messages.push({
                    message: ["No", "players"],
                    delay: 0
                    });
            break;
        }
    }

    startGame();
}

function playerDisconnect(p) {
    console.log((new Date()) + ' server: player disconnected in game');

    if (p === playerOne) {
        Game.messages.push({
            message: ["Pl one", "went", "away"],
            delay: 2000
            });

        playerWins(playerTwo);
    } else {
        Game.messages.push({
            message: ["Pl two", "went", "away"],
            delay: 2000
            });

        playerWins(playerOne);
    }
}

function updateElements() {
    var update, ydiff = 0;

    /**
     * Update ball position and check for paddle hit
     */
    if (Game.state === Game.states.RUNNING) {
        ball.update();

        if (ball.direction < 0 && playerOne.hitTest(ball)) {
            ydiff = (playerOne.getPosition().y - ball.getPosition().y) / playerOne.height;
            ball.x = playerOne.getPosition().x + playerOne.width / 2 + ball.width / 2;

            ball.setAngle(90 * ydiff * ball.direction);
            ball.direction *= -1;
            ball.accelerate();
        } else if (ball.direction > 0 && playerTwo.hitTest(ball)) {
            ydiff = (playerTwo.getPosition().y - ball.getPosition().y) / playerTwo.height;
            ball.x = playerTwo.getPosition().x + playerTwo.width / -2 + ball.width / -2;

            ball.setAngle(90 * ydiff * ball.direction);
            ball.direction *= -1;
            ball.accelerate();
        }

        Game.update.message = p1score + '-' + p2score;
        Game.update.ball = ball.getPosition();
        Game.update.fadeOut = true;

        /**
         * Check for goal
         */
        if (ball.x <= 0 || ball.x >= 1) {
            if (ball.direction < 0) {
                p2score++;
            } else {
                p1score++;
            }

            ball.reset();

            Game.update.ball = ball.getPosition();
            Game.messages.push({
                    message: "Goal!",
                    delay: 1500
                    });

            /**
             * Check if either player reached 10 goals
             */
            if (p1score >= 10) {
                playerWins(playerOne);
            } else if (p2score >= 10) {
                playerWins(playerTwo);
            } else {
                Game.messages.push({
                    message: ["Get", "ready"],
                    delay: 1500
                    });
            }
        }
    }

    if (Game.state !== Game.states.IDLE) {
        /**
         * Update player positions so paddles can move even when not running
         */
        playerOne.update();
        playerTwo.update();

        Game.update.left = playerOne.getPosition();
        Game.update.right = playerTwo.getPosition();
    }
}

function sendUpdate() {
    Projection.wall(Game.update);

    if ('message' in Game.update && (Game.update.message instanceof Array || Game.update.message !== '')) {
        if (playerOne !== null) {
            playerOne.sendMessage(Game.update.message);
        }

        if (playerTwo !== null) {
            playerTwo.sendMessage(Game.update.message);
        }
    }

    Game.update = {};
}

function tick() {
    /**
     * Switch to banner mode when there are queued messages
     */
    if (Game.state !== Game.states.BANNER && Game.messages.length > 0) {
        var message = Game.messages.shift();

        Game.bannerTicks = message.delay / tickDelay;
        Game.update.message = message.message;

        Game.setState(Game.states.BANNER);
    }

    /**
     * The state machine
     */
    switch (Game.state) {
        case Game.states.IDLE:
            if (players.length > 0) {
                Game.update.message = ["Got", '' + players.length, "players"];
            } else {
                Game.update.message = ["No", "players"];
            }
            break;

        case Game.states.BANNER:
            Game.bannerTicks--;

            if (Game.bannerTicks <= 0) {
                Game.bannerTicks = 0;
                Game.restorePreviousState();
            }
            // Fall through on purpose

        case Game.states.RUNNING:
            updateElements();
            break;
    }

    sendUpdate();
    setTimeout(tick, tickDelay);
}

setTimeout(tick, tickDelay);