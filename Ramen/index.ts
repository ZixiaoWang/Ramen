import * as program from 'commander';
import * as WebSocket from 'ws';
import * as colors from 'colors';
import { crc32 } from 'js-crc';

import { REPL } from '../REPL';
import { SocketServer } from '../SocketServer';
import { tablifyServers, tablifyConnections } from '../Utils/tablify';

export class Ramen {

    private PORT: number = 5000;
    private SERVER_COUNT = 1;
    public focusedConnections: Array<WebSocket> = [];
    public serverMap: Map<string, SocketServer> = new Map();
    public connectionsMap: Map<SocketServer, Map<string, WebSocket>> = new Map();

    constructor() {}

    setSocketServer(name?: string, replServer?: REPL | any){
        let serverName = name || 'server' + (this.SERVER_COUNT++);
        let outputer = replServer || console;

        if(this.serverMap.has(serverName) === true) {
            outputer.console(`[${ colors.red('ERROR') }] ${ serverName } has already existed!`);
            return ;    
        }

        let socketServer = new SocketServer();

        socketServer
            .setOnCreateCallback(() => {
                this.serverMap.set(serverName, socketServer);

                outputer.log(`Server ${ colors.green(serverName) } is listening to port ${ colors.green(this.PORT.toString()) }`);
                this.PORT++;
            })
            .setOnConnectionCallback((websocket, request) => {
                if(this.connectionsMap.get(socketServer) === undefined) {
                    this.connectionsMap.set(socketServer, new Map());
                }

                let connection: Map<string, WebSocket> = this.connectionsMap.get(socketServer) || new Map();
                let remoteAddress = request.connection.remoteAddress || 'undefined';
                let hexString = crc32( (Date.now() + Math.random()).toString() );

                websocket.url = remoteAddress;
                connection.set(hexString, websocket);
                outputer.log(`New Client ${ colors.green(remoteAddress) } has connected with ${ colors.green(serverName) }.`);
            })
            .createServer(this.PORT);
    }

    listAllServers() {
        tablifyServers(this.serverMap, this.connectionsMap);
    }

    listAllConnections() {
        tablifyConnections(this.connectionsMap);
    }
}