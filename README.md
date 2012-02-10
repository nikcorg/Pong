# Pong

This is a remake of Pong for an exhibition the company I work for, [Luxus](http://luxus.fi), organized.

## Why?

The reason for the project was to teach me about node, canvas and websockets. And it was really fun!

## How it works

The game itself runs server side, two handsets function as controllers and a browser (or several) as the projection. The state of the game is pushed to the projection(s) on every tick. The controllers notify the server whenever speed changes. Messaging is done over a WebSocket connection.

## Notes

The code isn't very beautiful, lacks comments, and supporting several versions of the WebSocket required adding a hackish tier to the connection handling. But it worked well enough and got the job done. Bugs will be present.

There is no running instance of this game, and likely never will be. This was a one-off concept demo which was tons of fun, but will not be maintained or further developed/cleaned up. (Unless you fork it ;-)

## To install:

* git clone git@github.com:nikcorg/Pong.git pong
* cd pong
* npm install
* node miksago-ws-server.js

## To play:

* open http://server.com/public/client.html in a browser
* open http://server.com/public/controller.html in a mobile phone browser
    * NB! By default you need two players, to play alone in `miksago-ws-server.js:131` set [`playAlone = true`](https://github.com/nikcorg/Pong/blob/master/miksago-ws-server.js#L131).

## License

[Creative Commons BY-NC-SA](http://creativecommons.org/licenses/by-nc-sa/3.0/)