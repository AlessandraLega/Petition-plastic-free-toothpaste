const supertest = require("supertest");
const { app } = require("./index.js");
const cookieSession = require("cookie-session");
const db = require("./db");

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

/* Write tests to confirm that your POST route for signing the petition is working correctly. 
You will want to confirm that:
- When the input is good, the user is redirected to the thank you page
- When the input is bad, the response body contains an error message
Since you do not want to insert any signatures into your database when you run tests, 
you will have to use jest.mock to mock the module that does the query 
and then mock the resolved value of the relevant function. */
jest.mock("./db");
test("POST /petition redirects to /petition/signed if input is good", () => {
    db.addSignature.mockResolvedValue({
        rows: [{ id: 34 }],
    });
    cookieSession.mockSessionOnce({
        userId: 1,
    });
    return supertest(app)
        .post("/petition")
        .then((response) => {
            expect(response.header.location).toBe("/petition/signed");
        });
});
test("POST /petition contains error message if input is bad", () => {
    db.addSignature.mockResolvedValue();
    cookieSession.mockSessionOnce({
        userId: 1,
    });
    return supertest(app)
        .post("/petition")
        .then((response) => {
            expect(response.res.socket._httpMessage.path).toBe("/petition");
            expect(response.text).toContain(
                '<p class="error">something went wrong! Please sign in the white space!</p>'
            );
        });
});
