// Données envoyées à POST /api/login (mêmes champs que LoginRequestDTO côté back-end)
export interface LoginRequest {
  login: string,
  password: string
}
