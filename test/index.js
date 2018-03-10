#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require("commander");
var WebSocket = require("ws");
var colors = require("colors");
var REPL_1 = require("./REPL");
var SocketServer_1 = require("./SocketServer");
var tablify_1 = require("./Utils/tablify");
var Ramen_1 = require("./Ramen");
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
function setRelpServer() {
    var replServer = new REPL_1.REPL();
    var ramen = new Ramen_1.Ramen();
    replServer
        .setVariable('SocketServer', SocketServer_1.SocketServer)
        .setVariable('WebSocket', WebSocket)
        .setVariable('REPL', replServer)
        .setVariable('RAMEN', ramen)
        .setCommand('create', function (serverName) {
        var name = serverName ? serverName.split(' ')[0] : undefined;
        replServer.displayPrompt();
        ramen.setSocketServer(name, replServer);
    }, "\n\t[SOCKET] Quickly set up a server with default port 500\n\te.g. " + colors.green('.create [name]'))
        .setCommand('list', function (type) {
        if (/^servers|s$/i.test(type.trim())) {
            ramen.listAllServers();
            replServer.displayPrompt();
        }
        else if (/^connections|clients|c$/i.test(type.trim())) {
            ramen.listAllConnections();
            replServer.displayPrompt();
        }
        else {
            console.log("\tPlease specify a list type");
            console.log("\t " + colors.green('servers     or s') + "\tList all existing servers");
            console.log("\t " + colors.green('connections or c') + "\tList all established connections");
            console.log("\t " + colors.green('clients     or c') + "\tThe same with " + colors.green('.list connections'));
            replServer.displayPrompt();
        }
    }, "\n\t[SOCKET] List all the Servers.\n\te.g. " + colors.green('.list servers') + " or " + colors.green('.list connections'))
        .console(colors.green('Ramen> '));
}
program
    .command('console')
    .description('Open up a console with embeded SocketServer')
    .action(setRelpServer);
program
    .command('list')
    .description('List all the established Servers')
    .action(function () {
    var ramen = new Ramen_1.Ramen();
    tablify_1.tablifyServers(ramen.serverMap, ramen.connectionsMap);
});
program
    .command('create [name]')
    .description("[SOCKET] Quickly set up a server with default port 5000. Example: " + colors.green('ramen create [name]'))
    .action(function (serverName) {
    var ramen = new Ramen_1.Ramen();
    ramen.setSocketServer(serverName, console);
});
program
    .parse(process.argv);
