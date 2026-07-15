export const planKeys = {
  public: ['plans', 'public'] as const,
  master: ['plans', 'master'] as const,
  masterDetail: (planId: string) => ['plans', 'master', planId] as const,
}
