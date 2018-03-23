import * as printf from 'printf';
import * as colors from 'colors';
import * as WebSocket from 'ws';

import { SocketServer } from '../SocketServer';

export function tablifyServers(
    serverMap: Map<string, SocketServer>, 
    connectionMap: Map<SocketServer, Map<string, WebSocket>>) {

    if( serverMap instanceof Map === true ||
        serverMap instanceof WeakMap === true
    ) { 
        let colWidths = [20, 10, 12];
        let colFormat = ['%-20s', '%-10d', '%-8d'];
        let colLabels = ['NAME', 'PORT', 'CLIENTS']

        serverMap.forEach((socketServer, serverName) => {
            colWidths[0] = serverName.length > colWidths[0] ? serverName.length : colWidths[0];
            colFormat[0] = `%-${colWidths[0]}s`;
        });

        console.log( colors.green(printf(`\t%-${colWidths[0]}s%-${colWidths[1]}s%-${colWidths[2]}s`, ...colLabels)) );
        serverMap.forEach((socketServer, serverName) => {
            let connectionArray = connectionMap.get(socketServer);
            let connectionCount = connectionArray ? connectionArray.size : 0;
            let port = socketServer.getPort();
            console.log(printf(`\t${ colFormat.join('') }`, serverName, port, connectionCount));
        });
    }
}

export function tablifyConnections(connectionMap: Map<SocketServer, Map<string, WebSocket>>) {

    if( connectionMap instanceof Map === true ||
        connectionMap instanceof WeakMap === true
    ) {
        let index: number = 0;
        let colFormat = ['%-10d', '%-10s', '%-20s', '%-8d', '%-10d'];
        let colLabels = ['NO.', 'HEX', 'REMOTER', 'PORT', 'STATE']

        console.log( colors.green(printf(`\t%-10s%-10s%-20s%-8s%-10s`, ...colLabels)) );
        connectionMap.forEach((singleServerConnection, socketServer) => {
            singleServerConnection.forEach((websocket, hex) => {
                index ++;
                console.log(printf(`\t${ colFormat.join('') }`, index, hex, websocket.url, socketServer.getPort(), websocket.readyState));
            })
        })
    }
}