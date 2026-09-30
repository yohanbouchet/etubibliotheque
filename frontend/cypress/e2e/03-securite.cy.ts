// Test E2E de la sécurisation des écrans (plan de tests : E2E-03).
describe('Sécurité des écrans étudiants', () => {

  it('renvoie vers la page de connexion un agent non connecté', () => {
    // GIVEN : aucun token dans le sessionStorage (Cypress démarre chaque test avec un navigateur "vierge")
    // WHEN : l'agent tape directement l'adresse de la liste des étudiants
    cy.visit('/etudiants');

    // THEN : le guard (authGuard) l'a redirigé vers /login, et le formulaire de connexion est affiché
    cy.url().should('include', '/login');
    cy.contains('button', 'Se connecter').should('be.visible');
  });
});
