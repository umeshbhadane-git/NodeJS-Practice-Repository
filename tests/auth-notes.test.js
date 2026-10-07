import { describe, test, expect, beforeEach } from "vitest";
import request from "supertest";

import app from "../server";

const users = require("../data/users");
const notes = require("../data/notes");


// ========================================
// Reset in-memory data before every test
// ========================================

beforeEach(() => {

    // Reset users

    users.length = 0;


    // Reset notes

    notes.length = 0;

    notes.push(
        {
            id: 1,
            userId: 1,
            title: "User 1 Note",
            content: "This belongs to user 1",
            attachment: null
        },
        {
            id: 2,
            userId: 2,
            title: "User 2 Note",
            content: "This belongs to user 2",
            attachment: null
        }
    );

});


// ========================================
// AUTH + NOTES FLOW
// ========================================

describe("Auth and Notes API", () => {

    test(
        "Register → login → create note → read note",
        async () => {

            // --------------------------------
            // 1. Register
            // --------------------------------

            const registerResponse =
                await request(app)
                    .post("/auth/register")
                    .send({
                        name: "Umesh",
                        email: "umesh@test.com",
                        password: "password123"
                    });


            expect(registerResponse.status).toBe(201);

            expect(
                registerResponse.body.success
            ).toBe(true);

            expect(
                registerResponse.body.data.email
            ).toBe("umesh@test.com");


            // --------------------------------
            // 2. Login
            // --------------------------------

            const loginResponse =
                await request(app)
                    .post("/auth/login")
                    .send({
                        email: "umesh@test.com",
                        password: "password123"
                    });


            expect(loginResponse.status).toBe(200);

            expect(
                loginResponse.body.success
            ).toBe(true);

            expect(
                loginResponse.body.token
            ).toBeDefined();


            const token =
                loginResponse.body.token;


            // --------------------------------
            // 3. Create note
            // --------------------------------

            const createResponse =
                await request(app)
                    .post("/notes")
                    .set(
                        "Authorization",
                        `Bearer ${token}`
                    )
                    .send({
                        title: "My Test Note",
                        content: "Created during testing"
                    });


            expect(createResponse.status).toBe(201);

            expect(
                createResponse.body.success
            ).toBe(true);

            expect(
                createResponse.body.data.title
            ).toBe("My Test Note");


            const noteId =
                createResponse.body.data.id;


            // --------------------------------
            // 4. Read note
            // --------------------------------

            const readResponse =
                await request(app)
                    .get(`/notes/${noteId}`)
                    .set(
                        "Authorization",
                        `Bearer ${token}`
                    );


            expect(readResponse.status).toBe(200);

            expect(
                readResponse.body.success
            ).toBe(true);

            expect(
                readResponse.body.data.id
            ).toBe(noteId);

            expect(
                readResponse.body.data.title
            ).toBe("My Test Note");

        }
    );


    // ========================================
    // INVALID / MISSING TOKEN
    // ========================================

    test(
        "Reject request without a token",
        async () => {

            const response =
                await request(app)
                    .get("/notes");


            expect(response.status).toBe(401);

            expect(
                response.body.success
            ).toBe(false);

            expect(
                response.body.error.message
            ).toBe("Authentication required");

        }
    );


    test(
        "Reject request with an invalid token",
        async () => {

            const response =
                await request(app)
                    .get("/notes")
                    .set(
                        "Authorization",
                        "Bearer invalid-token"
                    );


            expect(response.status).toBe(401);

            expect(
                response.body.success
            ).toBe(false);

            expect(
                response.body.error.message
            ).toBe("Invalid or expired token");

        }
    );


    // ========================================
    // USER OWNERSHIP
    // ========================================

    test(
        "Reject access to another user's note",
        async () => {

            // --------------------------------
            // Register User 1
            // --------------------------------

            const user1 =
                await request(app)
                    .post("/auth/register")
                    .send({
                        name: "Umesh",
                        email: "umesh@test.com",
                        password: "password123"
                    });


            expect(user1.status).toBe(201);


            // --------------------------------
            // Login User 1
            // --------------------------------

            const login1 =
                await request(app)
                    .post("/auth/login")
                    .send({
                        email: "umesh@test.com",
                        password: "password123"
                    });


            expect(login1.status).toBe(200);


            const token =
                login1.body.token;


            // --------------------------------
            // Note 2 belongs to User 2
            // --------------------------------
            //
            // data/notes.js:
            //
            // {
            //     id: 2,
            //     userId: 2,
            //     ...
            // }
            //
            // User 1 tries to access it.
            // --------------------------------

            const response =
                await request(app)
                    .get("/notes/2")
                    .set(
                        "Authorization",
                        `Bearer ${token}`
                    );


            expect(response.status).toBe(404);

            expect(
                response.body.success
            ).toBe(false);

            expect(
                response.body.error.message
            ).toBe("Note not found");

        }
    );


    // ========================================
    // USER OWNERSHIP - PATCH
    // ========================================

    test(
        "Reject updating another user's note",
        async () => {

            await request(app)
                .post("/auth/register")
                .send({
                    name: "Umesh",
                    email: "umesh@test.com",
                    password: "password123"
                });


            const login =
                await request(app)
                    .post("/auth/login")
                    .send({
                        email: "umesh@test.com",
                        password: "password123"
                    });


            const token = login.body.token;


            const response =
                await request(app)
                    .patch("/notes/2")
                    .set(
                        "Authorization",
                        `Bearer ${token}`
                    )
                    .send({
                        title: "Hacked title"
                    });


            expect(response.status).toBe(404);

            expect(
                response.body.error.message
            ).toBe("Note not found");

        }
    );


    // ========================================
    // USER OWNERSHIP - DELETE
    // ========================================

    test(
        "Reject deleting another user's note",
        async () => {

            await request(app)
                .post("/auth/register")
                .send({
                    name: "Umesh",
                    email: "umesh@test.com",
                    password: "password123"
                });


            const login =
                await request(app)
                    .post("/auth/login")
                    .send({
                        email: "umesh@test.com",
                        password: "password123"
                    });


            const token = login.body.token;


            const response =
                await request(app)
                    .delete("/notes/2")
                    .set(
                        "Authorization",
                        `Bearer ${token}`
                    );


            expect(response.status).toBe(404);

            expect(
                response.body.error.message
            ).toBe("Note not found");

        }
    );

});