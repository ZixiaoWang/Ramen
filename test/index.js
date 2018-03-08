#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require("commander");
var REPL_1 = require("./REPL");
var SocketServer_1 = require("./SocketServer");
program
    .command('console')
    .alias('c')
    .action(function () {
    var replServer = new REPL_1.REPL();
    replServer
        .setVariable('SocketServer', SocketServer_1.SocketServer)
        .console('>>> ');
});
program
    .parse(process.argv);
