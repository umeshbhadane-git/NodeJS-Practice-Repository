
//  Stream in NodeJS

// Imagine you have a huge file: 5GB
// You don't want to load the entire 5 GB into memory.
// Instead, process it in smaller pieces.
// These pieces are called chunks.
// That's what streams help with.

const { log } = require("console");
const fs = require("fs");

// -------------------------------------------------------------

// READABLE STREAM  ->  A readable stream lets you read data piece by piece.


// const stream = fs.createReadStream("large.txt");               //  instead of fs.readFile()

// stream.on("data", (chunk) => {

//     console.log("Received chunk");

// });

// console.log(stream);

// --------------------------------------------------------------

// WRITABLE STREAM  ->  A writable stream lets you write data piece by piece.

// file will be automatically created

const stream = fs.createWriteStream("output1.txt");

stream.write("Hello\n");
stream.write("Node.js\n");
stream.write("FROM \n");
stream.write("UMESH\n");

stream.end();

// --------------------------------------------------------------------

// Piping Streams ( PIPE ) -> Piping (copy) data from one stream to another stream.

const readable = fs.createReadStream("input.txt");

const writable = fs.createWriteStream("output.txt");

readable.pipe(writable);

// ---------------------------------------------------------------------

// BACKPRESSURE

// Backpressure is a mechanism that helps you control the flow of data between streams.

// Backpressure is a mechanism for preventing a fast data producer from overwhelming a slower data consumer.





