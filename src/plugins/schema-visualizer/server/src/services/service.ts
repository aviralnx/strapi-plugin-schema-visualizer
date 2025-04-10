import type { Core } from '@strapi/strapi';

// Adding Meta type for better type safety
interface Meta {
  uid: string;
  tableName: string;
  attributes: Record<string, any>;
  indexes?: any[];
  foreignKeys?: any[];
  columnToAttribute?: Record<string, string>;
  componentLink?: any; // Added because it's used in the code
}

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  getWelcomeMessage() {
    return 'Welcome to Strapi 🚀';
  },
  getTablesRelationData: async () => {
    const exclude = strapi.config.get('plugin.schema-visualizer.exclude') as string[] ?? [];
    const uids = Array.from(strapi.db.metadata.keys()).filter((uid: string) => !exclude.includes(uid));

    return uids.map((uid: string) => {
      const model = strapi.db.metadata.get(uid) as Meta;

      return {
        key: model.uid,
        name: model.tableName,
        attributes: model.attributes,
        componentLink: model.componentLink,
        indexes: model.indexes,
        foreignKeys: model.foreignKeys,
        columnToAttribute: model.columnToAttribute,
      };
    });
  },
  getEntitiesRelationData: async () => {
    const exclude = strapi.config.get('plugin.schema-visualizer.exclude') as string[] ?? [];
    const uids = Array.from(strapi.db.metadata.keys()).filter((uid: string) => !exclude.includes(uid));

    return uids.map((uid: string) => {
      const model = strapi.db.metadata.get(uid) as Meta;

      // Infer model type based on naming conventions or other metadata
      const isComponent = model.tableName.startsWith('components_');
      const kind = isComponent ? 'component' : 'collectionType'; // Example inference

      return {
        key: model.uid,
        name: model.tableName,
        attributes: model.attributes,
        modelType: '',
        kind, // Add inferred kind
      };
    });
  },
});

export default service;
