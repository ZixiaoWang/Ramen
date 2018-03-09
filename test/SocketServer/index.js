"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = require("ws");
var colors = require("colors");
var SocketServer = /** @class */ (function () {
    function SocketServer() {
        this.DEFAULT_PORT = 5000;
        this.$$port = this.DEFAULT_PORT;
        this.clients = new Set();
    }
    SocketServer.prototype.createServer = function (port, options, callback) {
        this.$$port = port || 5000;
        var opt = { port: this.$$port };
        var server;
        if (options) {
            opt = Object.assign(opt, options);
        }
        this.$$server = new WebSocket.Server(opt, this.oncreate);
        this.$$server.on('connection', this.onconnection);
        this.$$server.on('listening', this.onlistening);
        this.$$server.on('headers', this.onheaders);
        this.$$server.on('error', this.onerror);
        this.clients = this.$$server.clients;
    };
    SocketServer.prototype.setOnCreateCallback = function (callback) {
        this.oncreate = (callback && typeof callback === 'function') ? callback : this.oncreate;
        return this;
    };
    SocketServer.prototype.setOnConnectionCallback = function (callback) {
        this.onconnection = (callback && typeof callback === 'function') ? callback : this.onconnection;
        return this;
    };
    SocketServer.prototype.setOnHeadersCallback = function (callback) {
        this.onheaders = (callback && typeof callback === 'function') ? callback : this.onheaders;
        return this;
    };
    SocketServer.prototype.setOnListeningCallback = function (callback) {
        this.onlistening = (callback && typeof callback === 'function') ? callback : this.onlistening;
        return this;
    };
    SocketServer.prototype.setOnErrorCallback = function (callback) {
        this.onerror = (callback && typeof callback === 'function') ? callback : this.onerror;
        return this;
    };
    SocketServer.prototype.address = function () {
        if (this.$$server) {
            return this.$$server.address();
        }
        else {
            return { address: "", family: "", port: undefined };
        }
    };
    SocketServer.prototype.close = function (callback) {
        this.$$server.close(callback);
    };
    SocketServer.prototype.getNativeServer = function () {
        return this.$$server || undefined;
    };
    SocketServer.prototype.getPort = function () {
        return this.$$port || 5000;
    };
    SocketServer.prototype.getAllClients = function () {
        return this.$$server.clients || undefined;
    };
    SocketServer.prototype.oncreate = function () {
        console.log(colors.green('New Socket Server is listenning to ' + this.$$port));
    };
    SocketServer.prototype.onconnection = function (websocket, request) {
        var remoteAddress = request.connection.remoteAddress || 'undefined';
        console.log("New Connection with " + colors.blue(remoteAddress) + " has been establshed.");
    };
    SocketServer.prototype.onheaders = function (headers, request) { };
    SocketServer.prototype.onlistening = function () { };
    SocketServer.prototype.onerror = function (error) {
        console.log("[" + colors.red('ERROR') + "] " + error);
    };
    return SocketServer;
}());
exports.SocketServer = SocketServer;
