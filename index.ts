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
    let replServer = new REPL();
    let ramen = new Ramen().setOutputer(replServer);

    replServer

        .setVariable('SocketServer', SocketServer)
        .setVariable('WebSocket', WebSocket)
        .setVariable('REPL', replServer)
        .setVariable('Ramen', ramen)

        .setCommand(
            'create', 
            (serverName?: string) => {
                let name = serverName ? serverName.split(' ')[0] : undefined;
                ramen.createSocketServer(name);
                replServer.displayPrompt();
            }, 
            `\n\t[SOCKET] Quickly set up a server with default port 500\n\te.g. ${ colors.green('.create [name]') }`
        )
        .setCommand(
            'list',
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
            `\n\t[SOCKET] List all the Servers.\n\te.g. ${ colors.green('.list servers') } or ${ colors.green('.list connections') }`
        )
        .setCommand(
            'broadcast',
            (args: string) => {
                ramen.broadcast(args);
            },
            `\n\t[SOCKET] Broadcast the arguments (string) to all connected clients. \n\te.g. ${ colors.green('.broadcast Hello World') }`
        )
        .setCommand(
            'close',
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
            `\n\t[SOCKET] Close the server or a specific connection. \n\t e.g. ${ colors.green('.close <type> <name>') } \n\t --type \t one of "server", "connection" and "client" \n\t --name \t The server name, or connection hex string.`
        )
        .setCommand(
            'shutdown',
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
            `\n\t[SOCKET] Shut down one or more specific server. \n\te.g. ${ colors.green('.shutdown [...serverName]') }`
        )

        .console( colors.green('Ramen> ') );
})();


// program
//     .command('')
//     .description('Open up a console with embeded SocketServer')
//     .action(setRelpServer);

// program
//     .parse(process.argv);