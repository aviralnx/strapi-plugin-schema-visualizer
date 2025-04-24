/**
 * Shared state module for the Cloudinary sync plugin
 */

// Export an object with a property instead of exporting the variable directly
// This allows us to modify the value without reassigning the export
export const state = {
  syncInterval: undefined as NodeJS.Timeout | undefined
};
