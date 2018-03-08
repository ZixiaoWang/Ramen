#!/usr/bin/env node

import * as program from 'commander';

import { REPL } from './REPL';
import { SocketServer } from './SocketServer';

program
    .command('console')
    .alias('c')
    .action(() => {
        let replServer = new REPL();
        replServer
            .setVariable('SocketServer', SocketServer)
            .console('>>> ');
    })

program
    .parse(process.argv);