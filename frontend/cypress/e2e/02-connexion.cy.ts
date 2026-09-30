// Test E2E du formulaire de connexion (plan de tests : E2E-02).
describe('Connexion d\'un agent', () => {

  it('connecte l\'agent, conserve le token et affiche la liste des étudiants', () => {
    // GIVEN : les deux appels à l'API sont simulés
    //  - la connexion renvoie un faux token (le contenu importe peu : le back-end n'est pas appelé)
    //  - la liste des étudiants, affichée après la connexion, est vide
    cy.intercept('POST', '/api/login', { statusCode: 200, body: { token: 'faux-token-jwt' } }).as('login');
    cy.intercept('GET', '/api/etudiants', { statusCode: 200, body: [] }).as('etudiants');

    // WHEN : l'agent ouvre l'application (l'adresse vide redirige vers /login) et se connecte
    cy.visit('/');
    cy.url().should('include', '/login');
    cy.get('#login').type('jdoe');
    cy.get('#password').type('secret');
    cy.contains('button', 'Se connecter').click();

    // THEN : les identifiants ont été envoyés au format LoginRequest…
    cy.wait('@login').its('request.body').should('deep.equal', { login: 'jdoe', password: 'secret' });
    // … le token est rangé dans le sessionStorage du navigateur…
    cy.window().its('sessionStorage').invoke('getItem', 'token').should('equal', 'faux-token-jwt');
    // … l'agent arrive sur la liste des étudiants…
    cy.url().should('include', '/etudiants');
    // … dont l'appel porte bien l'en-tête ajouté par l'intercepteur Angular (Authorization: Bearer <token>)
    cy.wait('@etudiants').its('request.headers.authorization').should('equal', 'Bearer faux-token-jwt');
    cy.contains('Aucun étudiant pour le moment').should('be.visible');
  });
});
