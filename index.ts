#!/usr/bin/env node

import { REPL } from './REPL';
import * as program from 'commander';

program
    .command('console')
    .alias('c')
    .action(() => {
        let replServer = new REPL();
        replServer
            .setCommand('df', () => {
                console.log('It is working!');
                replServer.displayPrompt();
            })
            .console('>>> ');
    })

program
    .parse(process.argv);