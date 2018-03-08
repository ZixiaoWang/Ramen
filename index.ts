#!/usr/bin/env node

import * as program from 'commander';
import * as WebSocket from 'ws';
import * as colors from 'colors';

import { REPL } from './REPL';
import { SocketServer } from './SocketServer';

var PORT: number = 5000;
var SERVER_COUNT = 1;
const serverMap: Map<string, SocketServer> = new Map();
const connectionsMap: Map<SocketServer, Array<WebSocket>> = new Map();

function setRelpServer(){
    let replServer = new REPL();
    replServer
        .setVariable('SocketServer', SocketServer)
        .setVariable('WebSocket', WebSocket)
        .setCommand('create', (serverName?: string) => {
            let name = serverName ? serverName.split(' ')[0] : undefined;
            replServer.displayPrompt();
            setSocketServer(replServer, name);
        }, `[SOCKET] Quickly set up a server with default port ${ PORT }`)
        .console('>>> ');
}

function setSocketServer(replServer: REPL, name?: string){
    let socketServer = new SocketServer()
    socketServer
        .setOnCreateCallback(() => {
            let serverName = name || 'server' + (SERVER_COUNT++);
            serverMap.set(serverName, socketServer);

            replServer.log(`Server ${ colors.green(serverName) } is listening to port ${ colors.green(PORT.toString()) }`);
            PORT++;
        })
        .setOnConnectionCallback((websocket, request) => {
            if(connectionsMap.get(socketServer) === undefined) {
                connectionsMap.set(socketServer, []);
            }

            let connectionsOfCurrentServer = connectionsMap.get(socketServer) as Array<WebSocket>;
            let remoteAddress = request.connection.remoteAddress || 'undefined';

            connectionsOfCurrentServer.push(websocket);
            replServer.log(`New Connection with ${ colors.green(remoteAddress) } has been establshed.`);
        })
        .createServer(PORT);
}

program
    .command('console')
    .description('Open up a console with embeded SocketServer')
    .alias('c')
    .action(setRelpServer);

program
    .parse(process.argv);