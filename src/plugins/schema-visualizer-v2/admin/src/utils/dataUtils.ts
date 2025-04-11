// Define interfaces for all data structures
interface Attribute {
  type: string;
  target?: string;
  relation?: string;
}

interface ContentType {
  name: string;
  key: string;
  attributes: Record<string, Attribute>;
  info: {
    displayName: string;
    [key: string]: any;
  };
}

interface Options {
  edgeType: string;
  showEdges: boolean;
  [key: string]: any;
}

interface Node {
  id: string;
  position: {
    x: number;
    y: number;
  };
  type: string;
  data: {
    options: Options;
    [key: string]: any;
  };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type: string;
  hidden: boolean;
  sourceHandle?: string;
  label?: string;
  animated?: boolean;
  style?: object;
  data?: {
    relation?: string;
  };
}

const CARDS_PER_ROW = 6;

export function createNodes(contentTypes: ContentType[], options: Options): Node[] {
  let newNodes: Node[] = [];
  contentTypes.forEach(
    (node: ContentType, index: number) => {
      if (!node || !node.key) {
        console.error("Invalid node data:", node);
        return;
      }
      
      newNodes.push({
        id: node.key,
        position: {
          x: (index % CARDS_PER_ROW) * 320,
          y: Math.floor(index / CARDS_PER_ROW) * 560 + (index % 2) * 48,
        },
        type: "special",
        data: {
          ...node,
          options: options,
        },
      });
    }
  );
  return newNodes;
}

export function updateNodes(nodes: Node[], options: Options): Node[] {
  return nodes.map((node: Node) => ({
    ...node,
    data: { ...node.data, options: options },
  }));
}

export function createEdegs(contentTypes: ContentType[], options: Options): Edge[] {
  console.log("Creating edges from content types:", contentTypes);
  const newEdges: Edge[] = [];

  // First pass - collect all relation references
  contentTypes.forEach((source: ContentType) => {
    if (!source || !source.attributes) {
      console.error("Invalid source content type:", source);
      return;
    }

    Object.entries(source.attributes).forEach(([attrName, attr]) => {
      if (attr.type === "relation" && attr.target) {
        console.log(`Found relation in ${source.key}.${attrName}: target=${attr.target}, relation=${attr.relation}`);
        
        // Check if target exists in our content types
        const targetContentType = contentTypes.find(ct => ct.key === attr.target);
        if (targetContentType) {
          const relationLabel = attr.relation || 'related';
          const edgeId = `edge-${source.key}-${attrName}-${attr.target}`;
          
          console.log(`Creating edge: ${edgeId} from ${source.key} to ${attr.target}`);
          
          newEdges.push({
            id: edgeId,
            source: source.key,
            target: attr.target,
            sourceHandle: attrName, // Connect from the attribute's handle
            type: options.edgeType,
            hidden: !options.showEdges,
            animated: true, // Make edges animated for better visibility
            label: relationLabel,
            style: {
              stroke: '#1677ff',
              strokeWidth: 2
            },
            data: {
              relation: relationLabel
            }
          });
        } else {
          console.warn(`Target content type ${attr.target} not found for relation ${source.key}.${attrName}`);
        }
      }
    });
  });

  console.log("Created edges:", newEdges);
  return newEdges;
}

export function updateEdges(edges: Edge[], options: Options): Edge[] {
  return edges.map((edge: Edge) => ({
    ...edge,
    type: options.edgeType,
    hidden: !options.showEdges,
  }));
}
