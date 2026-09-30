// Tests E2E de la gestion des étudiants (plan de tests : E2E-04 à E2E-09).
// Tous les appels à /api/etudiants sont simulés avec cy.intercept() : le back-end n'est pas nécessaire.
describe('Gestion des étudiants', () => {

  // Données renvoyées par la fausse API
  const etudiants = [
    { id: 1, firstName: 'Marie', lastName: 'Curie', email: 'marie@test.fr', birthDate: '2001-05-17', training: 'Physique' },
    { id: 2, firstName: 'Pierre', lastName: 'Curie', email: 'pierre@test.fr', birthDate: '2000-03-02', training: 'Chimie' }
  ];

  // Avant chaque test : l'agent est déjà connecté et arrive sur la liste.
  // La connexion par le formulaire est déjà testée par E2E-02 ; ici on range directement un token
  // dans le sessionStorage AVANT le chargement de la page (onBeforeLoad), comme après une vraie connexion.
  beforeEach(() => {
    cy.intercept('GET', '/api/etudiants', { statusCode: 200, body: etudiants }).as('liste');
    cy.visit('/etudiants', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('token', 'faux-token-jwt');
      }
    });
    cy.wait('@liste');
  });

  // E2E-04 : la liste affiche une ligne par étudiant
  it('affiche la liste des étudiants', () => {
    cy.get('tbody tr').should('have.length', 2);
    cy.get('tbody tr').first().should('contain', 'Marie').and('contain', 'marie@test.fr').and('contain', 'Physique');
  });

  // E2E-05 : le bouton "Détail" affiche toutes les informations d'un étudiant
  it('affiche le détail d\'un étudiant', () => {
    cy.intercept('GET', '/api/etudiants/1', { statusCode: 200, body: etudiants[0] }).as('detail');

    cy.get('tbody tr').first().contains('a', 'Détail').click();

    cy.wait('@detail');
    cy.url().should('include', '/etudiants/1');
    cy.contains('Détail de l\'étudiant').should('be.visible');
    cy.contains('marie@test.fr').should('be.visible');
    cy.contains('17/05/2001').should('be.visible'); // date mise en forme par le pipe Angular
  });

  // E2E-06 : ajout d'un étudiant par le formulaire
  it('ajoute un étudiant', () => {
    const nouveau = { firstName: 'Irène', lastName: 'Joliot', email: 'irene@test.fr', birthDate: '2002-09-12', training: 'Master Chimie' };
    cy.intercept('POST', '/api/etudiants', { statusCode: 201, body: { id: 3, ...nouveau } }).as('creation');
    // Après l'enregistrement, la liste rechargée contient le nouvel étudiant
    // (une interception déclarée plus tard remplace la précédente pour la même URL)
    cy.intercept('GET', '/api/etudiants', { statusCode: 200, body: [...etudiants, { id: 3, ...nouveau }] }).as('listeApresAjout');

    cy.contains('a', 'Ajouter un étudiant').click();
    cy.url().should('include', '/etudiants/new');
    cy.get('#firstName').type(nouveau.firstName);
    cy.get('#lastName').type(nouveau.lastName);
    cy.get('#email').type(nouveau.email);
    cy.get('#birthDate').type(nouveau.birthDate); // champ date : saisie au format AAAA-MM-JJ
    cy.get('#training').type(nouveau.training);
    cy.contains('button', 'Enregistrer').click();

    // La requête contient exactement la saisie, puis retour à la liste qui compte 3 lignes
    cy.wait('@creation').its('request.body').should('deep.equal', nouveau);
    cy.wait('@listeApresAjout');
    cy.url().should('match', /\/etudiants$/);
    cy.get('tbody tr').should('have.length', 3);
  });

  // E2E-07 : modification d'un étudiant (formulaire pré-rempli)
  it('modifie un étudiant', () => {
    cy.intercept('GET', '/api/etudiants/1', { statusCode: 200, body: etudiants[0] }).as('chargement');
    cy.intercept('PUT', '/api/etudiants/1', { statusCode: 200, body: { ...etudiants[0], training: 'Doctorat Chimie' } }).as('modification');

    cy.get('tbody tr').first().contains('a', 'Modifier').click();
    cy.wait('@chargement');
    cy.url().should('include', '/etudiants/1/edit');
    // Le formulaire est pré-rempli avec les valeurs actuelles
    cy.get('#email').should('have.value', 'marie@test.fr');
    cy.get('#training').should('have.value', 'Physique');

    cy.get('#training').clear().type('Doctorat Chimie');
    cy.contains('button', 'Enregistrer').click();

    cy.wait('@modification').its('request.body.training').should('equal', 'Doctorat Chimie');
    cy.url().should('match', /\/etudiants$/);
  });

  // E2E-08 : suppression confirmée d'un étudiant
  it('supprime un étudiant après confirmation', () => {
    cy.intercept('DELETE', '/api/etudiants/1', { statusCode: 204 }).as('suppression');
    // La boîte confirm() du navigateur : on vérifie son texte et on répond "OK" (true)
    cy.on('window:confirm', (texte) => {
      expect(texte).to.equal('Supprimer l\'étudiant Marie Curie ?');
      return true;
    });

    cy.get('tbody tr').first().contains('button', 'Supprimer').click();

    cy.wait('@suppression');
    cy.get('tbody tr').should('have.length', 1);
    cy.contains('marie@test.fr').should('not.exist');
  });

  // E2E-09 : déconnexion, puis écrans étudiants à nouveau inaccessibles
  it('déconnecte l\'agent', () => {
    cy.contains('button', 'Se déconnecter').click();

    cy.url().should('include', '/login');
    cy.window().its('sessionStorage').invoke('getItem', 'token').should('be.null');
    // Le guard bloque à nouveau l'accès à la liste
    cy.visit('/etudiants');
    cy.url().should('include', '/login');
  });
});
