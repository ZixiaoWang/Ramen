describe('BufferFactory', () => {

    var BF = require('./BufferFactory.js');
    var bf;

    beforeEach(() => {
        bf = new BF.BufferFactory();
    });

    it('Body should be type DataView', () => {
        let body = bf.getBody();
        expect(body).toEqual( jasmine.any(DataView) );
    });

})