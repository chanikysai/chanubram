// Mock image uploader service
// In a real application, this would interact with a service like Cloudinary or S3.

export const uploadImage = async (imageFile: File): Promise<string> => {
  console.log('Mock uploading image:', imageFile.name);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate successful upload by returning a placeholder URL
  // In a real scenario, you'd get a URL from the upload service.
  const placeholderUrl = `https://example.com/images/${imageFile.name}-${Date.now()}.jpg`;
  console.log(`Mock upload successful. Returning URL: ${placeholderUrl}`);

  return placeholderUrl;
};
