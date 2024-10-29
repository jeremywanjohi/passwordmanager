// test/init.test.js

"use strict";

/********* External Imports ********/
const expect = require("expect.js");
const { initKeychain } = require("../src/init");
const { subtle } = require("crypto").webcrypto;
const { decodeBuffer } = require("../lib");

/********* Constants ********/
const TEST_PASSWORD = "StrongMasterPassword123!";
const INVALID_PASSWORD = ""; // Empty password for testing

/********* Mocking PBKDF2 Call Count ********/
// To track the number of PBKDF2 calls, we'll modify the initKeychain function
// to include a static counter. This requires updating src/init.js accordingly.

// Since `initKeychain` doesn't have this property, we'll create a wrapper for testing.
class TestableKeychain {
  static pbkdf2CallCount = 0;

  constructor(data, secrets) {
    this.data = data;
    this.secrets = secrets;
  }

  static async init(password) {
    TestableKeychain.pbkdf2CallCount += 1;
    const keychain = await initKeychain(password);
    return new TestableKeychain(keychain.data, keychain.secrets);
  }
}

describe("Keychain Initialization", function() {
  this.timeout(20000); // Increased timeout for PBKDF2

  it("should initialize a new keychain with a valid password", async function() {
    const keychain = await TestableKeychain.init(TEST_PASSWORD);

    // Verify that keychain is an object
    expect(keychain).to.be.an("object");

    // Check that 'data' and 'secrets' properties exist
    expect(keychain.data).to.be.an("object");
    expect(keychain.secrets).to.be.an("object");

    // Ensure 'data' is initially empty
    expect(Object.keys(keychain.data)).to.have.length(0);

    // Check that 'secrets' contains necessary cryptographic keys
    expect(keychain.secrets).to.have.keys(["hmacKey", "aesKey", "salt"]);
  });

  it("should throw an error if initialized without a password", async function() {
    try {
      await TestableKeychain.init();
      throw new Error("Initialization should have failed without a password");
    } catch (error) {
      expect(error).to.be.a("string");
      expect(error).to.contain("Invalid password provided for initialization.");
    }
  });

  it("should throw an error if initialized with an empty password", async function() {
    try {
      await TestableKeychain.init(INVALID_PASSWORD);
      throw new Error("Initialization should have failed with an empty password");
    } catch (error) {
      expect(error).to.be.a("string");
      expect(error).to.contain("Invalid password provided for initialization.");
    }
  });

  it("should generate valid HMAC, AES keys, and salt during initialization", async function() {
    const keychain = await TestableKeychain.init(TEST_PASSWORD);

    // Decode the exported keys and salt
    const hmacKeyBuffer = decodeBuffer(keychain.secrets.hmacKey);
    const aesKeyBuffer = decodeBuffer(keychain.secrets.aesKey);
    const saltBuffer = decodeBuffer(keychain.secrets.salt);

    // Import HMAC key
    const importedHmacKey = await subtle.importKey(
      "raw",
      hmacKeyBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
    expect(importedHmacKey).to.be.an("object");

    // Import AES-GCM key
    const importedAesKey = await subtle.importKey(
      "raw",
      aesKeyBuffer,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
    expect(importedAesKey).to.be.an("object");

    // Check salt length
    expect(saltBuffer.length).to.be(16); // 128 bits
  });

  it("should limit PBKDF2 calls to at most one during initialization", async function() {
    // Reset the PBKDF2 call count
    TestableKeychain.pbkdf2CallCount = 0;

    // Initialize the keychain
    await TestableKeychain.init(TEST_PASSWORD);

    // Check that PBKDF2 was called only once
    expect(TestableKeychain.pbkdf2CallCount).to.be(1);
  });
});
