"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var printf = require("printf");
var colors = require("colors");
function tablifyServers(serverMap, connectionMap) {
    if (serverMap instanceof Map === true ||
        serverMap instanceof WeakMap === true) {
        var colWidths_1 = [20, 10, 12];
        var colFormat_1 = ['%20s', '%10d', '%8d'];
        var colLabels = ['NAME', 'PORT', 'CLIENTS'];
        serverMap.forEach(function (socketServer, serverName) {
            colWidths_1[0] = serverName.length > colWidths_1[0] ? serverName.length : colWidths_1[0];
            colFormat_1[0] = "%" + colWidths_1[0] + "s";
        });
        console.log(colors.green(printf.apply(void 0, ["\t%" + colWidths_1[0] + "s%" + colWidths_1[1] + "s%" + colWidths_1[2] + "s"].concat(colLabels))));
        serverMap.forEach(function (socketServer, serverName) {
            var connectionArray = connectionMap.get(socketServer);
            var connectionCount = connectionArray ? connectionArray.length : 0;
            var port = socketServer.getPort();
            console.log(printf("\t" + colFormat_1.join(''), serverName, port, connectionCount));
        });
    }
}
exports.tablifyServers = tablifyServers;
