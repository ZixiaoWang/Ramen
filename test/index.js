#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var REPL_1 = require("./REPL");
var program = require("commander");
program
    .command('console')
    .alias('c')
    .action(function () {
    var replServer = new REPL_1.REPL();
    replServer
        .setCommand('df', function () {
        console.log('It is working!');
        replServer.displayPrompt();
    })
        .console('>>> ');
});
program
    .parse(process.argv);
