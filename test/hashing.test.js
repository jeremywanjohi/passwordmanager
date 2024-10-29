// test/hashing.test.js
const { expect } = require('expect.js');
const { hmacDomain } = require('../src/utils/hashing');
const crypto = require('crypto');

describe('Hashing Module', () => {
    it('should generate consistent HMAC for the same domain', () => {
        const domain = 'example.com';
        const hmac1 = hmacDomain(domain);
        const hmac2 = hmacDomain(domain);
        expect(hmac1).to.be(hmac2);
    });

    it('should generate different HMACs for different domains', () => {
        const domain1 = 'example.com';
        const domain2 = 'test.com';
        const hmac1 = hmacDomain(domain1);
        const hmac2 = hmacDomain(domain2);
        expect(hmac1).not.to.be(hmac2);
    });

    it('should produce HMACs of correct length', () => {
        const domain = 'example.com';
        const hmac = hmacDomain(domain);
        expect(hmac.length).to.be(64); // SHA-256 produces 32-byte hash represented as 64 hex characters
    });
});
