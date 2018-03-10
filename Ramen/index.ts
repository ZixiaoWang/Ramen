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
    private outputer: any = console;

    public focusedServer: Array<SocketServer> = [];
    public focusedConnections: Array<WebSocket> = [];
    public serverMap: Map<string, SocketServer> = new Map();
    public connectionsMap: Map<SocketServer, Map<string, WebSocket>> = new Map();

    constructor() {}

    setOutputer(outputer: REPL | any): Ramen{
        this.outputer = outputer;
        return this;
    }

    setSocketServer(name?: string){
        let serverName = name || 'server' + (this.SERVER_COUNT++);

        if(this.serverMap.has(serverName) === true) {
            this.outputer.console(`[${ colors.red('ERROR') }] ${ serverName } has already existed!`);
            return ;    
        }

        let socketServer = new SocketServer();

        socketServer
            .setOnCreateCallback(() => {
                this.serverMap.set(serverName, socketServer);

                this.outputer.log(`Server ${ colors.green(serverName) } is listening to port ${ colors.green(this.PORT.toString()) }`);
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
                this.outputer.log(`New Client ${ colors.green(remoteAddress) } has connected with ${ colors.green(serverName) }.`);
            })
            .createServer(this.PORT);
    }

    listAllServers() {
        tablifyServers(this.serverMap, this.connectionsMap);
    }

    listAllConnections() {
        tablifyConnections(this.connectionsMap);
    }

    getServerByName(name: string): undefined | SocketServer{

        if(name === undefined) {
            this.outputer.console(`[${ colors.red('ERROR') }] Please enter a name`);
            return undefined;
        }

        if(this.serverMap.has(name) === false) {
            this.outputer.console(`[${ colors.yellow('WARN') }] Cannot find server ${ name }`);
            return undefined;
        }

        return this.serverMap.get(name);
        
    }

    getConnectionByHex(hex: string): undefined | WebSocket {
        
        if(/[0-9a-f]{8}/i.test(hex) !== true){
            this.outputer.console(`[${ colors.red('ERROR') }] Please enter a valid Hex String. e.g. 234d4ac3`);
            return undefined;
        }

        let connectionInterator = this.connectionsMap.values();

        for(let i=0; i<this.connectionsMap.size;) {
            let hexMap = connectionInterator.next().value;
            if(hexMap.has(hex) === true) {
                return hexMap.get(hex);;
            }else{
                continue;
            }
        }

        this.outputer.console(`Cannot find connection ${ hex }`);
        return undefined;
    }
}