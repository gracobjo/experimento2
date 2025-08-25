// Configuración de almacenamiento local
export const STORAGE_CONFIG = {
  // Tipo de almacenamiento
  type: 'local' as const,
  
  // Directorio base para uploads
  uploadPath: process.env.UPLOAD_DEST || './uploads',
  
  // Tamaño máximo de archivo (10MB por defecto)
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
  
  // Tipos de archivo permitidos
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ],
  
  // Estructura de directorios
  directories: {
    documents: 'documents',
    temp: 'temp',
    backup: 'backup'
  },
  
  // Configuración de URLs
  baseUrl: process.env.BASE_URL || '',
  
  // Configuración de seguridad
  security: {
    // Validar extensión de archivo
    validateExtension: true,
    // Sanitizar nombres de archivo
    sanitizeFilename: true,
    // Permitir sobrescribir archivos
    allowOverwrite: false
  }
};

// Función para obtener ruta completa de upload
export function getUploadPath(subPath: string = ''): string {
  const basePath = STORAGE_CONFIG.uploadPath;
  return subPath ? `${basePath}/${subPath}` : basePath;
}

// Función para obtener URL pública de archivo
export function getPublicUrl(filePath: string): string {
  const baseUrl = STORAGE_CONFIG.baseUrl;
  return `${baseUrl}/uploads/${filePath}`;
}

// Función para validar tipo de archivo
export function isValidFileType(mimeType: string): boolean {
  return STORAGE_CONFIG.allowedMimeTypes.includes(mimeType);
}

// Función para validar tamaño de archivo
export function isValidFileSize(size: number): boolean {
  return size <= STORAGE_CONFIG.maxFileSize;
}

// Función para sanitizar nombre de archivo
export function sanitizeFilename(filename: string): string {
  if (!STORAGE_CONFIG.security.sanitizeFilename) {
    return filename;
  }
  
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

// Función para generar ruta de archivo basada en expediente
export function generateFilePath(expedienteId: string, filename: string): string {
  const sanitizedFilename = sanitizeFilename(filename);
  const expedienteDir = expedienteId || 'general';
  
  return `${STORAGE_CONFIG.directories.documents}/${expedienteDir}/${sanitizedFilename}`;
}

// Función para obtener ruta completa del archivo
export function getFullFilePath(expedienteId: string, filename: string): string {
  const relativePath = generateFilePath(expedienteId, filename);
  return getUploadPath(relativePath);
}

// Función para verificar si el archivo existe
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const fs = await import('fs/promises');
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Función para crear directorio si no existe
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    const fs = await import('fs/promises');
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`Error creando directorio ${dirPath}:`, error);
    throw error;
  }
}

// Función para obtener información del archivo
export async function getFileInfo(filePath: string) {
  try {
    const fs = await import('fs/promises');
    const stats = await fs.stat(filePath);
    
    return {
      exists: true,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory()
    };
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Función para limpiar archivos temporales
export async function cleanupTempFiles(): Promise<void> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const tempPath = getUploadPath(STORAGE_CONFIG.directories.temp);
    
    if (await fileExists(tempPath)) {
      const files = await fs.readdir(tempPath);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas
      
      for (const file of files) {
        const filePath = path.join(tempPath, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          console.log(`🗑️  Archivo temporal eliminado: ${file}`);
        }
      }
    }
  } catch (error) {
    console.error('Error limpiando archivos temporales:', error);
  }
}

// Función para obtener estadísticas de almacenamiento
export async function getStorageStats() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const basePath = STORAGE_CONFIG.uploadPath;
    const documentsPath = getUploadPath(STORAGE_CONFIG.directories.documents);
    
    let totalFiles = 0;
    let totalSize = 0;
    let expedientesCount = 0;
    
    if (await fileExists(documentsPath)) {
      const expedientes = await fs.readdir(documentsPath);
      expedientesCount = expedientes.length;
      
      for (const expediente of expedientes) {
        const expedientePath = path.join(documentsPath, expediente);
        const expedienteStats = await fs.stat(expedientePath);
        
        if (expedienteStats.isDirectory()) {
          const files = await fs.readdir(expedientePath);
          totalFiles += files.length;
          
          for (const file of files) {
            const filePath = path.join(expedientePath, file);
            const fileStats = await fs.stat(filePath);
            totalSize += fileStats.size;
          }
        }
      }
    }
    
    return {
      totalFiles,
      totalSize,
      expedientesCount,
      maxFileSize: STORAGE_CONFIG.maxFileSize,
      uploadPath: basePath
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas de almacenamiento:', error);
    return {
      error: error instanceof Error ? error.message : String(error)
    };
  }
}









