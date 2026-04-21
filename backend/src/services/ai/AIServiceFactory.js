const OpenAIProvider = require('./providers/OpenAIProvider');
const ReplicateProvider = require('./providers/ReplicateProvider');

const PROVIDERS = {
  openai: OpenAIProvider,
  replicate: ReplicateProvider,
};

/**
 * Factory : retourne le provider configuré par AI_PROVIDER (env).
 * Changer de provider = changer une variable d'environnement.
 */
const getAIProvider = (providerName) => {
  const name = providerName || process.env.AI_PROVIDER || 'openai';
  const Provider = PROVIDERS[name];
  if (!Provider) throw new Error(`Provider IA inconnu : "${name}". Disponibles : ${Object.keys(PROVIDERS).join(', ')}`);
  return new Provider();
};

module.exports = { getAIProvider };
