// Test E2E du formulaire d'inscription (plan de tests : E2E-01).
// Un vrai navigateur ouvre l'application et agit comme un utilisateur : il remplit les champs et clique.
// L'API n'est pas appelée : cy.intercept() "attrape" la requête et renvoie une réponse préparée (mock).
describe('Inscription d\'un agent', () => {

  it('inscrit un agent puis redirige vers la page de connexion', () => {
    // GIVEN : POST /api/register répondra 201 (comme le vrai back-end) ; "as" donne un nom à l'interception
    cy.intercept('POST', '/api/register', { statusCode: 201 }).as('register');
    // L'application affiche alert('SUCCESS!! :-)') : Cypress l'accepte automatiquement,
    // on enregistre simplement son texte pour le vérifier
    const alerts: string[] = [];
    cy.on('window:alert', (text) => alerts.push(text));

    // WHEN : l'agent ouvre /register, remplit le formulaire et clique sur "Register"
    cy.visit('/register');
    cy.get('input[formcontrolname="firstName"]').type('John');
    cy.get('input[formcontrolname="lastName"]').type('Doe');
    cy.get('input[formcontrolname="login"]').type('jdoe');
    cy.get('input[formcontrolname="password"]').type('secret');
    cy.contains('button', 'Register').click();

    // THEN : la requête envoyée contient les données saisies…
    cy.wait('@register').its('request.body').should('deep.equal', {
      firstName: 'John', lastName: 'Doe', login: 'jdoe', password: 'secret'
    });
    // … le message de succès a été affiché et l'agent arrive sur la page de connexion
    cy.wrap(alerts).should('deep.equal', ['SUCCESS!! :-)']);
    cy.url().should('include', '/login');
  });
});
