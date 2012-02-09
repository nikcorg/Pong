function extend(ob, props) {
    for (var p in props) {
        ob[p] = props[p];
    }
}

function log(str) {
    return;
    var ta = document.getElementsByTagName('textarea')[0];
    ta.value = str + "\n" + ta.value.substr(0, 1024);
}

var setupFps = function(){
    var lastTime = new Date();
    var hits = 0;
    var fps = "Waiting";
    var hit = function(){
        hits++;
        var nowTime = new Date();
        if (nowTime.getTime() - lastTime.getTime() > 1000){
            var dt = nowTime.getTime() - lastTime.getTime();
            fps = '' + Math.round(hits * 1000 / dt);
            hits = 0;
            lastTime = nowTime;
        }

        return fps;
    };
    return hit;
};

var Sprite = function () {

};
Sprite.constructor = Sprite;
Sprite.prototype = {
    color: 'rgb(255, 255, 255)',
    x: 0,
    y: 0,
    alpha: 1,

    setAlpha: function (a) {
        this.alpha = Math.max(0, Math.min(1, a));
        return this;
    },

    setX: function (x) {
        this.x = Math.floor(x);
        return this;
    },

    setY: function (y) {
        this.y = Math.floor(y);
        return this;
    },

    setPos: function (point) {
        this.setX(point.x);
        this.setY(point.y);
        return this;
    },

    draw: function (ctx) {
        ctx.globalAlpha = this.alpha;
    },

    hide: function () {
        this.setAlpha(0);
    },

    show: function () {
        this.setAlpha(1);
    }
};

var Box = function () {

};
Box.constructor = Box;
Box.prototype = new Sprite();
extend(Box.prototype, {
    height: 0,
    width: 0,

    setWidth: function (w) {
        this.width = w;
        return this;
    },

    setHeight: function (h) {
        this.height = h;
        return this;
    },

    draw: function (ctx) {
        Sprite.prototype.draw.call(this, ctx);

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
});

var Paddle = function (point) {
    this.setPos(point);
};
Paddle.constructor = Paddle;
Paddle.prototype = new Box();

extend(Paddle.prototype, {
        color: 'rgb(255, 255, 255)',
        height: 75,
        width: 15,
        x: 0,
        y: 0,

        setX: function (x) {
            return Box.prototype.setX.call(this, Math.floor(x + this.width / -2));
        },
        setY: function (y) {
            return Box.prototype.setY.call(this, Math.floor(y + this.height / -2));
        },

        setColor: function (c) {
            this.color = c;
        }
});

var Ball = function (point) {
    this.setPos(point);
};
Ball.constructor = Ball;
Ball.prototype = new Box();
extend(Ball.prototype, {
    parent: Box.prototype,
    color: 'rgb(255, 0, 0)',
    height: 15,
    width: 15,
    x: 0,
    y: 0,

    setX: function (x) {
        return this.parent.setX.call(this, Math.floor(x + this.width / -2));
    },
    setY: function (y) {
        return this.parent.setY.call(this, Math.floor(y + this.height / -2));
    }
});

var Message = function (sourceImageUrl, text) {
    text = text || null;

    this.setSource(sourceImageUrl);
    this.setText(text);
};
Message.constructor = Message;
Message.prototype = new Sprite();
extend(Message.prototype, {
    alphabet: '0,1,2,3,4,5,6,7,8,9,-,!,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,å,ä,ö, '.split(','),
    sourceImage: null,
    sourceImageGridWidth: 10,
    sourceImageCharWidth: 80,
    charSpacing: 10,
    sourceReady: false,
    text: "",
    textWidth: 0,
    textHeight: 0,
    parent: Sprite.prototype,
    listeners: {},

    emit: function (event) {
        if (event in this.listeners) {
            var params = Array.prototype.slice.call(arguments, 1);

            for (var i = 0, l = this.listeners[event].length; i < l; ++i) {
                this.listeners[event][i].apply(null, params);
            }
        }
    },

    addEventListener: function (event, listener) {
        if (! (event in this.listeners)) {
            this.listeners[event] = [];
        }

        this.listeners[event].push(listener);
    },

    removeEventListener: function (event, listener) {
        if (event in this.listeners) {
            for (var i = 0, l = this.listeners[event].length; i < l; ++i) {
                if (this.listeners[event][i] == listener) {
                    this.listeners[event].splice(i, 1);
                }
            }
        }
    },

    setSource: function (url) {
        this.sourceReady = false;
        this.sourceImage = new Image();
        this.sourceImage.src = url;

        this.sourceImage.addEventListener('load',
                function () {
                    this.sourceReady = true;
                    this.emit('ready');
                }.bind(this), false
            );
    },

    setText: function (text) {
        var oldText = this.text;

        if (text !== null && text instanceof Array) {
            this.text = text.join("\n").toLowerCase();
            this.textWidth = 0;
            this.textHeight = (this.sourceImageCharWidth + this.charSpacing) * text.length;
            for (var i = 0, l = text.length; i < l; i++) {
                this.textWidth = Math.max(this.textWidth, text[i].length);
            }

            this.textWidth = this.textWidth * (this.sourceImageCharWidth + this.charSpacing);
        } else if (text !== null) {
            this.text = text.toLowerCase();
            this.textWidth = text.length * (this.sourceImageCharWidth + this.charSpacing);
            this.textHeight = this.sourceImageCharWidth;
        }

        if (oldText != text) {
            this.setAlpha(1);
        }

        log('text=' + text);
        log('tw=' + this.textWidth);
        log('th=' + this.textHeight);
    },

    fadeOut: function () {
        this.setAlpha(Math.max(0.1, this.alpha - 0.03));
    },

    draw: function (ctx) {
        if (! this.sourceReady || this.textWidth === 0) {
            return false;
        }

        Sprite.prototype.draw.call(this, ctx);

        var dx = Math.max(0, Math.floor(this.x + this.textWidth / -2)),
            dy = Math.max(0, Math.floor(this.y + this.textHeight / -2));

        for (var i = 0, l = this.text.length; i < l; i++) {
            var sx = 0, sy = 0, chr = this.text.substr(i, 1), ind = this.alphabet.indexOf(chr);

            if (ind !== -1) {
                sx = ind * this.sourceImageCharWidth;

                while (sx > (this.sourceImageGridWidth - 1) * this.sourceImageCharWidth) {
                    sx -= this.sourceImageGridWidth * this.sourceImageCharWidth;
                    sy += this.sourceImageCharWidth;
                }
                ctx.drawImage(this.sourceImage,
                    sx, sy, // source X,Y
                    this.sourceImageCharWidth, this.sourceImageCharWidth, // source WxH
                    dx, dy, // dest X,Y
                    this.sourceImageCharWidth, this.sourceImageCharWidth // dest WxH
                    );

                dx += this.sourceImageCharWidth + this.charSpacing;
            } else if (ind === -1 && chr === "\n") {
                dy += this.sourceImageCharWidth + this.charSpacing;
                dx = Math.floor(this.x + this.textWidth / -2);
            }
        }
    }
});

var Scene = function (cnv) {
    if (cnv === null || cnv === undefined) {
        throw new Error('Canvas must be passed to constructor');
    }

    this.cnv = cnv;
    this.ctx = cnv.getContext('2d');

    this.fpsc = setupFps();

    this.objects = [];
    this.render();
};
Scene.constructor = Scene;
Scene.prototype = {
    bg: 'rgb(0, 0, 0)',
    cnv: null,
    ctx: null,
    objects: null,
    fpsc: null,

    clear: function () {
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = this.bg;
        this.ctx.fillRect(0, 0, this.cnv.width, this.cnv.height);
    },

    removeObjects: function () {
        for (var ob in this.objects) {
            this.objects[ob] = null;
        }
        this.objects = [];
    },

    addObject: function (object) {
        this.objects.push(object);
        return this;
    },

    render: function () {
        this.clear();

        var fps = this.fpsc();

        this.ctx.font="10pt Helvetica";
        this.ctx.textAlign="left";
        this.ctx.textBaseline="middle";
        this.ctx.fillStyle="rgb(50,50,50)";
        this.ctx.fillText('FPS ' + fps, 10, 10);

        for (var ob in this.objects) {
            this.objects[ob].draw(this.ctx);
        }

        window.requestAnimFrame(this.render.bind(this));
    }

};

var cnv, scene;

function init() {
    cnv = document.getElementsByTagName('canvas')[0];
    scene = new Scene(cnv);

    var paddleLeft,
        paddleRight,
        ball,
        text = new Message('digits.png');

    text.setPos({x: 0.5 * cnv.width, y: 0.5 * cnv.height});
    text.addEventListener('ready', function () {
        connect();
        });
    scene.addObject(text);

    var ws,
        host = window.location.host;

    function setup(e) {
        try {
            var data = JSON.parse(e.data);

            Paddle.prototype.width = Math.floor(data.paddle.width * cnv.width);
            Paddle.prototype.height = Math.floor(data.paddle.height * cnv.height);
            Ball.prototype.width = Math.floor(data.ball.width * cnv.width);
            Ball.prototype.height = Math.floor(data.ball.height * cnv.height);

            paddleLeft = new Paddle({x: 0 + Paddle.prototype.width, y: Math.round(cnv.height * 0.5)});
            paddleRight = new Paddle({x: cnv.width - Paddle.prototype.width, y: Math.round(cnv.height * 0.5)});
            ball = new Ball({x: cnv.width / 2, y: cnv.height / 2 });

            scene.removeObjects();
            scene.addObject(text).addObject(paddleRight).addObject(paddleLeft).addObject(ball);

            this.removeEventListener('message', setup, false);
            this.addEventListener('message', update, false);
        } catch (err) {
            console.log('parse error', err, e.data);
        }
    }

    function update(e) {
        try {
            var data = JSON.parse(e.data);

            if ('left' in data) {
                paddleLeft.setX(cnv.width * data.left.x).setY(cnv.height * data.left.y);
            }

            if ('right' in data) {
                paddleRight.setX(cnv.width * data.right.x).setY(cnv.height * data.right.y);
            }

            if ('ball' in data) {
                ball.setX(cnv.width * data.ball.x).setY(cnv.height * data.ball.y);
            }

            if ('message' in data) {
                text.setText(data.message);
            }

            if ('leftC' in data) {
                paddleLeft.setColor(data.leftC);
            }

            if ('rightC' in data) {
                paddleRight.setColor(data.rightC);
            }

            if ('fadeOut' in data) {
                text.fadeOut();
            }

            log(e.data);
        } catch (err) {
            console.log('parse error', err, e.data);
        }
    }

    function connect() {
        if ('WebSocket' in window) {
            ws = new WebSocket('ws://' + host + ':8080');
        } else if ('MozWebSocket' in window) {
            ws = new MozWebSocket('ws://' + host + ':8080');
        }

        ws.onopen = onconnect;
        ws.onclose = onclose;
        ws.onerror = onerror;

        text.setText(['connec-', 'ting to', 'server']);
    }

    function onconnect() {
        this.send(JSON.stringify({type: "projection"}));
        this.addEventListener('message', setup, false);
        text.setText(['connected']);
    }

    function onclose() {
        text.setText(['server', 'went', 'away']);

        setTimeout(connect, 1000);
    }

    function onerror() {
        connect();
    }
}

window.addEventListener('load', init, false);
