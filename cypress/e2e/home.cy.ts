/// <reference types="cypress" />

describe("Home API", () => {
  it("GET /home should return list of homes", () => {
    cy.request("/api/home").its("status").should("eq", 200);
  });
});
