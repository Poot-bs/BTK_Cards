const { supabase } = require('../config/supabase');
const path = require('path');

const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'business-cards';

/**
 * Upload an image to Supabase Storage
 * @param {Buffer} fileBuffer - The file buffer from multer memory storage
 * @param {string} originalName - Original filename
 * @param {string} mimeType - File MIME type
 * @param {string} userId - User ID for organizing files
 * @returns {Promise<{url: string, path: string}>} - Public URL and storage path
 */
const uploadImage = async (fileBuffer, originalName, mimeType, userId) => {
  try {
    // Generate unique filename
    const fileExt = path.extname(originalName);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `${userId}/${uniqueSuffix}${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      path: fileName
    };
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    throw error;
  }
};

/**
 * Delete an image from Supabase Storage
 * @param {string} imageUrl - The full public URL of the image
 * @returns {Promise<boolean>} - Success status
 */
const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) return true;

    // Extract the file path from the URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const urlParts = imageUrl.split(`/storage/v1/object/public/${BUCKET_NAME}/`);
    
    if (urlParts.length < 2) {
      console.warn('Could not extract path from URL:', imageUrl);
      return false;
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting from Supabase:', error);
    return false;
  }
};

/**
 * Check if a URL is a Supabase storage URL
 * @param {string} url - The URL to check
 * @returns {boolean}
 */
const isSupabaseUrl = (url) => {
  if (!url) return false;
  return url.includes('supabase.co/storage');
};

module.exports = {
  uploadImage,
  deleteImage,
  isSupabaseUrl
};
