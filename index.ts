#!/usr/bin/env node

import * as program from 'commander';
import * as WebSocket from 'ws';
import * as colors from 'colors';

import { REPL } from './REPL';
import { SocketServer } from './SocketServer';
import { tablifyServers } from './Utils/tablify';

var PORT: number = 5000;
var SERVER_COUNT = 1;
var focusedConnection: WebSocket;
const serverMap: Map<string, SocketServer> = new Map();
const connectionsMap: Map<SocketServer, Array<WebSocket>> = new Map();

function setSocketServer(name?: string, replServer?: REPL | any){
    let socketServer = new SocketServer();
    let serverName = name || 'server' + (SERVER_COUNT++);
    let outputer = replServer || console;

    socketServer
        .setOnCreateCallback(() => {
            serverMap.set(serverName, socketServer);

            outputer.log(`Server ${ colors.green(serverName) } is listening to port ${ colors.green(PORT.toString()) }`);
            PORT++;
        })
        .setOnConnectionCallback((websocket, request) => {
            if(connectionsMap.get(socketServer) === undefined) {
                connectionsMap.set(socketServer, []);
            }

            let connectionsOfCurrentServer = connectionsMap.get(socketServer) as Array<WebSocket>;
            let remoteAddress = request.connection.remoteAddress || 'undefined';

            connectionsOfCurrentServer.push(websocket);
            outputer.log(`New Client ${ colors.green(remoteAddress) } has connected with ${ colors.green(serverName) }.`);
        })
        .createServer(PORT);
}

function listAllServers() {
    tablifyServers(serverMap, connectionsMap);
}


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

function setRelpServer(){
    let replServer = new REPL();
    replServer
        .setVariable('SocketServer', SocketServer)
        .setVariable('WebSocket', WebSocket)
        .setVariable('REPL', replServer)
        .setCommand(
            'create', 
            (serverName?: string) => {
                let name = serverName ? serverName.split(' ')[0] : undefined;
                replServer.displayPrompt();
                setSocketServer(name, replServer);
            }, 
            `\n\t[SOCKET] Quickly set up a server with default port ${ PORT }\n\te.g. ${ colors.green('.create [name]') }`
        )
        .setCommand(
            'list',
            () => {
                listAllServers();
                replServer.displayPrompt();
            },
            `\n\t[SOCKET] List all the Servers.\n\te.g. ${ colors.green('.list') }`
        )
        .console( colors.green('Ramen> ') );
}

program
    .command('console')
    .description('Open up a console with embeded SocketServer')
    .action(setRelpServer);

program
    .command('list')
    .description('List all the established Servers')
    .action(() => {
        tablifyServers(serverMap, connectionsMap);
    });

program
    .command('create [name]')
    .description(`[SOCKET] Quickly set up a server with default port ${ PORT }. Example: ${ colors.green('ramen create [name]') }`)
    .action((serverName) => {
        setSocketServer(serverName, console);
    })

program
    .parse(process.argv);