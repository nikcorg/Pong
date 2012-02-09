var Ball = function () {

};
Ball.constructor = Ball;
Ball.prototype = {
    width: 15 / 640,
    height: 15 / 480,
    x: 0.5,
    y: 0.5,
    speed: 0.005,
    angle: 32,
    accel: 0.0005,
    direction: 1,

    reset: function () {
        this.x = Ball.prototype.x;
        this.y = Ball.prototype.y;
        this.speed = Ball.prototype.speed;
        this.angle = (Math.random() - 0.5) * 90;

        return this;
    },

    getPosition: function () {
        return { x: this.x, y: this.y };
    },

    getBounds: function () {
        return {
                l: this.x + this.width / -2,
                t: this.y + this.height / -2,
                r: this.x + this.width / 2,
                b: this.y + this.height / 2
            };
    },

    accelerate: function () {
        this.speed += this.accel;
    },

    setAngle: function (angle) {
        this.angle = angle < 0 ? 360 + angle : angle;
    },

    update: function () {
        var a = (this.angle / 180) * Math.PI, delta = this.speed * this.direction;

        this.x = this.x + delta * Math.cos(a);
        this.y = this.y + delta * Math.sin(a);

        this.x = Math.max(0, Math.min(1, this.x));
        this.y = Math.max(0, Math.min(1, this.y));

        if (this.y >= 1 || this.y <= 0) {
            this.setAngle(0 - this.angle);
        }
    }
};

module.exports.Ball = Ball;