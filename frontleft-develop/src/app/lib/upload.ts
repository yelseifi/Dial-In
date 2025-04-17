import AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const bucketName = process.env.AWS_S3_BUCKET;

/**
 * Uploads a file to S3 and returns the URL
 */
export async function uploadToS3(
  fileBuffer: Buffer, 
  fileName: string, 
  contentType: string
): Promise<string> {
  // Create a unique file name to prevent collisions
  const uniqueFileName = `${Date.now()}-${fileName}`;
  
  const params = {
    Bucket: bucketName as string,
    Key: uniqueFileName,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: 'public-read',
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Processes a file upload from FormData
 */
export async function processFileUpload(
  formData: FormData, 
  fieldName: string
): Promise<{buffer: Buffer, fileName: string, contentType: string}> {
  const file = formData.get(fieldName) as File | null;
  
  if (!file) {
    throw new Error(`No file provided for ${fieldName}`);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  return {
    buffer,
    fileName: file.name,
    contentType: file.type,
  };
}

/**
 * Processes multiple file uploads from FormData
 */
export async function processMultipleFileUploads(
  formData: FormData, 
  fieldName: string
): Promise<{buffer: Buffer, fileName: string, contentType: string}[]> {
  const files: File[] = [];
  
  // Check if formData.getAll is available and use it
  if (typeof formData.getAll === 'function') {
    const allFiles = formData.getAll(fieldName) as File[];
    files.push(...allFiles);
  } else {
    // Fallback for environments where getAll isn't available
    const file = formData.get(fieldName) as File | null;
    if (file) files.push(file);
  }
  
  if (files.length === 0) {
    return [];
  }

  const filePromises = files.map(async (file) => {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    return {
      buffer,
      fileName: file.name,
      contentType: file.type,
    };
  });
  
  return Promise.all(filePromises);
}

/**
 * Uploads multiple files to S3 and returns the URLs
 */
export async function uploadMultipleToS3(
  files: {buffer: Buffer, fileName: string, contentType: string}[]
): Promise<string[]> {
  const uploadPromises = files.map(file => 
    uploadToS3(file.buffer, file.fileName, file.contentType)
  );
  
  return Promise.all(uploadPromises);
}

/**
 * Validates if the file type is allowed
 */
export function validateFileType(
  fileName: string, 
  allowedExtensions: string[]
): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  return allowedExtensions.includes(extension);
}

/**
 * Validates if the file size is within limits
 */
export function validateFileSize(
  fileSize: number, 
  maxSizeInMB: number
): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return fileSize <= maxSizeInBytes;
}