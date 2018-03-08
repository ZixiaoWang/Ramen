import * as repl from 'repl';
import * as colors from 'colors';

import { ReplOptions, REPLServer } from 'repl';

export class REPL {

    private replServer: REPLServer | undefined;
    private replOptions: ReplOptions = {};

    constructor() {}

    console(options?: ReplOptions | string): REPLServer {
        if(this.replServer === undefined) {
            this.replServer = repl.start(options || this.replOptions);
        }
        return this.replServer;
    }

    protected setOptions(options: ReplOptions): REPL {
        this.replOptions = options || this.replOptions;
        return this;
    }

    protected setPrompt(prompt: string): REPL {
        let tempPrompt = prompt;
        if(typeof prompt !== 'string') {
            tempPrompt = tempPrompt.toString();
        }
        this.replOptions.prompt = tempPrompt || '> ';
        return this;
    }

    protected setInput(input: NodeJS.ReadableStream): REPL {
        if(input) {
            this.replOptions.input = input;
        }
        return this;
    }

    protected setOutput(output: NodeJS.WritableStream): REPL {
        if(output) {
            this.replOptions.output = output;
        }
        return this;
    }

    protected setTerminal(terminal: boolean): REPL {
        if(terminal !== undefined) {
            this.replOptions.terminal = !!terminal;
        }
        return this;
    }

    protected setEval(evalFn: Function): REPL {
        if(evalFn && typeof evalFn === 'function') {
            this.replOptions.eval = evalFn;
        }
        return this;
    }

    protected useColors(use: boolean): REPL{
        if(use !== undefined) {
            this.replOptions.useColors = !!use;
        }
        return this;
    }

    protected useGlobal(use: boolean): REPL {
        if(use !== undefined) {
            this.replOptions.useGlobal = !!use;
        }
        return this;
    }

    protected ignoreUndefined(ignore: boolean): REPL {
        if(ignore !== undefined) {
            this.replOptions.ignoreUndefined = !!ignore;
        }
        return this;
    }

    protected setWriter(writer: Function): REPL {
        if(writer && typeof writer === 'function') {
            this.replOptions.writer = writer;
        }
        return this;
    }

    protected setCompleter(completer: Function): REPL {
        if(completer && typeof completer === 'function') {
            this.replOptions.completer = completer;
        }
        return this;
    }

    protected setReplMode(mode: any): REPL{
        this.replOptions = mode;
        return this;
    }

    protected setBreakEvalOnSigint(breakEvalOnSigint: any): REPL {
        this.replOptions.breakEvalOnSigint = breakEvalOnSigint;
        return this;
    }

    setCommand(cmd: string, action: Function, description?: string): REPL {
        this.console().defineCommand(cmd, {
            help: description || '',
            action: action
        })
        return this;
    }

    setVariable(key: string, value?: any, descriptor?: PropertyDescriptor): REPL {
        return this;
    }

    displayPrompt(): void{
        this.console().displayPrompt();
    }

    exit(code?: number): void{
        process.exit(code || 0);
    }
}