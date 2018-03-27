#!/usr/bin/env node

/// <reference path="index.d.ts" />

import * as program from 'commander';
import * as WebSocket from 'ws';
import * as colors from 'colors';
import { crc32 } from 'js-crc';

import { REPL } from './src/REPL';
import { SocketServer } from './src/SocketServer';
import { tablifyServers, tablifyConnections } from './src/Utils/Tablify';
import { Ramen } from './src/Ramen';


//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//               佛祖保佑         永无BUG
//
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

(function setRelpServer(){
    const HELP = new Map([
        ["create", `\r\t\t${ colors.green('[SOCKET]') } Quickly set up a server with default port 5000. \n\t\talias ${ colors.green('.crt') }\n\t\te.g. ${ colors.green('.create [name]') } or ${ colors.green('.crt [name]') }`],
        ["list", `\r\t\t${ colors.green('[SOCKET]') } List all the Servers.\n\t\talias ${ colors.green('.ls') }\n\t\te.g. ${ colors.green('.list servers') } or ${ colors.green('.list connections') } or ${ colors.green('.ls c') }`],
        ["focus", `\r\t\t${ colors.green('[SOCKET]') } Use a specific Connection by entering the hex string, or its index.\n\t\talias ${ colors.green('.f') }\n\t\te.g. ${ colors.green('.focus 23de7a13') } or ${ colors.green('.f 1') }`],
        ["unfocus", `\r\t\t${ colors.green('[SOCKET]') } Unfocus the connections. \n\t\talias ${ colors.green('.uf <hex | index>') }\n\t\t.e.g. ${ colors.green('.unfocus') }`],
        ["send", `\r\t\t${ colors.green('[SOCKET]') } Send message. This operation requires an focused connection, otherwise plase use "${ colors.green('.broadcast <message>') }".\n\t\talias ${ colors.green('.s') }\n\t\te.g.${ colors.green('.send "Hello World"') } or ${ colors.green('.s "Hello World"') }`],
        ["mirror", `\r\t\t${ colors.green('[SOCKET]')} Response with whatever recieved from client. This operation requires an focused connection.\n\t\te.g. ${ colors.green('.mirror') }`],
        ["broadcast", `\r\t\t${ colors.green('[SOCKET]') } Broadcast the arguments (string) to all connected clients. \n\t\te.g. ${ colors.green('.broadcast Hello World') }`],
        ["close", `\r\t\t${ colors.green('[SOCKET]') } Close the a specific connection by hex, or use "${ colors.green('--all') } to close all the existing connections". \n\t\talias ${ colors.green('.cls') }\n\t\te.g. ${ colors.green('.close <hex> | --all') } or ${ colors.green('.cls --all') }`],
        ["shutdown", `\r\t\t${ colors.green('[SOCKET]') } Shut down one or more specific server. \n\t\te.g. ${ colors.green('.shutdown [...serverName]') }`],
        ["ping", `\r\t\t${ colors.green('[SOCKET]') } Send a ping to the focused client. This operation requires an focused connection, otherwise plase use "${ colors.green('.broadcast <message>') }".\n\t\te.g.${ colors.green('.send "Hello World"') }`],
        ["--help", `\r\t\t${ colors.green('[SOCKET]') } Showing all the costomized commands.`]
    ]);

    let replServer = new REPL();
    let defaultPrompt = colors.green('Ramen> ');
    let ramen = new Ramen()
                    .setDefaultPrompt(defaultPrompt)
                    .setOutputer(replServer);

    let create = (serverName?: string) => {
        let name = serverName ? serverName.split(' ')[0] : undefined;
        ramen.createSocketServer(name);
        replServer.displayPrompt();
    }

    let list = (type: string) => {
        if( /^(servers|s)/i.test(type.trim()) ) {
            ramen.listAllServers();
            replServer.displayPrompt();
        }else if( /^(connections|clients|c)$/i.test(type.trim()) ) {
            ramen.listAllConnections();
            replServer.displayPrompt();
        }else {
            console.log(`\tPlease specify a list type`);
            console.log(`\t ${colors.green('servers     or s') }\tList all existing servers`)
            console.log(`\t ${colors.green('connections or c') }\tList all established connections`)
            console.log(`\t ${colors.green('clients         ') }\tAlias of ${ colors.green('.list connections') }`)
            replServer.displayPrompt();
        }
    }

    let focus = (hex: string) => {
        if(/[0-9a-f]{8}/.test(hex) === false && /\d+/.test(hex) === false) {
            console.log('Please enter a number, or a valid hex string, it should be 8 characters');
            replServer.displayPrompt();
            return undefined;
        }

        let findByHex = () => {
            if(ramen.getConnectionByHex(hex) === undefined) {
                console.log(`Cannot find the connection "${ colors.green(hex) }". Please use "${ colors.green('.list connections') }"`);
                replServer.displayPrompt();
                return undefined;
            } else {
                let websocket = ramen.focusOnConnection(hex);
    
                if(websocket) {
                    replServer.setPrompt(`${hex}> `);
                    replServer.log(`"${ colors.green(hex) }" is focused!`);
    
                    websocket.onmessage = (event: {data: WebSocket.Data, type: string, target: WebSocket}) => {
                        if(typeof event.data === 'string') {
                            replServer.log(`[${ colors.yellow('RECIEVE') }] ${ event.data }`);
                        } else {
                            replServer.log(`[${ colors.yellow('RECIEVE') }] ${ event.data.toString() }`);
                        }
                    }
    
                }
            }
        }

        let findByIndex = () => {
            let index = parseInt(hex);
            let socketPair = ramen.focusOnConnectionByIndex(index);
            if(socketPair === undefined) {
                console.log(`Cannot find the connection`);
                replServer.displayPrompt();
                return undefined;
            } else {
                let websocket = socketPair.socket;

                if(websocket) {
                    replServer.setPrompt(`${socketPair.hex}> `);
                    replServer.log(`"${ colors.green(socketPair.hex) }" is focused!`);
    
                    websocket.onmessage = (event: {data: WebSocket.Data, type: string, target: WebSocket}) => {
                        replServer.log(`[${ colors.yellow('RECIEVE') }] ${ event.data }`);
                    }
    
                }
            }
        }

        if(/[0-9a-f]{8}/.test(hex) === true) {
            findByHex();
        } else if(/\d+/.test(hex) === true) {
            findByIndex();
        }
    }

    let unfocus = () => {
        if(ramen.getTheFocusedConnection() === undefined) {
            console.log(`Cannot find any connections being focused.`);
            replServer.displayPrompt();
        }else{
            ramen.unfocusConnection();
            replServer.setPrompt(defaultPrompt);
            replServer.log('The connection has unfocused.');
        }
    }

    let send = (arg: string) => {
        if(ramen.getTheFocusedConnection() === undefined) {
            console.log(`You have to focus on one connection to send messages. please use "${ colors.green(".focus <hex>") }" or "${ colors.green('.broadcast <message>') }" to broadcast to all connections`);
            replServer.displayPrompt();
            return undefined;
        }
        let data = eval(arg);
        let theConnection = ramen.getTheFocusedConnection() as WebSocket;
        theConnection.send(data);
        replServer.displayPrompt();
    }

    let mirror = () => {
        if(ramen.getTheFocusedConnection() === undefined) {
            console.log(`You have to focus on one connection to send messages. please use "${ colors.green(".focus <hex>") }" or "${ colors.green('.broadcast <message>') }" to broadcast to all connections`);
            replServer.displayPrompt();
            return undefined;
        }

        replServer.displayPrompt();
        let theConnection = ramen.getTheFocusedConnection() as WebSocket;
        theConnection.onmessage = function(event: { type: string, data: any, target: WebSocket }){
            let data = event.data;
            let type: string = 'string';

            switch(typeof event.data) {
                case 'string': 
                    this.binaryType = 'string';
                    break;
                case 'object':
                    type = theConnection.binaryType;
                    break;
                default:
                    this.binaryType = 'string';
            }

            console.log(`[${ colors.yellow('GET & SEND') }] [TYPE: ${ colors.cyan(type) }] ${ data.toString() }`);
            this.send(data);
            replServer.displayPrompt();
        };
    }

    let ping = () => {
        if(ramen.getTheFocusedConnection() === undefined) {
            console.log(`You have to focus on one connection to send messages. please use "${ colors.green(".focus <hex>") }" or "${ colors.green('.broadcast <message>') }" to broadcast to all connections`);
            replServer.displayPrompt();
            return undefined;
        }
        let pingStart: number;
        let onPong = () => {    
            let pingPong = Date.now() - pingStart;
            replServer.log(`[${ colors.yellow('PONG') }] in ${ colors.green(pingPong.toString()) } ms`);  
            theConnection.removeEventListener('pong', onPong);
        }
        let theConnection = ramen.getTheFocusedConnection() as WebSocket;
        theConnection.addEventListener('pong', onPong);

        pingStart = Date.now();
        theConnection.ping();
        replServer.displayPrompt();
    }

    let broadcast = (args: string) => {
        ramen.broadcast(args);
    }

    let close = (arg: string) => {
        if(!arg) {
            if(ramen.getTheFocusedConnection() !== undefined) {
                let theFocusedConnectionHex = ramen.getTheFocusedConnectionHex();
                ramen.closeConnectionByHex(theFocusedConnectionHex);
                replServer.setPrompt(defaultPrompt);
                replServer.log(`The connection "${ colors.green(theFocusedConnectionHex) }" has unfocused.`);
                return undefined;
            }
            console.log('Please enter a connection hex, or use --all to close all connections');
            replServer.displayPrompt();
            return undefined;
        }
        if(/--all/.test(arg) === true) {
            ramen.closeAll();
            replServer.displayPrompt();
            return true;
        }
        if(/[0-9a-f]{8}/.test(arg) === false) {
            console.log('Please enter a valid hex string, it should be 8 characters');
            replServer.displayPrompt();
            return undefined;
        }

        let hex = arg;
        if(ramen.getConnectionByHex(hex) === undefined) {
            console.log(`Cannot find the connection "${ colors.green(hex) }". Please use "${ colors.green('.list connections') }"`);
            replServer.displayPrompt();
            return undefined;
        } else {
            let websocket = ramen.getConnectionByHex(hex);
            if(websocket) {
                ramen.closeConnectionByHex(hex);
            }
            replServer.displayPrompt();
        }
    }

    let shutdown = (arg: string) => {
        let argArr: Array<string>
        let argSet: Set<string>;

        if(arg === undefined || arg.length === 0){
            replServer.log(`Please enter a server name, or enter '${ colors.green('--all') }' to shutdown all the servers`);
            return null;
        } else {
            argArr = arg.split(' ');
            argSet = new Set(argArr);
            if(argSet.has('--all') === true) {
                ramen.serverMap.forEach((server, name) => {
                    server.close();
                    ramen.serverMap.delete(name);
                    ramen.connectionsMap.delete(server);
                    console.log(`${ colors.green(name) } has closed.`);
                });
                ramen.reset();
                replServer.displayPrompt();
            }else{
                argArr.forEach(serverName => {
                    if(ramen.serverMap.has(serverName)){
                        let server = ramen.serverMap.get(serverName) as SocketServer;
                        server.close();
                        ramen.serverMap.delete(serverName);
                        ramen.connectionsMap.delete(server);
                        console.log(`${ colors.green(serverName) } has closed.`);
                    }else{
                        console.log(`[${ colors.yellow('WARN') }] Cannot find server '${ colors.yellow(serverName) }'`);
                    }
                });
                replServer.displayPrompt();
            }
        }
        
    }

    let showHelp = () => {
        HELP.forEach((description, command) => {
            console.log(command + description);
            console.log();
        });
        replServer.displayPrompt();
    }

    replServer

        .setVariable('SocketServer', SocketServer)
        .setVariable('WebSocket', WebSocket)
        .setVariable('REPL', replServer)
        .setVariable('Ramen', ramen)

        .setCommand('create', create, HELP.get('create') )
        .setCommand('crt', create, HELP.get('create'))
        .setCommand('list', list, HELP.get('list') )
        .setCommand('ls', list, HELP.get('list') )
        .setCommand('focus', focus, HELP.get('focus') )
        .setCommand('f', focus, HELP.get('focus') )
        .setCommand('close', close, HELP.get('close') )
        .setCommand('cls', close, HELP.get('close') )
        .setCommand('unfocus', unfocus, HELP.get('unfocus') )
        .setCommand('uf', unfocus, HELP.get('unfocus') )
        .setCommand('send', send, HELP.get('send') )
        .setCommand('s', send, HELP.get('send') )
        .setCommand('mirror', mirror, HELP.get('mirror') )
        .setCommand('ping', ping, HELP.get('ping') )
        .setCommand('broadcast', broadcast, HELP.get('broadcase') )
        
        .setCommand('shutdown', shutdown, HELP.get('shutdown') )
        .setCommand('--help', showHelp, HELP.get('--help') )
        .setCommand('h', showHelp, HELP.get('--help') )

        .console(defaultPrompt);
})();


// program
//     .command('')
//     .description('Open up a console with embeded SocketServer')
//     .action(setRelpServer);

// program
//     .parse(process.argv);