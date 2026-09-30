// Fichier chargé par Cypress avant chaque fichier de test (supportFile dans cypress.config.js).
// Il ajoute, autour de chaque test, la récupération des compteurs de couverture (window.__coverage__)
// présents dans la version instrumentée de l'application. Sans --env coverage=true, il ne fait rien.
import '@cypress/code-coverage/support';
