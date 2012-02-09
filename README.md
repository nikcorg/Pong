# Pong

This is a remake of Pong for an exhibition the company I work for, [Luxus](http://luxus.fi), organized.

The game itself runs server side, two handsets function as controllers and a browser as the projection. The state of the game is pushed to the projection on every tick. The controllers notify the server whenever speed changes. Messaging is done over a WebSocket connection.

The code isn't very beautiful and supporting several versions of the WebSocket required adding a hackish tier to the connection handling. But it worked well enough and got the job done.

There is no running instance of this game.

For module requirements, see https://gist.github.com/1148686

## Why?

The reason for the project was to teach me about node, canvas and websockets. And because it was fun.
