import * as http from 'http';
import * as https from 'https';

export interface SocketServerOptions {
    /**
     * The hostname where to bind the server.
     */
    host?: string,

    /**
     * The port where to bind the server.
     */
    port?: number,

    /**
     * The maximum length of the queue of pending connections.
     */
    backlog?: number,

    /**
     * A pre-created Node.js HTTP server.
     */
    server?: http.Server | https.Server,

    /**
     * A function which can be use d to validate incoming connections.
     * if verifyClient is provided with two arguments then those are:
     *  info {Object} Same as above.
     *  cb {Function} A callback that must be called by the user upon inspection of the info fields. Arguments in this callback are:
     *      result {Boolean} Whether or not to accept the handshake.
     *      code {Number} When result is false this field determines the HTTP error status code to be sent to the client.
     *      name {String} When result is false this field determines the HTTP reason phrase.
     */
    verifyClient?: Function,

    /**
     * A function which can be used to handle the WebSocket subprotocols.
     * If handleProtocols is not set then the first of the client's requested subprotocols is used.
     *  perMessageDeflate can be used to control the behavior of permessage-deflate extension. The extension is disabled when false (default value). If an object is provided then that is extension parameters:
     *      serverNoContextTakeover {Boolean} Whether to use context takeover or not.
     *      clientNoContextTakeover {Boolean} Acknowledge disabling of client context takeover.
     *      serverMaxWindowBits {Number} The value of windowBits.
     *      clientMaxWindowBits {Number} Request a custom client window size.
     *      zlibDeflateOptions {Object} Additional options to pass to zlib on deflate.
     *      zlibInflateOptions {Object} Additional options to pass to zlib on inflate.
     *      threshold {Number} Payloads smaller than this will not be compressed. Defaults to 1024 bytes.
     *      concurrencyLimit {Number} The number of concurrent calls to zlib. Calls above this limit will be queued. Default 10. You usually won't need to touch this option. See this issue for more details.
     * If a property is empty then either an offered configuration or a default value is used. When sending a fragmented message the length of the first fragment is compared to the threshold. This determines if compression is used for the entire message.
     */
    handleProtocls?: Function,

    /**
     * Accept only connections matching this path.
     */
    path?: string,

    /**
     * Enable no server mode.
     */
    noServer?: boolean,

    /**
     * Specifies whether or not to track clients.
     */
    clientTracking?: boolean,

    /**
     * Enable/disable permessage-defalte.
     */
    perMessageDeflate?: boolean | any,

    /**
     * The maximum allowed message size in bytes.
     */
    maxPayload?: number
}