import type { Schema, Struct } from '@strapi/strapi';

export interface UtilitiesNavigation extends Struct.ComponentSchema {
  collectionName: 'components_utilities_navigations';
  info: {
    displayName: 'Navigation';
  };
  attributes: {
    Editor: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'utilities.navigation': UtilitiesNavigation;
    }
  }
}
