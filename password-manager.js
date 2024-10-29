// password-manager.js

"use strict";

/********* External Imports ********/
const { initKeychain } = require("./src/init");
const { loadKeychain } = require("./src/load"); // To be implemented
const { dumpKeychain } = require("./src/dump"); // To be implemented
const { setEntry } = require("./src/set");       // To be implemented
const { getEntry } = require("./src/get");       // To be implemented
const { removeEntry } = require("./src/remove"); // To be implemented

/********* Constants ********/
const MAX_PASSWORD_LENGTH = 64; // Maximum allowed password length

/********* Implementation ********/
class Keychain {
  /**
   * Initializes the keychain using the provided information. Note that external
   * users should likely never invoke the constructor directly and instead use
   * either Keychain.init or Keychain.load. 
   * Arguments:
   *  You may design the constructor with any parameters you would like. 
   * Return Type: void
   */
  constructor(data, secrets) {
    this.data = data;       // Public data (safe to serialize)
    this.secrets = secrets; // Private data (HMAC and AES keys)
  }

  /** 
    * Creates an empty keychain with the given password.
    *
    * Arguments:
    *   password: string
    * Return Type: Keychain
    */
  static async init(password) {
    const keychain = await initKeychain(password);
    return new Keychain(keychain.data, keychain.secrets);
  }

  /**
    * Loads the keychain state from the provided representation (repr). The
    * repr variable will contain a JSON encoded serialization of the contents
    * of the KVS (as returned by the dump function). The trustedDataCheck
    * is an *optional* SHA-256 checksum that can be used to validate the 
    * integrity of the contents of the KVS. If the checksum is provided and the
    * integrity check fails, an exception should be thrown. You can assume that
    * the representation passed to load is well-formed (i.e., it will be
    * a valid JSON object).Returns a Keychain object that contains the data
    * from repr. 
    *
    * Arguments:
    *   password:           string
    *   repr:               string
    *   trustedDataCheck: string
    * Return Type: Keychain
    */
  static async load(password, repr, trustedDataCheck) {
    const keychain = await loadKeychain(password, repr, trustedDataCheck);
    return new Keychain(keychain.data, keychain.secrets);
  }

  /**
    * Returns a JSON serialization of the contents of the keychain that can be 
    * loaded back using the load function. The return value should consist of
    * an array of two strings:
    *   arr[0] = JSON encoding of password manager
    *   arr[1] = SHA-256 checksum (as a string)
    * As discussed in the handout, the first element of the array should contain
    * all of the data in the password manager. The second element is a SHA-256
    * checksum computed over the password manager to preserve integrity.
    *
    * Return Type: array
    */ 
  async dump() {
    const [repr, checksum] = await dumpKeychain(this.data, this.secrets);
    return [repr, checksum];
  }

  /**
    * Fetches the data (as a string) corresponding to the given domain from the KVS.
    * If there is no entry in the KVS that matches the given domain, then return
    * null.
    *
    * Arguments:
    *   name: string
    * Return Type: Promise<string|null>
    */
  async get(name) {
    if (typeof name !== "string") {
      throw "Domain name must be a string.";
    }
    return await getEntry(this.data, this.secrets, name);
  }

  /** 
  * Inserts the domain and associated data into the KVS. If the domain is
  * already in the password manager, this method should update its value. If
  * not, create a new entry in the password manager.
  *
  * Arguments:
  *   name: string
  *   value: string
  * Return Type: void
  */
  async set(name, value) {
    if (typeof name !== "string" || typeof value !== "string") {
      throw "Domain name and password must be strings.";
    }
    if (value.length > MAX_PASSWORD_LENGTH) {
      throw "Password exceeds maximum length.";
    }
    await setEntry(this.data, this.secrets, name, value);
  }

  /**
    * Removes the record with name from the password manager. Returns true
    * if the record with the specified name is removed, false otherwise.
    *
    * Arguments:
    *   name: string
    * Return Type: Promise<boolean>
  */
  async remove(name) {
    if (typeof name !== "string") {
      throw "Domain name must be a string.";
    }
    return await removeEntry(this.data, this.secrets, name);
  }
}

module.exports = { Keychain };
