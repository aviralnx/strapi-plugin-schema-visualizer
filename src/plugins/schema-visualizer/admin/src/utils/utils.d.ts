// Declaration file for JavaScript modules

declare module '../utils/getTrad' {
  const getTrad: (id: string) => string;
  export default getTrad;
}

declare module '../utils/storm-react-diagrams' {
  export const DiagramWidget: any;
}

declare module '../utils/dagreLayout' {
  export const dagreLayout: (model: any) => void;
}

declare module '../utils/erChart' {
  export const drawEntityNodes: (data: any, options: {
    relations: boolean,
    components: boolean,
    dynamiczones: boolean
  }) => {
    engine: any,
    model: any
  };
}

declare module '../utils/trChart' {
  export const drawDatabaseNodes: (data: any, options: {
    relations: boolean,
    components: boolean,
    dynamiczones: boolean
  }) => {
    engine: any,
    model: any
  };
}

// Create declaration for the missing requests module
declare module '../utils/requests' {
  export const getTablesRelationData: () => Promise<any>;
  export const getEntitiesRelationData: () => Promise<any>;
}
