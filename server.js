
// Using Common JS

// console.log("Node.js server started.");

// const { add } = require("./math");    // common JS

// console.log(add(100, 20));  

// -------------------------------------------------

// Using ES Module

// import { add } from "./math.js";
     
// console.log("Node.js server started.");

// console.log(add(100, 20));

// const port = process.env.PORT || 3000;

// console.log(port);

// ---------------------------------------------------

// console.log(__dirname); 

// console.log(__filename);

// -----------------------------------------------

// ======== fs.readFileSync()  =>  Synchronous / Blocking ===============

// const fs = require("fs");

// const data = fs.readFileSync("data.txt", "utf8");

// console.log(data);
 
// console.log("Finished");

// --------------------------------------------------

// =================  fs.readFile()  =>  Asynchronous / Callback ========

// const fs = require("fs");

// fs.readFile("data.txt", "utf8", (err, data) => {

//     if (err) {
//         console.log(err);
//         return;
//     }

//     console.log(data);
// });

// console.log("Finished");

// ------------------------------------------------

// ==================  fs/promises  =>  Asynchronous / Promise  =>  async / await  ====================

// const fs = require("fs/promises");

// async function readData() {

//     try {

//         const data = await fs.readFile("data.txt", "utf8");

//         console.log(data);

//     } catch (error) {

//         console.log(error);

//     }
// }
// readData();
// console.log("Finished");

// ---------------------------------------------------

const path = require("path");

const result = path.resolve("data", "file.txt");

console.log(result);