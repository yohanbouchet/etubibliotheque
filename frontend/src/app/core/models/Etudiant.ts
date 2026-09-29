// Un étudiant, tel qu'échangé avec l'API /api/etudiants (mêmes champs que EtudiantDTO côté back-end)
export interface Etudiant {
  // "?" = optionnel : l'id n'existe pas encore à la création (c'est MySQL qui l'attribue)
  id?: number,
  firstName: string,
  lastName: string,
  email: string,
  // Date au format texte "AAAA-MM-JJ" (ex. "2001-05-17"), le format attendu par le back-end
  birthDate: string,
  // Formation ou diplôme suivi
  training: string
}
