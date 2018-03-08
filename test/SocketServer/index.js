"use strict";
/// <reference types="ws" />
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = require("ws");
var colors = require("colors");
var SocketServer = /** @class */ (function () {
    function SocketServer() {
    }
    SocketServer.prototype.createServer = function (port, options, callback) {
        this.$$port = port || 5000;
        var opt = { port: this.$$port };
        var server;
        if (options) {
            opt = Object.assign(opt, options);
        }
        server = new WebSocket.Server(opt, this.oncreate);
        server.on('connection', this.onconnection);
        server.on('headers', this.onheaders);
        server.on('error', this.onerror);
        server.on('listening', this.onlistening);
        this.$$server = server;
        this.clients = server.clients;
    };
    SocketServer.prototype.oncreate = function () {
        console.log(colors.green('New Socket Server has been created'));
    };
    SocketServer.prototype.onconnection = function (websocket, request) {
        var remoteAddress = request.connection.remoteAddress || 'undefined';
        console.log("New Connection with " + colors.blue(remoteAddress) + " has been establshed.");
    };
    SocketServer.prototype.onheaders = function (headers, request) { };
    SocketServer.prototype.onerror = function (error) { };
    SocketServer.prototype.onlistening = function () { };
    SocketServer.prototype.address = function () { };
    SocketServer.prototype.getNativeServer = function () {
        return this.$$server;
    };
    SocketServer.prototype.getPort = function () {
        return this.$$port || 5000;
    };
    SocketServer.prototype.getAllClients = function () {
        return this.$$server.clients;
    };
    return SocketServer;
}());
exports.SocketServer = SocketServer;
