"use strict";
/// <reference types="ws" />
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
        server = new WebSocket.Server(opt, this.oncreate);
        server.on('connection', this.onconnection);
        server.on('listening', this.onlistening);
        server.on('headers', this.onheaders);
        server.on('error', this.onerror);
        this.$$server = server;
        this.clients = server.clients;
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
    SocketServer.prototype.address = function () { };
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
