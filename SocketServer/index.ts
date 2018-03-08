/// <reference types="ws" />

import * as WebSocket from 'ws';
import * as colors          from 'colors';
import * as http            from 'http';

import { SocketServerOptions } from './index.interface';

interface Address {
    port: number,
    family: any,
    address: string
}

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

        server = new WebSocket.Server(opt, this.oncreate);
        server.on('connection', this.onconnection);
        server.on('listening', this.onlistening);
        server.on('headers', this.onheaders);
        server.on('error', this.onerror);

        this.$$server = server;
        this.clients = server.clients;
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

    setOnErrorCallback(callback?: (error: Error) => void) {
        this.onerror = (callback && typeof callback === 'function') ? callback : this.onerror;
        return this;
    }

    address(): any {}

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

    private onerror(error: Error) {
        console.log(`[${ colors.red('ERROR') }] ${ error }`);
    }
}