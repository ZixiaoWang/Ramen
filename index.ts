#!/usr/bin/env node

/// <reference path="index.d.ts" />

import * as program from 'commander';
import * as WebSocket from 'ws';
import * as colors from 'colors';
import { crc32 } from 'js-crc';

import { REPL } from './REPL';
import { SocketServer } from './SocketServer';
import { tablifyServers, tablifyConnections } from './Utils/Tablify';
import { Ramen } from './Ramen';


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

(function setRelpServer(){
    let replServer = new REPL();
    let ramen = new Ramen().setOutputer(replServer);

    replServer

        .setVariable('SocketServer', SocketServer)
        .setVariable('WebSocket', WebSocket)
        .setVariable('REPL', replServer)
        .setVariable('Ramen', ramen)

        .setCommand(
            'create', 
            (serverName?: string) => {
                let name = serverName ? serverName.split(' ')[0] : undefined;
                replServer.displayPrompt();
                ramen
                    .createSocketServer(name);
            }, 
            `\n\t[SOCKET] Quickly set up a server with default port 500\n\te.g. ${ colors.green('.create [name]') }`
        )
        .setCommand(
            'list',
            (type: string) => {
                if( /^(servers|s)/i.test(type.trim()) ) {
                    ramen.listAllServers();
                    replServer.displayPrompt();
                }else if( /^(connections|clients|c)$/i.test(type.trim()) ) {
                    ramen.listAllConnections();
                    replServer.displayPrompt();
                }else {
                    console.log(`\tPlease specify a list type`);
                    console.log(`\t ${colors.green('servers     or s') }\tList all existing servers`)
                    console.log(`\t ${colors.green('connections or c') }\tList all established connections`)
                    console.log(`\t ${colors.green('clients         ') }\tAlias of ${ colors.green('.list connections') }`)
                    replServer.displayPrompt();
                }
            },
            `\n\t[SOCKET] List all the Servers.\n\te.g. ${ colors.green('.list servers') } or ${ colors.green('.list connections') }`
        )
        .setCommand(
            'focus',
            () => {},
            '\n\t[SOCKET] Focus on one '
        )

        .console( colors.green('Ramen> ') );
})();


// program
//     .command('')
//     .description('Open up a console with embeded SocketServer')
//     .action(setRelpServer);

// program
//     .parse(process.argv);