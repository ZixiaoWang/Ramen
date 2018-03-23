"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var printf = require("printf");
var colors = require("colors");
function tablifyServers(serverMap, connectionMap) {
    if (serverMap instanceof Map === true ||
        serverMap instanceof WeakMap === true) {
        var colWidths_1 = [20, 10, 12];
        var colFormat_1 = ['%-20s', '%-10d', '%-8d'];
        var colLabels = ['NAME', 'PORT', 'CLIENTS'];
        serverMap.forEach(function (socketServer, serverName) {
            colWidths_1[0] = serverName.length > colWidths_1[0] ? serverName.length : colWidths_1[0];
            colFormat_1[0] = "%-" + colWidths_1[0] + "s";
        });
        console.log(colors.green(printf.apply(void 0, ["\t%-" + colWidths_1[0] + "s%-" + colWidths_1[1] + "s%-" + colWidths_1[2] + "s"].concat(colLabels))));
        serverMap.forEach(function (socketServer, serverName) {
            var connectionArray = connectionMap.get(socketServer);
            var connectionCount = connectionArray ? connectionArray.size : 0;
            var port = socketServer.getPort();
            console.log(printf("\t" + colFormat_1.join(''), serverName, port, connectionCount));
        });
    }
}
exports.tablifyServers = tablifyServers;
function tablifyConnections(connectionMap) {
    if (connectionMap instanceof Map === true ||
        connectionMap instanceof WeakMap === true) {
        var index_1 = 0;
        var colFormat_2 = ['%-10d', '%-10s', '%-20s', '%-8d', '%-10d'];
        var colLabels = ['NO.', 'HEX', 'REMOTER', 'PORT', 'STATE'];
        console.log(colors.green(printf.apply(void 0, ["\t%-10s%-10s%-20s%-8s%-10s"].concat(colLabels))));
        connectionMap.forEach(function (singleServerConnection, socketServer) {
            singleServerConnection.forEach(function (websocket, hex) {
                index_1++;
                console.log(printf("\t" + colFormat_2.join(''), index_1, hex, websocket.url, socketServer.getPort(), websocket.readyState));
            });
        });
    }
}
exports.tablifyConnections = tablifyConnections;
