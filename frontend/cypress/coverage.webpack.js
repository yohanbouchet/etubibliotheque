// Configuration webpack SUPPLÉMENTAIRE, utilisée uniquement par la version "tests E2E avec couverture"
// de l'application (cibles build-e2e / serve-e2e dans angular.json). L'application normale n'est pas concernée.
//
// Elle ajoute une étape : coverage-istanbul-loader insère des compteurs dans chaque fichier de src/app
// ("instrumentation"). Pendant les tests Cypress, ces compteurs notent chaque ligne exécutée dans
// window.__coverage__ ; @cypress/code-coverage les récupère ensuite pour produire le rapport.
const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        loader: '@jsdevtools/coverage-istanbul-loader',
        options: { esModules: true },
        // "post" : l'instrumentation se fait APRÈS la compilation TypeScript → JavaScript par Angular
        enforce: 'post',
        // Seul le code de l'application est mesuré…
        include: path.join(__dirname, '..', 'src', 'app'),
        // … sans les tests unitaires ni les bibliothèques
        exclude: [/\.spec\.ts$/, /node_modules/],
      },
    ],
  },
};
