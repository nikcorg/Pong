var Projection = function (ws, setup) {
    this.ws = ws;
    this.sendUpdate(JSON.stringify(setup));

    this.ws.on('close', this.disconnect.bind(this));
    this.ws.send(JSON.stringify({helo:true}));
};
Projection.constructor = Projection;
Projection.prototype = {
    ws: null,
    onDisconnectCallback: null,
    sendUpdate: function (msg) {
        if (this.ws !== null) {
            this.ws.send(msg);
        }
    },
    onDisconnect: function (cb) {
        this.onDisconnectCallback = cb;
    },
    disconnect: function () {
        this.ws = null;
        if (this.onDisconnectCallback !== null) {
            this.onDisconnectCallback(this);
        }
    }
};
Projection.projections = [];
Projection.add = function (projection) {
    projection.onDisconnect(Projection.projectionDisconnect);
    Projection.projections.push(projection);
};
Projection.projectionDisconnect = function (projection) {
    for (var i = 0, l = Projection.projections.length; i < l; i++) {
        if (Projection.projections[i] === projection) {
            console.log((new Date()) + ' removed projection');
            Projection.projections.splice(i, 1);
            break;
        }
    }
};
Projection.wall = function (message) {
    var msgJson = JSON.stringify(message);

    for (var i = 0, l = Projection.projections.length; i < l; ++i) {
        Projection.projections[i].sendUpdate(msgJson);
    }
};

module.exports.Projection = Projection;