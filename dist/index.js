#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = require("ws");
var colors = require("colors");
var js_crc_1 = require("js-crc");
var REPL_1 = require("./src/REPL");
var SocketServer_1 = require("./src/SocketServer");
var Ramen_1 = require("./src/Ramen");
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//               佛祖保佑         永无BUG
//
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
(function setRelpServer() {
    var HELP = new Map([
        ["create", "\r\t\t" + colors.green('[SOCKET]') + " Quickly set up a server with default port 5000. \n\t\talias " + colors.green('.crt') + "\n\t\te.g. " + colors.green('.create [name]') + " or " + colors.green('.crt [name]')],
        ["list", "\r\t\t" + colors.green('[SOCKET]') + " List all the Servers.\n\t\talias " + colors.green('.ls') + "\n\t\te.g. " + colors.green('.list servers') + " or " + colors.green('.list connections') + " or " + colors.green('.ls c')],
        ["focus", "\r\t\t" + colors.green('[SOCKET]') + " Use a specific Connection by entering the hex string, or its index.\n\t\talias " + colors.green('.f') + "\n\t\te.g. " + colors.green('.focus 23de7a13') + " or " + colors.green('.f 1')],
        ["unfocus", "\r\t\t" + colors.green('[SOCKET]') + " Unfocus the connections. \n\t\talias " + colors.green('.uf <hex | index>') + "\n\t\t.e.g. " + colors.green('.unfocus')],
        ["send", "\r\t\t" + colors.green('[SOCKET]') + " Send message. This operation requires an focused connection, otherwise plase use \"" + colors.green('.broadcast <message>') + "\".\n\t\talias " + colors.green('.s') + "\n\t\te.g." + colors.green('.send "Hello World"') + " or " + colors.green('.s "Hello World"')],
        ["mirror", "\r\t\t" + colors.green('[SOCKET]') + " Response with whatever recieved from client. This operation requires an focused connection.\n\t\te.g. " + colors.green('.mirror')],
        ["broadcast", "\r\t\t" + colors.green('[SOCKET]') + " Broadcast the arguments (string) to all connected clients. \n\t\te.g. " + colors.green('.broadcast Hello World')],
        ["close", "\r\t\t" + colors.green('[SOCKET]') + " Close the a specific connection by hex, or use \"" + colors.green('--all') + " to close all the existing connections\". \n\t\talias " + colors.green('.cls') + "\n\t\te.g. " + colors.green('.close <hex> | --all') + " or " + colors.green('.cls --all')],
        ["shutdown", "\r\t\t" + colors.green('[SOCKET]') + " Shut down one or more specific server. \n\t\te.g. " + colors.green('.shutdown [...serverName]')],
        ["ping", "\r\t\t" + colors.green('[SOCKET]') + " Send a ping to the focused client. This operation requires an focused connection, otherwise plase use \"" + colors.green('.broadcast <message>') + "\".\n\t\te.g." + colors.green('.send "Hello World"')],
        ['mirrorServer', "\r\t\t" + colors.magenta('[HIDDEN]') + " Quickly setup a mirror server which reflect all the message recieved from client side"],
        ["--help", "\r\t\t" + colors.green('[SOCKET]') + " Showing all the costomized commands."]
    ]);
    var replServer = new REPL_1.REPL();
    var defaultPrompt = colors.green('Ramen> ');
    var ramen = new Ramen_1.Ramen()
        .setDefaultPrompt(defaultPrompt)
        .setOutputer(replServer);
    var create = function (serverName) {
        var name = serverName ? serverName.split(' ')[0] : undefined;
        ramen.createSocketServer(name);
        replServer.displayPrompt();
    };
    var list = function (type) {
        if (/^(servers|s)/i.test(type.trim())) {
            ramen.listAllServers();
            replServer.displayPrompt();
        }
        else if (/^(connections|clients|c)$/i.test(type.trim())) {
            ramen.listAllConnections();
            replServer.displayPrompt();
        }
        else {
            console.log("\tPlease specify a list type");
            console.log("\t " + colors.green('servers     or s') + "\tList all existing servers");
            console.log("\t " + colors.green('connections or c') + "\tList all established connections");
            console.log("\t " + colors.green('clients         ') + "\tAlias of " + colors.green('.list connections'));
            replServer.displayPrompt();
        }
    };
    var focus = function (hex) {
        if (/[0-9a-f]{8}/.test(hex) === false && /\d+/.test(hex) === false) {
            console.log('Please enter a number, or a valid hex string, it should be 8 characters');
            replServer.displayPrompt();
            return undefined;
        }
        var findByHex = function () {
            if (ramen.getConnectionByHex(hex) === undefined) {
                console.log("Cannot find the connection \"" + colors.green(hex) + "\". Please use \"" + colors.green('.list connections') + "\"");
                replServer.displayPrompt();
                return undefined;
            }
            else {
                var websocket = ramen.focusOnConnection(hex);
                if (websocket) {
                    replServer.setPrompt(hex + "> ");
                    replServer.log("\"" + colors.green(hex) + "\" is focused!");
                    websocket.onmessage = function (event) {
                        if (typeof event.data === 'string') {
                            replServer.log("[" + colors.yellow('RECIEVE') + "] " + event.data);
                        }
                        else {
                            replServer.log("[" + colors.yellow('RECIEVE') + "] " + event.data.toString());
                        }
                    };
                }
            }
        };
        var findByIndex = function () {
            var index = parseInt(hex);
            var socketPair = ramen.focusOnConnectionByIndex(index);
            if (socketPair === undefined) {
                console.log("Cannot find the connection");
                replServer.displayPrompt();
                return undefined;
            }
            else {
                var websocket = socketPair.socket;
                if (websocket) {
                    replServer.setPrompt(socketPair.hex + "> ");
                    replServer.log("\"" + colors.green(socketPair.hex) + "\" is focused!");
                    websocket.onmessage = function (event) {
                        replServer.log("[" + colors.yellow('RECIEVE') + "] " + event.data);
                    };
                }
            }
        };
        if (/[0-9a-f]{8}/.test(hex) === true) {
            findByHex();
        }
        else if (/\d+/.test(hex) === true) {
            findByIndex();
        }
    };
    var unfocus = function () {
        if (ramen.getTheFocusedConnection() === undefined) {
            console.log("Cannot find any connections being focused.");
            replServer.displayPrompt();
        }
        else {
            ramen.unfocusConnection();
            replServer.setPrompt(defaultPrompt);
            replServer.log('The connection has unfocused.');
        }
    };
    var send = function (arg) {
        if (ramen.getTheFocusedConnection() === undefined) {
            console.log("You have to focus on one connection to send messages. please use \"" + colors.green(".focus <hex>") + "\" or \"" + colors.green('.broadcast <message>') + "\" to broadcast to all connections");
            replServer.displayPrompt();
            return undefined;
        }
        var data = eval(arg);
        var theConnection = ramen.getTheFocusedConnection();
        theConnection.send(data);
        replServer.displayPrompt();
    };
    var mirror = function () {
        if (ramen.getTheFocusedConnection() === undefined) {
            console.log("You have to focus on one connection to send messages. please use \"" + colors.green(".focus <hex>") + "\" or \"" + colors.green('.broadcast <message>') + "\" to broadcast to all connections");
            replServer.displayPrompt();
            return undefined;
        }
        replServer.displayPrompt();
        var theConnection = ramen.getTheFocusedConnection();
        theConnection.onmessage = function (event) {
            var data = event.data;
            var type = 'string';
            switch (typeof event.data) {
                case 'string':
                    this.binaryType = 'string';
                    break;
                case 'object':
                    type = theConnection.binaryType;
                    break;
                default:
                    this.binaryType = 'string';
            }
            console.log("[" + colors.yellow('GET & SEND') + "] [TYPE: " + colors.cyan(type) + "] " + data.toString());
            this.send(data);
            replServer.displayPrompt();
        };
    };
    var ping = function () {
        if (ramen.getTheFocusedConnection() === undefined) {
            console.log("You have to focus on one connection to send messages. please use \"" + colors.green(".focus <hex>") + "\" or \"" + colors.green('.broadcast <message>') + "\" to broadcast to all connections");
            replServer.displayPrompt();
            return undefined;
        }
        var pingStart;
        var onPong = function () {
            var pingPong = Date.now() - pingStart;
            replServer.log("[" + colors.yellow('PONG') + "] in " + colors.green(pingPong.toString()) + " ms");
            theConnection.removeEventListener('pong', onPong);
        };
        var theConnection = ramen.getTheFocusedConnection();
        theConnection.addEventListener('pong', onPong);
        pingStart = Date.now();
        theConnection.ping();
        replServer.displayPrompt();
    };
    var broadcast = function (args) {
        ramen.broadcast(args);
    };
    var close = function (arg) {
        if (!arg) {
            if (ramen.getTheFocusedConnection() !== undefined) {
                var theFocusedConnectionHex = ramen.getTheFocusedConnectionHex();
                ramen.closeConnectionByHex(theFocusedConnectionHex);
                replServer.setPrompt(defaultPrompt);
                replServer.log("The connection \"" + colors.green(theFocusedConnectionHex) + "\" has unfocused.");
                return undefined;
            }
            console.log('Please enter a connection hex, or use --all to close all connections');
            replServer.displayPrompt();
            return undefined;
        }
        if (/--all/.test(arg) === true) {
            ramen.closeAll();
            replServer.displayPrompt();
            return true;
        }
        if (/[0-9a-f]{8}/.test(arg) === false) {
            console.log('Please enter a valid hex string, it should be 8 characters');
            replServer.displayPrompt();
            return undefined;
        }
        var hex = arg;
        if (ramen.getConnectionByHex(hex) === undefined) {
            console.log("Cannot find the connection \"" + colors.green(hex) + "\". Please use \"" + colors.green('.list connections') + "\"");
            replServer.displayPrompt();
            return undefined;
        }
        else {
            var websocket = ramen.getConnectionByHex(hex);
            if (websocket) {
                ramen.closeConnectionByHex(hex);
            }
            replServer.displayPrompt();
        }
    };
    var shutdown = function (arg) {
        var argArr;
        var argSet;
        if (arg === undefined || arg.length === 0) {
            replServer.log("Please enter a server name, or enter '" + colors.green('--all') + "' to shutdown all the servers");
            return null;
        }
        else {
            argArr = arg.split(' ');
            argSet = new Set(argArr);
            if (argSet.has('--all') === true) {
                ramen.serverMap.forEach(function (server, name) {
                    server.close();
                    ramen.serverMap.delete(name);
                    ramen.connectionsMap.delete(server);
                    console.log(colors.green(name) + " has closed.");
                });
                ramen.reset();
                replServer.displayPrompt();
            }
            else {
                argArr.forEach(function (serverName) {
                    if (ramen.serverMap.has(serverName)) {
                        var server = ramen.serverMap.get(serverName);
                        server.close();
                        ramen.serverMap.delete(serverName);
                        ramen.connectionsMap.delete(server);
                        console.log(colors.green(serverName) + " has closed.");
                    }
                    else {
                        console.log("[" + colors.yellow('WARN') + "] Cannot find server '" + colors.yellow(serverName) + "'");
                    }
                });
                replServer.displayPrompt();
            }
        }
    };
    var showHelp = function () {
        HELP.forEach(function (description, command) {
            console.log(command + description);
            console.log();
        });
        replServer.displayPrompt();
    };
    // Followings are customized commands
    // Basically you don't really need them, but
    // anyway, I just put them there.
    var mirrorServer = function (arg) {
        replServer.log(colors.yellow('NOTE: This is mirror mode, all the connection will automatically return whatever it recieves'));
        var serverCount = ramen.getBasicInfo().serverCount;
        var portCount = ramen.getBasicInfo().portCount;
        var serverName = 'Mirror' + serverCount;
        while (ramen.serverMap.has(serverName)) {
            serverName = 'Mirror' + ++serverCount;
        }
        var socketServer = new SocketServer_1.SocketServer();
        socketServer
            .setOnCreateCallback(function () {
            ramen.serverMap.set(serverName, socketServer);
            ramen.setPortCount(portCount);
            ramen.setServerCount(serverCount);
            replServer.log("Server " + colors.green(serverName) + " is listening to port " + colors.green(portCount.toString()));
        })
            .setOnConnectionCallback(function (websocket, request) {
            if (ramen.connectionsMap.get(socketServer) === undefined) {
                ramen.connectionsMap.set(socketServer, new Map());
            }
            var connection = ramen.connectionsMap.get(socketServer) || new Map();
            var remoteAddress = request.connection.remoteAddress || 'undefined';
            var hexString = js_crc_1.crc32((Date.now() + Math.random()).toString());
            Object.defineProperty(websocket, 'hex', { value: hexString, writable: false, enumerable: false });
            websocket.url = remoteAddress;
            connection.set(hexString, websocket);
            websocket.onmessage = function (event) {
                var data = event.data;
                var type = 'string';
                switch (typeof event.data) {
                    case 'string':
                        websocket.binaryType = 'string';
                        break;
                    case 'object':
                        type = websocket.binaryType;
                        break;
                    default:
                        websocket.binaryType = 'string';
                }
                console.log("[" + colors.yellow('GET & SEND') + "] [TYPE: " + colors.cyan(type) + "] " + data.toString());
                websocket.send(data);
                replServer.displayPrompt();
            };
            websocket.onclose = function (event) {
                connection.delete(hexString);
                replServer.setPrompt(defaultPrompt);
                replServer.log("[" + colors.yellow('CLOSED') + "] Connection has closed, the reason is \"" + event.reason + "\"");
            };
            replServer.log("New Client " + colors.green(remoteAddress) + " has connected with " + colors.green(serverName) + ".");
        })
            .createServer(portCount);
    };
    replServer
        .setVariable('SocketServer', SocketServer_1.SocketServer)
        .setVariable('WebSocket', WebSocket)
        .setVariable('REPL', replServer)
        .setVariable('Ramen', ramen)
        .setCommand('create', create, HELP.get('create'))
        .setCommand('crt', create, HELP.get('create'))
        .setCommand('list', list, HELP.get('list'))
        .setCommand('ls', list, HELP.get('list'))
        .setCommand('focus', focus, HELP.get('focus'))
        .setCommand('f', focus, HELP.get('focus'))
        .setCommand('close', close, HELP.get('close'))
        .setCommand('cls', close, HELP.get('close'))
        .setCommand('unfocus', unfocus, HELP.get('unfocus'))
        .setCommand('uf', unfocus, HELP.get('unfocus'))
        .setCommand('send', send, HELP.get('send'))
        .setCommand('s', send, HELP.get('send'))
        .setCommand('mirror', mirror, HELP.get('mirror'))
        .setCommand('ping', ping, HELP.get('ping'))
        .setCommand('broadcast', broadcast, HELP.get('broadcase'))
        .setCommand('mserver', mirrorServer, HELP.get('mirrorServer'))
        .setCommand('shutdown', shutdown, HELP.get('shutdown'))
        .setCommand('--help', showHelp, HELP.get('--help'))
        .setCommand('h', showHelp, HELP.get('--help'))
        .console(defaultPrompt);
})();
// program
//     .command('')
//     .description('Open up a console with embeded SocketServer')
//     .action(setRelpServer);
// program
//     .parse(process.argv); 
