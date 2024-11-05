// test/hashing.test.js
const expect = require('expect.js'); // ✅ Correct import
const { hmacDomain } = require('../src/utils/hashing');
const crypto = require('crypto');

describe('Hashing Module', () => {
    describe('hmacDomain', () => {
        it('should generate a consistent HMAC for the same domain', () => {
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

        it('should produce HMACs of correct length (64 hex characters for SHA-256)', () => {
            const domain = 'example.com';
            const hmac = hmacDomain(domain);
            expect(hmac).to.have.length(64);
        });

        it('should throw an error if domain is not a string', () => {
            const invalidInput = 12345;
            expect(() => hmacDomain(invalidInput)).to.throwError();
        });

        it('should handle empty string as domain', () => {
            const domain = '';
            const hmac = hmacDomain(domain);
            expect(hmac).to.have.length(64);
            // Optionally, verify against a known HMAC for empty string
            const secret = 'supersecretkey1234567890abcdef';
            const expectedHmac = crypto.createHmac('sha256', secret).update(domain).digest('hex');
            expect(hmac).to.be(expectedHmac);
        });
    });
});
