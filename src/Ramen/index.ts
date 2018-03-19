import * as program from 'commander';
import * as WebSocket from 'ws';
import * as colors from 'colors';
import { crc32 } from 'js-crc';

import { REPL } from '../REPL/';
import { SocketServer } from '../SocketServer/';
import { tablifyServers, tablifyConnections } from '../Utils/tablify';

export class Ramen {

    private PORT: number = 5000;
    private SERVER_COUNT = 1;
    private outputer: any = console;
    private theFocusedServer: SocketServer | undefined = undefined;
    private theFocusedConnection: WebSocket | undefined = undefined;

    public focusedServer: Array<SocketServer> = [];
    public focusedConnections: Array<WebSocket> = [];
    public serverMap: Map<string, SocketServer> = new Map();
    public connectionsMap: Map<SocketServer, Map<string, WebSocket>> = new Map();

    constructor() {}

    setOutputer(outputer: REPL | any): Ramen{
        this.outputer = outputer;
        return this;
    }

    createSocketServer(name?: string){
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

                Object.defineProperty(websocket, 'hex', { value: hexString, writable: false, enumerable: false });
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

        for(let i=0; i<this.connectionsMap.size; i++) {
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

    focusOnConnection(hex: string): boolean{
        let theConnection = this.getConnectionByHex(hex);

        if(theConnection){
            this.theFocusedConnection = theConnection;
            return true;
        }

        return false;
    }

    unfocusConnection(): boolean {
        this.theFocusedConnection = undefined;
        return true;
    }

    getTheFocusedConnection(): WebSocket | undefined {
        return this.theFocusedConnection;
    }

    broadcast(data: any): void{
        let countNumber = 0;

        this.serverMap.forEach((server, name) => {
            server.broadcast(data, (totalNumber) => {
                countNumber += totalNumber;
            });
        });

        this.outputer.log(`Message has been sent to ${countNumber} clients`);
    }

    closeAll(): void{
        this.serverMap.forEach((server, key) => {
            server.close();
        });
    }

    reset(): void{
        this.closeAll();

        this.PORT = 5000;
        this.SERVER_COUNT = 1;

        this.focusedServer = [];
        this.focusedConnections = [];
        this.serverMap = new Map();
        this.connectionsMap = new Map();
    }
}