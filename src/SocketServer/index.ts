import * as WebSocket from 'ws';
import * as colors          from 'colors';
import * as http            from 'http';

import { SocketServerOptions, Address } from './index.interface';

export class SocketServer {

    private DEFAULT_PORT: number = 5000;
    private $$server: WebSocket.Server;
    private $$port: number;

    public clients: Set<any | WebSocket>;

    constructor() {
        this.$$port = this.DEFAULT_PORT;
        this.clients = new Set();
    }

    createServer(port: number, options?: SocketServerOptions, callback?: Function) {
        this.$$port = port || 5000;
        let opt = { port: this.$$port };
        let server;

        if(options) {
            opt = Object.assign(opt, options);
        }

        this.$$server = new WebSocket.Server(opt, this.oncreate);
        this.$$server.on('connection', this.onconnection);
        this.$$server.on('listening', this.onlistening);
        this.$$server.on('headers', this.onheaders);
        this.$$server.on('error', this.onerror);

        this.clients = this.$$server.clients;
    }

    setOnCreateCallback(callback?: () => void) {
        this.oncreate = (callback && typeof callback === 'function') ? callback : this.oncreate;
        return this;
    }

    setOnConnectionCallback(callback?: (websocket: WebSocket, request: http.IncomingMessage) => any) {
        this.onconnection = (callback && typeof callback === 'function') ? callback : this.onconnection;
        return this;
    }    

    setOnHeadersCallback(callback?: (headers: Array<any>, request: http.IncomingMessage) => void) {
        this.onheaders = (callback && typeof callback === 'function') ? callback : this.onheaders;
        return this;
    }

    setOnListeningCallback(callback?: () => void) {
        this.onlistening = (callback && typeof callback === 'function') ? callback : this.onlistening;
        return this;
    }

    setOnErrorCallback(callback?: (error: Event) => void) {
        this.onerror = (callback && typeof callback === 'function') ? callback : this.onerror;
        return this;
    }

    address(): Address {
        if(this.$$server) {
            return this.$$server.address();
        } else {
            return { address: "", family: "", port: undefined };
        }
    }

    broadcast(data: any, callback: (totalNumber: number) => void) {
        let totalCount = 0;

        this.clients.forEach((client: WebSocket) => {
            if(client.readyState === WebSocket.OPEN){
                client.send(data);
                totalCount++;
            }
        });
        if(callback && typeof callback === 'function') {
            callback(totalCount);
        }
    }

    close(callback?: () => void): any{
        this.$$server.close(callback);
    }

    getNativeServer(): any {
        return this.$$server || undefined;
    }

    getPort(): number {
        return this.$$port || 5000;
    }

    getAllClients(): Set<any> {
        return this.$$server.clients || undefined;
    }

    private oncreate() {
        console.log( colors.green('New Socket Server is listenning to ' + this.$$port) );
    }

    private onconnection(websocket: WebSocket, request: http.IncomingMessage) {
        let remoteAddress = request.connection.remoteAddress || 'undefined';
        console.log(`New Connection with ${ colors.blue(remoteAddress) } has been establshed.`);
    }

    private onheaders(headers: Array<any>, request: http.IncomingMessage) {}

    private onlistening() {}

    private onerror(error: Event) {
        console.log(`[${ colors.red('ERROR') }] ${ error }`);
    }
}