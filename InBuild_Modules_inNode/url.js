

// URL Module in Node.js
// The url module helps you work with URLs.


const { URL } = require("url");

const myUrl = new URL(
    "https://example.com/products?id=10&category=mobile"
);

console.log(myUrl.protocol);                        //     https:
console.log(myUrl.hostname);                        //     example.com
console.log(myUrl.pathname);                        //     /products
console.log(myUrl.searchParams.get("id"));          //     10
console.log(myUrl.searchParams.get("category"));    //     mobile