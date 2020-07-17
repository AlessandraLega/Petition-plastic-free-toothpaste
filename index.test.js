const supertest = require("supertest");
const { app } = require("./index.js");
const cookieSession = require("cookie-session");
const { response } = require("express");

test("GET /profile sends 302 if not logged in", () => {
    cookieSession.mockSessionOnce({});
    return supertest(app)
        .get("/profile")
        .then((response) => {
            expect(response.statusCode).toBe(302);
        });
});

test("GET /profile redirects to register if not logged in", () => {
    cookieSession.mockSessionOnce({});
    return supertest(app)
        .get("/profile")
        .then((response) => {
            // console.log(response);
            expect(response.headers.location).toBe("/register");
        });
});

test("GET /login redirects to /petition if the user is logged in but hasn't signed yet", () => {
    cookieSession.mockSessionOnce({
        userId: "Alessandra",
    });
    return supertest(app)
        .get("/login")
        .then((response) => {
            expect(response.header.location).toBe("/petition");
        });
});

test("GET /register redirects to /petition if the user is logged in but hasn't signed yet", () => {
    cookieSession.mockSessionOnce({
        userId: 1,
    });
    return supertest(app)
        .get("/register")
        .then((response) => {
            expect(response.header.location).toBe("/petition");
        });
});

test("GET /petition redirects to /petition/signers if user has already signed", () => {
    cookieSession.mockSessionOnce({
        userId: 1,
        signatureId: 1,
    });
    return supertest(app)
        .get("/petition")
        .then((response) => {
            expect(response.header.location).toBe("/petition/signers");
        });
});

test("POST /petition redirects to /petition/signers if user has already signed", () => {
    cookieSession.mockSessionOnce({
        userId: 1,
        signatureId: 1,
    });
    return supertest(app)
        .post("/petition")
        .then((response) => {
            expect(response.header.location).toBe("/petition/signers");
        });
});

test("GET /petition/signed redirects to /petition if the user is logged it but hasn't signed yet", () => {
    cookieSession.mockSessionOnce({
        userId: 1,
    });
    return supertest(app)
        .get("/petition/signed")
        .then((response) => {
            expect(response.header.location).toBe("/petition");
        });
});
