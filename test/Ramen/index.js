"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var colors = require("colors");
var js_crc_1 = require("js-crc");
var SocketServer_1 = require("../SocketServer");
var tablify_1 = require("../Utils/tablify");
var Ramen = /** @class */ (function () {
    function Ramen() {
        this.PORT = 5000;
        this.SERVER_COUNT = 1;
        this.focusedConnections = [];
        this.serverMap = new Map();
        this.connectionsMap = new Map();
    }
    Ramen.prototype.setSocketServer = function (name, replServer) {
        var _this = this;
        var serverName = name || 'server' + (this.SERVER_COUNT++);
        var outputer = replServer || console;
        if (this.serverMap.has(serverName) === true) {
            outputer.console("[" + colors.red('ERROR') + "] " + serverName + " has already existed!");
            return;
        }
        var socketServer = new SocketServer_1.SocketServer();
        socketServer
            .setOnCreateCallback(function () {
            _this.serverMap.set(serverName, socketServer);
            outputer.log("Server " + colors.green(serverName) + " is listening to port " + colors.green(_this.PORT.toString()));
            _this.PORT++;
        })
            .setOnConnectionCallback(function (websocket, request) {
            if (_this.connectionsMap.get(socketServer) === undefined) {
                _this.connectionsMap.set(socketServer, new Map());
            }
            var connection = _this.connectionsMap.get(socketServer) || new Map();
            var remoteAddress = request.connection.remoteAddress || 'undefined';
            var hexString = js_crc_1.crc32((Date.now() + Math.random()).toString());
            websocket.url = remoteAddress;
            connection.set(hexString, websocket);
            outputer.log("New Client " + colors.green(remoteAddress) + " has connected with " + colors.green(serverName) + ".");
        })
            .createServer(this.PORT);
    };
    Ramen.prototype.listAllServers = function () {
        tablify_1.tablifyServers(this.serverMap, this.connectionsMap);
    };
    Ramen.prototype.listAllConnections = function () {
        tablify_1.tablifyConnections(this.connectionsMap);
    };
    return Ramen;
}());
exports.Ramen = Ramen;
