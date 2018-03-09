import * as printf from 'printf';
import * as colors from 'colors';

import { SocketServer } from '../SocketServer';

export function tablifyServers(serverMap: Map<string, SocketServer>, connectionMap: Map<SocketServer, Array<any>>) {
    if( serverMap instanceof Map === true ||
        serverMap instanceof WeakMap === true
    ) { 
        let colWidths = [20, 10, 12];
        let colFormat = ['%20s', '%10d', '%8d'];
        let colLabels = ['NAME', 'PORT', 'CLIENTS']

        serverMap.forEach((socketServer, serverName) => {
            colWidths[0] = serverName.length > colWidths[0] ? serverName.length : colWidths[0];
            colFormat[0] = `%${colWidths[0]}s`;
        });

        console.log( colors.green(printf(`\t%${colWidths[0]}s%${colWidths[1]}s%${colWidths[2]}s`, ...colLabels)) );
        serverMap.forEach((socketServer, serverName) => {
            let connectionArray = connectionMap.get(socketServer);
            let connectionCount = connectionArray ? connectionArray.length : 0;
            let port = socketServer.getPort();
            console.log(printf(`\t${ colFormat.join('') }`, serverName, port, connectionCount));
        });
    }
}