# Ramen
Ramen is a mock socket server which use CLI to interact with clients.

### Installation
```javascript
    npm install -g ramen 
```

### How to use Ramen
Once you've installed ramen globally, or installed Ramen locally but linked to it.  
You may use ```Ramen``` to start Ramen console.
```javascript
    ramen   // or "ngx ramen" if you've install Ramen locally.
```
and When you opened Ramen console, you may start using Ramen's commands:   
```javascript
    Ramen> .create
    Ramen> Server server1 is listening to port 5000
    Ramen> .list servers
            NAME                PORT        CLIENTS
            server1             5000        0
    Ramen>
```



### Commands
- .create, .crt
- .list, .ls
- .focus, .fcs
- .unfocus
- .send, .s
- .broadcast
- .close, .cls
- .shutdown
- .--help, .h
