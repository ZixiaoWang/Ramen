#!/usr/bin/env node

/// <reference path="index.d.ts" />

import * as program from 'commander';
import * as WebSocket from 'ws';
import * as colors from 'colors';
import { crc32 } from 'js-crc';

import { REPL } from './REPL';
import { SocketServer } from './SocketServer';
import { tablifyServers, tablifyConnections } from './Utils/Tablify';
import { Ramen } from './Ramen';


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
        ["create", `\r\t\t${ colors.bgGreen('[SOCKET]') } Quickly set up a server with default port 500\n\t\te.g. ${ colors.green('.create [name]') }`],
        ["list", `\r\t\t${ colors.bgGreen('[SOCKET]') } List all the Servers.\n\t\te.g. ${ colors.green('.list servers') } or ${ colors.green('.list connections') }`],
        ["focus", `\r\t\t${ colors.bgGreen('[SOCKET]') } Use a specific Connection by entering the hex string.\n\t\t e.g. ${ colors.green('.focus 23de7a13') }`],
        ["unfocus", `\r\t\t${ colors.bgGreen('[SOCKET]') } Unfocus the connections. \n\t\t.e.g. ${ colors.green('.unfocus') }`],
        ["send", `\r\t\t${ colors.bgGreen('[SOCKET]') } Send message. This operation requires an focused connection, otherwise plase use "${ colors.green('.broadcast <message>') }".\n\t\te.g.${ colors.green('.send "Hello World"') }`],
        ["broadcast", `\r\t\t${ colors.bgGreen('[SOCKET]') } Broadcast the arguments (string) to all connected clients. \n\t\te.g. ${ colors.green('.broadcast Hello World') }`],
        ["close", `\r\t\t${ colors.bgGreen('[SOCKET]') } Close the server or a specific connection. \n\t\t e.g. ${ colors.green('.close <type> <name>') } \n\t\t --type \t one of "server", "connection" and "client" \n\t\t --name \t The server name, or connection hex string.`],
        ["shutdown", `\r\t\t${ colors.bgGreen('[SOCKET]') } Shut down one or more specific server. \n\t\te.g. ${ colors.green('.shutdown [...serverName]') }`],
        ["--help", `\r\t\t${ colors.bgGreen('[SOCKET]') } Showing all the costomized commands.`]
    ]);

    let replServer = new REPL();
    let defaultPrompt = colors.green('Ramen> ');
    let ramen = new Ramen().setOutputer(replServer);

    replServer

        .setVariable('SocketServer', SocketServer)
        .setVariable('WebSocket', WebSocket)
        .setVariable('REPL', replServer)
        .setVariable('Ramen', ramen)

        .setCommand('create', 
            (serverName?: string) => {
                let name = serverName ? serverName.split(' ')[0] : undefined;
                ramen.createSocketServer(name);
                replServer.displayPrompt();
            }, 
            HELP.get('create')
        )
        .setCommand('list',
            (type: string) => {
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
            },
            HELP.get('list')
        )
        .setCommand('focus',
            (hex: string) => {
                if(/[0-9a-f]{8}/.test(hex) === false) {
                    console.log('Please enter a valid hex string, it should be 8 characters');
                    replServer.displayPrompt();
                    return undefined;
                }
                if(ramen.getConnectionByHex(hex) === undefined) {
                    console.log(`Cannot find the connection "${ colors.green(hex) }". Please use "${ colors.green('.list connections') }"`);
                    replServer.displayPrompt();
                    return undefined;
                } else {
                    ramen.focusOnConnection(hex);
                    replServer.setPrompt(`${hex}> `);
                    replServer.log(`"${ colors.green(hex) }" is focused!`);
                }
            },
            HELP.get('focus')
        )
        .setCommand('unfocus',
            () => {
                if(ramen.getTheFocusedConnection() === undefined) {
                    console.log(`Cannot find any connections being focused.`);
                    replServer.displayPrompt();
                }else{
                    ramen.unfocusConnection();
                    replServer.setPrompt(defaultPrompt);
                    replServer.log('The connection has unfocused.');
                }
            },
            HELP.get('unfocus')
        )
        .setCommand('send',
            (arg: string) => {
                if(ramen.getTheFocusedConnection() === undefined) {
                    console.log(`You have to focus on one connection to send messages. please use "${ colors.green(".focus <hex>") }" or "${ colors.green('.broadcast <message>') }" to broadcast to all connections`);
                    replServer.displayPrompt();
                    return undefined;
                }
                let data = eval(arg);
                let theConnection = ramen.getTheFocusedConnection() as WebSocket;
                theConnection.send(data);
                replServer.displayPrompt();
            },
            HELP.get('send')
        )
        .setCommand('broadcast',
            (args: string) => {
                ramen.broadcast(args);
            },
            HELP.get('broadcase')
        )
        .setCommand('close',
            (args: string) => {
                let type = args.split(' ')[0];
                let nameArr = args.split(' ').splice(1);

                if(/server|connection|client/.test(type) === false) { 
                    console.log('Please enter a valid type. (a type is one of "server", "connection" and "client"');
                    replServer.displayPrompt(); 
                    return null;   
                } else {
                    
                    if(nameArr.length === 0){
                        console.log('Please enter a valid name. (a name could be the server name, or the hex string of connections');
                        replServer.displayPrompt();
                        return null;
                    } else if(/server/.test(type) === true) {
                        nameArr.forEach(name => {
                            if(ramen.serverMap.has(name) === true) {
                                let server = ramen.serverMap.get(name) as SocketServer;
                                server.close();
                                ramen.serverMap.delete(name);
                                ramen.connectionsMap.delete(server);
                                console.log(`$${name} has closed`);
                            }else{
                                console.log(`Cannot find Server ${ colors.yellow(name) }`);
                            }
                        });
                        replServer.displayPrompt();
                    } else if(/connection|client/.test(type) === true) {
                        nameArr.forEach(name => {
                            if(ramen.getConnectionByHex(name) !== undefined){
                                let websocket = ramen.getConnectionByHex(name) as WebSocket;
                                websocket.close();

                                try {
                                    ramen.connectionsMap.forEach((socketMap, socketServer) => {
                                        if(socketMap.has(name)){
                                            socketMap.delete(name);
                                            console.log(`${name} has closed`);
                                            throw new Error()
                                        }
                                    })
                                }catch(err) {
                                    // do absolutely nothing here
                                }

                            }else{
                                console.log(`Cannot find Connection ${ colors.yellow(name) }`);
                            }
                        })
                    }
                }
            },
            HELP.get('close')
        )
        .setCommand('shutdown',
            (arg: string) => {
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
                
            },
            HELP.get('shutdown')
        )
        .setCommand('--help',
            () => {
                HELP.forEach((description, command) => {
                    console.log(command + description);
                    console.log();
                });
                replServer.displayPrompt();
            },
            HELP.get('--help')
        )

        .console(defaultPrompt);
})();


// program
//     .command('')
//     .description('Open up a console with embeded SocketServer')
//     .action(setRelpServer);

// program
//     .parse(process.argv);