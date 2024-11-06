// test/get.test.js
const { expect } = require('chai'); // Correct import
const { getEntry } = require('../src/get');
const { setEntry } = require('../src/set'); // Correct import path
const { clear } = require('../src/utils/kvs'); // Correct import path

describe("Get Module", () => {
    before(() => {
        // Clear KVS and set up initial entries
        clear();
        setEntry('example.com', 'password123'); // 11 characters, within 32 limit
    });

    after(() => {
        // Clean up after tests
        clear();
    });

    it("should retrieve and decrypt the password for a domain", () => {
        const password = getEntry('example.com');
        expect(password).to.equal('password123'); // Correct usage of expect
    });

    it("should throw an error if the domain does not exist", () => {
        expect(() => getEntry('nonexistent.com')).to.throw('Domain does not exist');
    });

    it("should handle padded passwords correctly", () => {
        const password = getEntry('example.com');
        expect(password).to.equal('password123');
        expect(password).to.have.lengthOf(11);
    });
    
});
