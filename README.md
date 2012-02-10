# Pong

This is a remake of Pong for an exhibition the company I work for, [Luxus](http://luxus.fi), organized.

## Why?

The reason for the project was to teach me about node, canvas and websockets. And it was really fun!

## How it works

The game itself runs server side, two handsets function as controllers and a browser as the projection. The state of the game is pushed to the projection on every tick. The controllers notify the server whenever speed changes. Messaging is done over a WebSocket connection.

## Notes

The code isn't very beautiful, lacks comments, and supporting several versions of the WebSocket required adding a hackish tier to the connection handling. But it worked well enough and got the job done.

There is no running instance of this game.

## To install:

* git clone git@github.com:nikcorg/Pong.git pong
* cd pong
* npm install
* node miksago-ws-server.js

## To play:

* open http://server.com/public/client.html in a browser
* open http://server.com/public/controller.html in a mobile phone browser
    * NB! By default you need two players, to play alone you'll need to modify the code to create two players on an incoming connection.