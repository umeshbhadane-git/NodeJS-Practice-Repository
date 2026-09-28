
// File System Module in Node.js

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