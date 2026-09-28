
// Event Emitter in Node JS

const EventEmitter = require("events");

const emitter = new EventEmitter();

// ------------------------------------------------------
// creating an Event

// emitter.on("Loggedin", () => {
//     console.log("User Loggedin");
// });

// // triggering an Event
// emitter.emit("Loggedin");

// -------------------------------------------

// Event with data

emitter.on("login", (username) => {

    console.log(`${username} logged in`);

});

emitter.emit("login", "Umesh");
