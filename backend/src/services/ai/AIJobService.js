const AIJob = require('../../models/AIJob');
const Photo = require('../../models/Photo');
const { getAIProvider } = require('./AIServiceFactory');
const logger = require('../../utils/logger');

/**
 * Exécute un job IA de manière asynchrone.
 * En MVP : traitement immédiat (async).
 * En production : passer par une Bull queue.
 */
const processAIJob = async (jobId) => {
  const job = await AIJob.findById(jobId);
  if (!job) throw new Error(`Job ${jobId} introuvable`);

  job.status = 'processing';
  job.startedAt = new Date();
  await job.save();

  try {
    const provider = getAIProvider(job.provider);
    const inputPath = job.inputUrl.replace(/^\//, ''); // chemin relatif local

    const result = await provider.enhance(inputPath, job.options || {});

    job.status = 'done';
    job.outputUrl = result.outputUrl;
    job.completedAt = new Date();
    job.processingMs = job.completedAt - job.startedAt;
    await job.save();

    // Mise à jour de la photo si liée
    if (job.photo) {
      await Photo.findByIdAndUpdate(job.photo, {
        aiEnhanced: true,
        aiJobId: job._id,
      });
    }

    logger.info(`AIJob ${jobId} terminé en ${job.processingMs}ms`);
    return job;
  } catch (err) {
    job.status = 'failed';
    job.errorMessage = err.message;
    job.completedAt = new Date();
    await job.save();
    logger.error(`AIJob ${jobId} échoué:`, err.message);
    throw err;
  }
};

module.exports = { processAIJob };
