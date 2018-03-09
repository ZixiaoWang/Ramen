#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require("commander");
var WebSocket = require("ws");
var colors = require("colors");
var REPL_1 = require("./REPL");
var SocketServer_1 = require("./SocketServer");
var tablify_1 = require("./Utils/tablify");
var PORT = 5000;
var SERVER_COUNT = 1;
var serverMap = new Map();
var connectionsMap = new Map();
function setRelpServer() {
    var replServer = new REPL_1.REPL();
    replServer
        .setVariable('SocketServer', SocketServer_1.SocketServer)
        .setVariable('WebSocket', WebSocket)
        .setVariable('REPL', replServer)
        .setCommand('create', function (serverName) {
        var name = serverName ? serverName.split(' ')[0] : undefined;
        replServer.displayPrompt();
        setSocketServer(name, replServer);
    }, "\n\t[SOCKET] Quickly set up a server with default port " + PORT + "\n\te.g. " + colors.green('.create [name]'))
        .setCommand('list', function () {
        listAllServers();
        replServer.displayPrompt();
    }, "\n\t[SOCKET] List all the Servers.\n\te.g. " + colors.green('.list'))
        .console(colors.green('Ramen> '));
}
function setSocketServer(name, replServer) {
    var socketServer = new SocketServer_1.SocketServer();
    var serverName = name || 'server' + (SERVER_COUNT++);
    var outputer = replServer || console;
    socketServer
        .setOnCreateCallback(function () {
        serverMap.set(serverName, socketServer);
        outputer.log("Server " + colors.green(serverName) + " is listening to port " + colors.green(PORT.toString()));
        PORT++;
    })
        .setOnConnectionCallback(function (websocket, request) {
        if (connectionsMap.get(socketServer) === undefined) {
            connectionsMap.set(socketServer, []);
        }
        var connectionsOfCurrentServer = connectionsMap.get(socketServer);
        var remoteAddress = request.connection.remoteAddress || 'undefined';
        connectionsOfCurrentServer.push(websocket);
        outputer.log("New Client " + colors.green(remoteAddress) + " has connected with " + colors.green(serverName) + ".");
    })
        .createServer(PORT);
}
function listAllServers() {
    tablify_1.tablifyServers(serverMap, connectionsMap);
}
program
    .command('console')
    .description('Open up a console with embeded SocketServer')
    .action(setRelpServer);
program
    .command('list')
    .description('List all the established Servers')
    .action(function () {
    tablify_1.tablifyServers(serverMap, connectionsMap);
});
program
    .command('create [name]')
    .description("[SOCKET] Quickly set up a server with default port " + PORT + ". Example: " + colors.green('ramen create [name]'))
    .action(function (serverName) {
    setSocketServer(serverName, console);
});
program
    .parse(process.argv);
