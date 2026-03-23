export const githubModelsConfig = {
    endpoint: 'https://models.inference.ai.azure.com',
    model: process.env.GITHUB_MODEL ?? 'gpt-4o-mini'
} as const;
