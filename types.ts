/** Informações passadas a dos os resolvers via contexto */
export interface Context {
  currentUserId?: string,
  [index: string]: any,
}