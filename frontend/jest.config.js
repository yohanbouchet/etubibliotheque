
module.exports = {
  preset: 'jest-preset-angular',
  roots: ['<rootDir>/src/'],
  testMatch: ['**/+(*.)+(spec).+(ts|js)'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  collectCoverage: true,
  // Mesure TOUS les fichiers de l'application, même ceux qu'aucun test ne charge (sinon la couverture est surestimée)
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',                       // les fichiers de test eux-mêmes
    '!src/app/core/models/**',                     // interfaces TypeScript : aucun code exécutable
    '!src/app/core/service/user-mock.service.ts',  // doublure utilisée uniquement par les tests
  ],
  // Rapport HTML (coverage/index.html) + résumé dans le terminal
  coverageReporters: ['html', 'text-summary'],
  // Seuil minimum : `npm test` ÉCHOUE sous 80 % (même principe que la règle JaCoCo du back-end)
  coverageThreshold: {
    global: { lines: 80, statements: 80 },
  },
};
