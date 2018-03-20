"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var colors = require("colors");
var js_crc_1 = require("js-crc");
var _1 = require("../SocketServer/");
var tablify_1 = require("../Utils/tablify");
var Ramen = /** @class */ (function () {
    function Ramen() {
        this.PORT = 5000;
        this.SERVER_COUNT = 1;
        this.DEFAULT_PROMPT = '> ';
        this.outputer = console;
        this.theFocusedServer = undefined;
        this.theFocusedConnection = undefined;
        this.focusedServer = [];
        this.focusedConnections = [];
        this.serverMap = new Map();
        this.connectionsMap = new Map();
    }
    Ramen.prototype.setDefaultPrompt = function (prompt) {
        this.DEFAULT_PROMPT = prompt || this.DEFAULT_PROMPT;
        return this;
    };
    Ramen.prototype.setOutputer = function (outputer) {
        this.outputer = outputer;
        return this;
    };
    Ramen.prototype.createSocketServer = function (name) {
        var _this = this;
        var serverName = name || 'server' + (this.SERVER_COUNT++);
        if (this.serverMap.has(serverName) === true) {
            this.outputer.console("[" + colors.red('ERROR') + "] " + serverName + " has already existed!");
            return;
        }
        var socketServer = new _1.SocketServer();
        socketServer
            .setOnCreateCallback(function () {
            _this.serverMap.set(serverName, socketServer);
            _this.outputer.log("Server " + colors.green(serverName) + " is listening to port " + colors.green(_this.PORT.toString()));
            _this.PORT++;
        })
            .setOnConnectionCallback(function (websocket, request) {
            if (_this.connectionsMap.get(socketServer) === undefined) {
                _this.connectionsMap.set(socketServer, new Map());
            }
            var connection = _this.connectionsMap.get(socketServer) || new Map();
            var remoteAddress = request.connection.remoteAddress || 'undefined';
            var hexString = js_crc_1.crc32((Date.now() + Math.random()).toString());
            Object.defineProperty(websocket, 'hex', { value: hexString, writable: false, enumerable: false });
            websocket.url = remoteAddress;
            connection.set(hexString, websocket);
            websocket.onclose = function (event) {
                connection.delete(hexString);
                _this.outputer.setPrompt(_this.DEFAULT_PROMPT);
                _this.outputer.log("[" + colors.yellow('CLOSED') + "] Connection has closed, the reason is \"" + event.reason + "\"");
                _this.unfocusConnection();
            };
            _this.outputer.log("New Client " + colors.green(remoteAddress) + " has connected with " + colors.green(serverName) + ".");
        })
            .createServer(this.PORT);
    };
    Ramen.prototype.listAllServers = function () {
        tablify_1.tablifyServers(this.serverMap, this.connectionsMap);
    };
    Ramen.prototype.listAllConnections = function () {
        tablify_1.tablifyConnections(this.connectionsMap);
    };
    Ramen.prototype.getServerByName = function (name) {
        if (name === undefined) {
            this.outputer.console("[" + colors.red('ERROR') + "] Please enter a name");
            return undefined;
        }
        if (this.serverMap.has(name) === false) {
            this.outputer.console("[" + colors.yellow('WARN') + "] Cannot find server " + name);
            return undefined;
        }
        return this.serverMap.get(name);
    };
    Ramen.prototype.getConnectionByHex = function (hex) {
        if (/[0-9a-f]{8}/i.test(hex) !== true) {
            this.outputer.console("[" + colors.red('ERROR') + "] Please enter a valid Hex String. e.g. 234d4ac3");
            return undefined;
        }
        var connectionInterator = this.connectionsMap.values();
        for (var i = 0; i < this.connectionsMap.size; i++) {
            var hexMap = connectionInterator.next().value;
            if (hexMap.has(hex) === true) {
                return hexMap.get(hex);
                ;
            }
            else {
                continue;
            }
        }
        this.outputer.console("Cannot find connection " + hex);
        return undefined;
    };
    Ramen.prototype.closeConnectionByHex = function (hex) {
        if (/[0-9a-f]{8}/i.test(hex) !== true) {
            this.outputer.console("[" + colors.red('ERROR') + "] Please enter a valid Hex String. e.g. 234d4ac3");
            return false;
        }
        var connectionInterator = this.connectionsMap.values();
        for (var i = 0; i < this.connectionsMap.size; i++) {
            var hexMap = connectionInterator.next().value;
            if (hexMap.has(hex) === true) {
                var connection = hexMap.get(hex);
                connection.close();
                hexMap.delete(hex);
                return true;
            }
            else {
                continue;
            }
        }
        this.outputer.console("Cannot find connection " + hex);
        return true;
    };
    Ramen.prototype.focusOnConnection = function (hex) {
        var theConnection = this.getConnectionByHex(hex);
        if (theConnection) {
            this.theFocusedConnection = theConnection;
            return theConnection;
        }
        return undefined;
    };
    Ramen.prototype.unfocusConnection = function () {
        var theConnection = this.theFocusedConnection;
        if (theConnection) {
            theConnection.onmessage = function () { };
        }
        theConnection = null;
        this.theFocusedConnection = undefined;
        return true;
    };
    Ramen.prototype.getTheFocusedConnection = function () {
        return this.theFocusedConnection;
    };
    Ramen.prototype.broadcast = function (data) {
        var countNumber = 0;
        this.serverMap.forEach(function (server, name) {
            server.broadcast(data, function (totalNumber) {
                countNumber += totalNumber;
            });
        });
        this.outputer.log("Message has been sent to " + countNumber + " clients");
    };
    Ramen.prototype.closeAll = function () {
        this.serverMap.forEach(function (server, key) {
            server.close();
        });
    };
    Ramen.prototype.reset = function () {
        this.closeAll();
        this.PORT = 5000;
        this.SERVER_COUNT = 1;
        this.focusedServer = [];
        this.focusedConnections = [];
        this.serverMap = new Map();
        this.connectionsMap = new Map();
    };
    return Ramen;
}());
exports.Ramen = Ramen;