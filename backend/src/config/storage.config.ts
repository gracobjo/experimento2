import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  // AWS S3 Configuration
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.AWS_S3_BUCKET_NAME || 'experimento2-documents',
  },
  
  // Storage Type: 'local' | 's3' | 'hybrid'
  type: process.env.STORAGE_TYPE || 'local',
  
  // Local storage fallback
  local: {
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  },
  
  // CDN configuration
  cdn: {
    baseUrl: process.env.CDN_BASE_URL,
    enabled: process.env.CDN_ENABLED === 'true',
  },
}));
