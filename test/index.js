#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require("commander");
var WebSocket = require("ws");
var colors = require("colors");
var REPL_1 = require("./REPL");
var SocketServer_1 = require("./SocketServer");
var PORT = 5000;
var SERVER_COUNT = 1;
var serverMap = new Map();
var connectionsMap = new Map();
function setRelpServer() {
    var replServer = new REPL_1.REPL();
    replServer
        .setVariable('SocketServer', SocketServer_1.SocketServer)
        .setVariable('WebSocket', WebSocket)
        .setCommand('create', function (serverName) {
        var name = serverName ? serverName.split(' ')[0] : undefined;
        replServer.displayPrompt();
        setSocketServer(replServer, name);
    }, "[SOCKET] Quickly set up a server with default port " + PORT)
        .console('>>> ');
}
function setSocketServer(replServer, name) {
    var socketServer = new SocketServer_1.SocketServer();
    socketServer
        .setOnCreateCallback(function () {
        var serverName = name || 'server' + (SERVER_COUNT++);
        serverMap.set(serverName, socketServer);
        replServer.log("Server " + colors.green(serverName) + " is listening to port " + colors.green(PORT.toString()));
        PORT++;
    })
        .setOnConnectionCallback(function (websocket, request) {
        if (connectionsMap.get(socketServer) === undefined) {
            connectionsMap.set(socketServer, []);
        }
        var connectionsOfCurrentServer = connectionsMap.get(socketServer);
        var remoteAddress = request.connection.remoteAddress || 'undefined';
        connectionsOfCurrentServer.push(websocket);
        replServer.log("New Connection with " + colors.green(remoteAddress) + " has been establshed.");
    })
        .createServer(PORT);
}
program
    .command('console')
    .description('Open up a console with embeded SocketServer')
    .alias('c')
    .action(setRelpServer);
program
    .parse(process.argv);
