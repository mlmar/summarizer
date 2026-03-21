export const githubModelsConfig = {
    endpoint: process.env.GITHUB_MODELS_BASE_URL ?? 'https://models.inference.ai.azure.com',
    model: process.env.GITHUB_MODEL ?? 'gpt-4o',
    maxTokens: 2048
} as const;
