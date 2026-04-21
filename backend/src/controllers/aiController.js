const AIJob = require('../models/AIJob');
const Photo = require('../models/Photo');
const ApiError = require('../utils/ApiError');
const asyncWrapper = require('../utils/asyncWrapper');
const { processAIJob } = require('../services/ai/AIJobService');
const logger = require('../utils/logger');

exports.enhancePhoto = asyncWrapper(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Aucun fichier fourni.');

  const { photoId, operations, options } = req.body;

  // Créer le job IA
  const job = await AIJob.create({
    user: req.user._id,
    photo: photoId || undefined,
    provider: process.env.AI_PROVIDER || 'openai',
    inputUrl: `/uploads/${req.file.filename}`,
    operations: operations ? operations.split(',') : ['enhance'],
    options: options ? JSON.parse(options) : {},
    status: 'pending',
  });

  // Sauvegarder la photo originale si pas déjà en base
  let photo = photoId ? await Photo.findById(photoId) : null;
  if (!photo) {
    photo = await Photo.create({
      user: req.user._id,
      originalUrl: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
    job.photo = photo._id;
    await job.save();
  }

  // Lancement asynchrone (ne bloque pas la réponse)
  processAIJob(job._id.toString()).catch((err) =>
    logger.error(`AIJob ${job._id} processing error:`, err.message)
  );

  res.status(202).json({
    success: true,
    message: 'Traitement IA démarré.',
    data: { jobId: job._id, status: job.status },
  });
});

exports.getJobStatus = asyncWrapper(async (req, res) => {
  const job = await AIJob.findOne({ _id: req.params.id, user: req.user._id });
  if (!job) throw ApiError.notFound('Job IA introuvable.');

  res.json({
    success: true,
    data: {
      jobId: job._id,
      status: job.status,
      inputUrl: job.inputUrl,
      outputUrl: job.outputUrl,
      errorMessage: job.errorMessage,
      processingMs: job.processingMs,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    },
  });
});

exports.listJobs = asyncWrapper(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = { user: req.user._id };
  if (status) query.status = status;

  const jobs = await AIJob.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(+limit);

  res.json({ success: true, data: jobs });
});
