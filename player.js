var Player = function (ws, miksago) {
    miksago = miksago || false;
    this.ws = ws;

    this.bounds.b = this.height / 2;
    this.bounds.t = 1 - this.height / 2;
    this.bounds.l = this.width;
    this.bounds.r = 1 - this.width;

    if (miksago) {
        this.ws.on('message', this.setSpeedMiksago.bind(this));
    } else {
        this.ws.on('message', this.setSpeed.bind(this));
    }

    this.ws.on('close', this.triggerDisconnect.bind(this));
    this.ws.send(JSON.stringify({helo:true}));
};
Player.constructor = Player;
Player.prototype = {
    width: 15 / 640,
    height: 75 / 480,
    ws: null,
    score: 0,
    x: 0,
    y: 0.5,
    speed: null,
    bounds: {
        b: 0,
        t: 1,
        r: 1,
        l: 0
    },
    disconnectHandler: null,
    color: 'rgb(255,255,255)',
    lastMessage: '',

    triggerDisconnect: function () {
        if (this.disconnectHandler !== null) {
            this.disconnectHandler(this);
        }
    },

    disconnect: function (str) {
        str = str || false;
        this.disconnectHandler = null;
        try {
            if (str) {
                var msg = { "message": str, "disconnect":true };
                this.ws.send(JSON.stringify(msg));
            }

            this.ws.close();
        } catch (e) {

        }
    },

    onDisconnect: function (cb) {
        this.disconnectHandler = cb;
    },

    loser: function () {
        this.disconnect("You lose!");
    },

    winner: function () {
        this.disconnect("You win!");
    },

    setColor: function (color) {
        var msg = {
            color: color,
            message: "Game starting"
            };
        this.color = color;
        this.ws.send(JSON.stringify(msg));
    },

    sendMessage: function (str) {
        if (str !== this.lastMessage) {
            var msg = { "message": str };
            this.ws.send(JSON.stringify(msg));
            this.lastMessage = str;
        }
    },

    setSpeed: function (speed) {
        try {
            this.speed = JSON.parse(speed);
            //console.log('set speed: ', this.speed);
        } catch (e) {
            console.log('player:' +e, speed);
            this.speed = null;
        }
    },

    setSpeedMiksago: function (speed) {
        try {
            var decoded = JSON.parse(speed);

            if ('utf8Data' in decoded) {
                this.setSpeed(speed.utf8Data);
            } else {
                this.setSpeed(speed);
            }
        } catch (e) {
            console.log('player: set speed: ' + speed);
        }
    },

    constrainBounds: function (v, min, max) {
        return Math.max(min, Math.min(max, v));
    },

    setX: function (x) {
        this.x = this.constrainBounds(x, this.bounds.l, this.bounds.r);
        return this;
    },

    setY: function (y) {
        this.y = this.constrainBounds(y, this.bounds.b, this.bounds.t);
        return this;
    },

    getPosition: function () {
        return { x: this.x, y: this.y };
    },

    update: function () {
        if (this.speed !== null) {
            this.setY(this.y + this.speed.y / 25);
        }
    },

    getBounds: function () {
        return {
                l: this.x + this.width / -2,
                t: this.y + this.height / -2,
                r: this.x + this.width / 2,
                b: this.y + this.height / 2
            };
    },

    hitTest: function (ob) {
        var p = ob.getBounds(),
            b = this.getBounds();

        // Top-left corner
        if (p.l >= b.l && p.l <= b.r && p.t >= b.t && p.t <= b.b) {
            return true;
        }
        // Top-right corner
        else if (p.r >= b.l && p.r <= b.r && p.t >= b.t && p.t <= b.b) {
            return true;
        }
        // Bottom-left corner
        else if (p.l >= b.l && p.l <= b.r && p.b >= b.t && p.b <= b.b) {
            return true;
        }
        // Bottom-right corner
        else if (p.r >= b.l && p.r <= b.r && p.b >= b.t && p.b <= b.b) {
            return true;
        }

        return false;
    }
};

module.exports.Player = Player;
