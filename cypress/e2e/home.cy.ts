/// <reference types="cypress" />

describe('Home API', () => {
  it('GET /homes should return list of homes', () => {
    cy.request('/api/homes') 
      .its('status')
      .should('eq', 200);
  });
});
