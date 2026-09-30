// Configuration de Cypress (tests de bout en bout, dits "E2E").
// Même format que jest.config.js (module.exports) pour rester cohérent avec le projet.
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Adresse de l'application testée : le serveur de développement Angular (npm run start) doit tourner.
    // Le back-end n'est PAS nécessaire : les appels /api/... sont simulés dans les tests avec cy.intercept().
    // Pour la mesure de couverture, npm run e2e:coverage remplace cette adresse par la version instrumentée (port 4201).
    baseUrl: 'http://localhost:4200',
    // Emplacement des fichiers de test E2E
    specPattern: 'cypress/e2e/**/*.cy.ts',
    // Fichier chargé avant les tests : il branche la récupération de la couverture (@cypress/code-coverage)
    supportFile: 'cypress/support/e2e.ts',
    // La couverture est désactivée par défaut (npm run e2e) ; npm run e2e:coverage l'active (--env coverage=true)
    env: { coverage: false },
    // Côté Node.js (hors navigateur) : enregistre les tâches de @cypress/code-coverage, qui fusionnent
    // les compteurs de chaque test puis génèrent le rapport à la fin (réglages dans .nycrc.json)
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
  },
  // Pas de vidéo de chaque test (fichiers lourds) ; une capture d'écran est prise seulement en cas d'échec
  video: false,
  screenshotOnRunFailure: true,
});
