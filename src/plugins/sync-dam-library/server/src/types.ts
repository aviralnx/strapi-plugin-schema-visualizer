/**
 * Type definitions for Cloudinary sync plugin
 */

export interface SyncStats {
  processed: number;
  uploaded: number;
  skipped: number;
  errors: Array<{ public_id: string; error: string }>;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  resourceType: string;
  folderPath: string;
  maxResults: number;
  overwrite: boolean;
  syncInterval: number;
}

export interface CloudinaryResource {
  display_name: any;
  asset_id: any;
  public_id: string;
  format: string;
  resource_type: string;
  secure_url: string;
  url: string;
}
