(function(window){
    if(window.RamenClient) {
        console.warn(`[Ramen.js] Variable "%cRamenClient%c" has already in use!`,  'color: lightgreen;', 'color: bada55');
        return null;
    }

    function RamenClient(){}
    RamenClient.prototype = {
        $$connection: null,
        $$defaultPort: 5000,
        connect: function(port) {
            if(this.$$connection) {
                this.$$connection.close();
            }
            this.$$connection = new WebSocket(`ws://localhost:${ this.$$defaultPort }`);
            this.$$connection.addEventListener('message', console.log);
        }
    }

    Object.defineProperties(
        window,
        {
            'RamenClient': {
                value: RamenClient,
                configurable: false,
                writable: false,
                enumerable: false
            }
        }
    )
})(window || {})