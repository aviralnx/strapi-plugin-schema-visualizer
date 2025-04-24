declare module 'cloudinary' {
  namespace v2 {
    function config(options: {
      cloud_name: string;
      api_key: string;
      api_secret: string;
      secure?: boolean;
    }): void;

    namespace api {
      function resources(options: any): Promise<{
        resources: Array<{
          asset_id: string;
          public_id: string;
          format: string;
          resource_type: string;
          secure_url: string;
          url: string;
        }>;
        next_cursor?: string;
      }>;
    }
  }
}
