## serverMap 
Type: Map<string, SocketServer>  
```javascript
    [
        [name: string, server: SocketServer],
        [name: string, server: SocketServer],
        [name: string, server: SocketServer]
        ...
    ]
```

## connectionMap
Type: Map<SocketServer, Map<string, WebSocket>>  
```javascript
    [
        [
            server: SocketServer, 
            [
                [hash: string, connection: WebSocket],
                [hash: string, connection: WebSocket],
                [hash: string, connection: WebSocket],
                ...
            ]
        ]
    ]
```