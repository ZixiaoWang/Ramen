import * as WebSocketModule from 'ws';
import * as colors          from 'colors';
import * as http            from 'http';

import { SocketServerOptions } from './SocketServerOption';

interface Address {
    port: number,
    family: any,
    address: string
}

export class SocketServer {

    private $$server: WebSocketModule.Server;
    private $$port: number;

    public clients: Set<any | WebSocket>;

    constructor() {}

    createServer(port: number, options?: SocketServerOptions, callback?: Function) {
        this.$$port = port || 5000;
        let opt = { port: this.$$port };
        let server;

        if(options) {
            opt = Object.assign(opt, options);
        }

        server = new WebSocketModule.Server(opt, this.oncreate);
        server.on('connection', this.onconnection);
        server.on('headers', this.onheaders);
        server.on('error', this.onerror);
        server.on('listening', this.onlistening);

        this.$$server = server;
        this.clients = server.clients;
    }

    oncreate() {
        console.log( colors.green('New Socket Server has been created') );
    }

    onconnection(websocket: WebSocket, request: http.IncomingMessage) {
        console.log(`New Connection with ${ colors.blue(request.connection.remoteAddress) } has been establshed.`);
    }

    onheaders(headers: Array<any>, request: http.IncomingMessage) {}

    onerror(error: Error) {}

    onlistening() {}

    address(): any {}

    getNativeServer(): any {
        return this.$$server;
    }

    getPort(): number {
        return this.$$port || 5000;
    }

    getAllClients(): Set<any> {
        return this.$$server.clients;
    }
}