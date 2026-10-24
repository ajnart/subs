declare module '#nitro/virtual/database' {
  export const connectionConfigs: Record<string, { options?: { path?: string } }>
}
