"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var colors = require("colors");
var js_crc_1 = require("js-crc");
var _1 = require("../SocketServer/");
var Tablify_1 = require("../Utils/Tablify");
var Ramen = /** @class */ (function () {
    function Ramen() {
        this.PORT = 5000;
        this.SERVER_COUNT = 1;
        this.DEFAULT_PROMPT = '> ';
        this.outputer = console;
        this.theFocusedServer = undefined;
        this.theFocusedConnection = undefined;
        this.theFocusedConnectionHex = '';
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
    Ramen.prototype.setServerCount = function (count) {
        this.SERVER_COUNT = count;
    };
    Ramen.prototype.setPortCount = function (count) {
        this.PORT = count;
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
        return socketServer;
    };
    Ramen.prototype.listAllServers = function () {
        Tablify_1.tablifyServers(this.serverMap, this.connectionsMap);
    };
    Ramen.prototype.listAllConnections = function () {
        Tablify_1.tablifyConnections(this.connectionsMap);
    };
    Ramen.prototype.getBasicInfo = function () {
        return {
            serverCount: this.SERVER_COUNT,
            portCount: this.PORT
        };
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
                if (this.theFocusedConnectionHex === hex) {
                    this.unfocusConnection();
                }
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
            this.theFocusedConnectionHex = hex;
            return theConnection;
        }
        return undefined;
    };
    Ramen.prototype.focusOnConnectionByIndex = function (index) {
        var hexList = [];
        this.connectionsMap.forEach(function (clientsOfEachServer) {
            clientsOfEachServer.forEach(function (client, hex) {
                hexList.push(hex);
            });
        });
        if (index > hexList.length) {
            return undefined;
        }
        var websocket = this.getConnectionByHex(hexList[index - 1]);
        if (websocket) {
            this.theFocusedConnection = websocket;
            this.theFocusedConnectionHex = hexList[index - 1];
            return { socket: websocket, hex: hexList[index - 1] };
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
        this.theFocusedConnectionHex = '';
        return true;
    };
    Ramen.prototype.getTheFocusedConnection = function () {
        return this.theFocusedConnection;
    };
    Ramen.prototype.getTheFocusedConnectionHex = function () {
        return this.theFocusedConnectionHex;
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
