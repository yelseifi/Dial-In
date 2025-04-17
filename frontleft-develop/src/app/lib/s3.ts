import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME || '';

// Function to generate a unique filename
const generateUniqueFilename = (originalFilename: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};

// Function to upload a file to S3
export const uploadToS3 = async (
  file: File,
  folder: 'images' | 'videos' | 'videos-miami' = 'images'
): Promise<{ url: string; key: string }> => {
  try {
    console.log('Uploading file to S3:', file.name);
    const uniqueFilename = generateUniqueFilename(file.name);
    const key = `${uniqueFilename}`;
    
    // Convert File to Buffer
    const buffer = await file.arrayBuffer();

    let bucketName = BUCKET_NAME;
    if (folder === 'videos-miami') {
      bucketName = 'frontleft-video-miami-bucket';
    }
    
    // Create the command with ACL header that matches the bucket policy
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: file.type,
      ACL: 'bucket-owner-full-control', 
    });
    
    // Upload the file
    await s3Client.send(command);
    
    // Generate a download URL (not the upload URL)
    const downloadCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });


    
    // Generate a signed URL that expires in 7 days
    const signedUrl = await getSignedUrl(s3Client, downloadCommand, { expiresIn: 3600 * 24 * 7 });
    
    return {
      url: signedUrl,
      key: key,
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
};

// Function to upload an image to S3
export const uploadImage = async (file: File): Promise<{ url: string; key: string }> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }
  return uploadToS3(file, 'images');
};

// Function to upload a video to S3
export const uploadVideo = async (file: File): Promise<{ url: string; key: string }> => {
  if (!file.type.startsWith('video/')) {
    throw new Error('File must be a video');
  }
  return uploadToS3(file, 'videos');
};

export const uploadVideoForMiami = async (file: File): Promise<{ url: string; key: string }> => {
  if (!file.type.startsWith('video/')) {
    throw new Error('File must be a video');
  }
  return uploadToS3(file, 'videos-miami');
};

// Function to get a signed URL for an existing S3 object
export const getSignedUrlForDownload = async (key: string, bucket_name?: string): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket_name || BUCKET_NAME,
      Key: key,
    });
    
    // Generate URL valid for 7 days (168 hours)
    return await getSignedUrl(s3Client, command, {
      expiresIn: 168 * 3600 // 7 days in seconds
    });
  } catch (error) {
    console.error('Error generating signed download URL:', error);
    throw new Error('Failed to generate download URL');
  }
};

export const getPreviewUrl = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: "frontleft-video-preview-bucket",
    Key: `preview_${key}`,
  });
  return await getSignedUrl(s3Client, command, { expiresIn: 168 * 3600 });
};