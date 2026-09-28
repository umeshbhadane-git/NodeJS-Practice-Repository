
// CRYPTO in Node.js    ->  module for cryptographic operations.
// One common operation is hashing.

const crypto = require("crypto");

const hash = crypto
    .createHash("sha256")
    .update("hello")
    .digest("hex");

console.log(hash);        // 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824

// ----------------------------------------------

// bcrypt is more common for passwords.

//      For example, with bcrypt:

//      Password -> bcrypt -> Password hash -> Database

//      When the user logs in:

//      Entered password -> bcrypt verification -> Compare with stored hash