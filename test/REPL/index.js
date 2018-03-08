"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var repl = require("repl");
var REPL = /** @class */ (function () {
    function REPL() {
        this.replOptions = {};
    }
    REPL.prototype.console = function (options) {
        if (this.replServer === undefined) {
            this.replServer = repl.start(options || this.replOptions);
        }
        return this.replServer;
    };
    REPL.prototype.setOptions = function (options) {
        this.replOptions = options || this.replOptions;
        return this;
    };
    REPL.prototype.setPrompt = function (prompt) {
        var tempPrompt = prompt;
        if (typeof prompt !== 'string') {
            tempPrompt = tempPrompt.toString();
        }
        this.replOptions.prompt = tempPrompt || '> ';
        return this;
    };
    REPL.prototype.setInput = function (input) {
        if (input) {
            this.replOptions.input = input;
        }
        return this;
    };
    REPL.prototype.setOutput = function (output) {
        if (output) {
            this.replOptions.output = output;
        }
        return this;
    };
    REPL.prototype.setTerminal = function (terminal) {
        if (terminal !== undefined) {
            this.replOptions.terminal = !!terminal;
        }
        return this;
    };
    REPL.prototype.setEval = function (evalFn) {
        if (evalFn && typeof evalFn === 'function') {
            this.replOptions.eval = evalFn;
        }
        return this;
    };
    REPL.prototype.useColors = function (use) {
        if (use !== undefined) {
            this.replOptions.useColors = !!use;
        }
        return this;
    };
    REPL.prototype.useGlobal = function (use) {
        if (use !== undefined) {
            this.replOptions.useGlobal = !!use;
        }
        return this;
    };
    REPL.prototype.ignoreUndefined = function (ignore) {
        if (ignore !== undefined) {
            this.replOptions.ignoreUndefined = !!ignore;
        }
        return this;
    };
    REPL.prototype.setWriter = function (writer) {
        if (writer && typeof writer === 'function') {
            this.replOptions.writer = writer;
        }
        return this;
    };
    REPL.prototype.setCompleter = function (completer) {
        if (completer && typeof completer === 'function') {
            this.replOptions.completer = completer;
        }
        return this;
    };
    REPL.prototype.setReplMode = function (mode) {
        this.replOptions = mode;
        return this;
    };
    REPL.prototype.setBreakEvalOnSigint = function (breakEvalOnSigint) {
        this.replOptions.breakEvalOnSigint = breakEvalOnSigint;
        return this;
    };
    REPL.prototype.setCommand = function (cmd, action, description) {
        this.console().defineCommand(cmd, {
            help: description || '',
            action: action
        });
        return this;
    };
    REPL.prototype.setVariable = function (key, value, descriptor) {
        return this;
    };
    REPL.prototype.displayPrompt = function () {
        this.console().displayPrompt();
    };
    REPL.prototype.exit = function (code) {
        process.exit(code || 0);
    };
    return REPL;
}());
exports.REPL = REPL;
