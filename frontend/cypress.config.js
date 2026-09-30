// Configuration de Cypress (tests de bout en bout, dits "E2E").
// Même format que jest.config.js (module.exports) pour rester cohérent avec le projet.
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Adresse de l'application testée : le serveur de développement Angular (npm run start) doit tourner.
    // Le back-end n'est PAS nécessaire : les appels /api/... sont simulés dans les tests avec cy.intercept().
    baseUrl: 'http://localhost:4200',
    // Emplacement des fichiers de test E2E
    specPattern: 'cypress/e2e/**/*.cy.ts',
    // Pas de fichier "support" pour l'instant (commandes personnalisées) : on garde la configuration minimale
    supportFile: false,
  },
  // Pas de vidéo de chaque test (fichiers lourds) ; une capture d'écran est prise seulement en cas d'échec
  video: false,
  screenshotOnRunFailure: true,
});
