import api from './api';
import { AIJob } from '../types';

export const aiService = {
  async enhancePhoto(
    imageUri: string,
    options?: { photoId?: string; operations?: string[]; analyzeWithAI?: boolean }
  ): Promise<{ jobId: string; status: AIJob['status'] }> {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeMap: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

    formData.append('photo', { uri: imageUri, name: filename, type: mimeMap[ext] || 'image/jpeg' } as any);
    if (options?.photoId) formData.append('photoId', options.photoId);
    if (options?.operations) formData.append('operations', options.operations.join(','));
    if (options?.analyzeWithAI) formData.append('options', JSON.stringify({ analyze: true }));

    const { data } = await api.post('/ai/photo-enhance', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data.data;
  },

  async getJobStatus(jobId: string): Promise<AIJob> {
    const { data } = await api.get(`/ai/jobs/${jobId}`);
    return data.data;
  },

  async listJobs(): Promise<AIJob[]> {
    const { data } = await api.get('/ai/jobs');
    return data.data;
  },

  async pollJobUntilDone(jobId: string, onUpdate?: (job: AIJob) => void): Promise<AIJob> {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const job = await aiService.getJobStatus(jobId);
          onUpdate?.(job);
          if (job.status === 'done' || job.status === 'failed') {
            clearInterval(interval);
            job.status === 'done' ? resolve(job) : reject(new Error(job.errorMessage || 'Traitement échoué.'));
          }
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, 2000);
    });
  },
};
