import {
  Badge,
  Box,
  Divider,
  Tooltip,
  Typography,
} from "@strapi/design-system";
import { useTheme } from "styled-components";
import { Handle, Position } from "reactflow";
import { RelationIcon } from "./RelationIcon";
// import { getIcon } from "../utils/themeUtils";
import "./CustomNode.css";
import { PuzzlePiece } from "@strapi/icons";

export function CustomNode({ data }) {
  let attributesToShow = Object.entries(data.attributes);

  if (data.options.showRelationsOnly) {
    attributesToShow = attributesToShow.filter((x) => x[1].type === "relation");
  }

  if (!data.options.showDefaultFields) {
    attributesToShow = attributesToShow.filter(
      (x) =>
        !(
          x[0] === "updatedAt" ||
          x[0] === "createdAt" ||
          x[0] === "updatedBy" ||
          x[0] === "createdBy" ||
          x[0] === "publishedAt"
        )
    );
  }

  const theme = useTheme();
  return (
    <Box
      background="neutral0"
      shadow="tableShadow"
      hasRadius
      padding="16px 24px"
      className="cte-plugin-box"
    >
      <Typography
        fontWeight="bold"
        textColor="buttonPrimary500"
        padding="16px"
        className="cte-plugin-header nodrag"
      >
        {data.info.displayName}
      </Typography>

      <br />
      <Typography
        textColor="neutral400"
        padding="16px"
        className="cte-plugin-header nodrag"
      >
        {data.key}
        <Handle
          type="target"
          position={Position.Top}
          style={{
            borderColor: theme.colors.neutral200,
            background: theme.colors.neutral0,
            width: 12,
            height: 12,
          }}
        />
      </Typography>

      <Divider style={{ margin: "8px 0" }} />

      {attributesToShow.map((attr) => {
        return (
          <Typography key={attr[0]}>
            <div className="cte-plugin-field">
              <p className="cte-plugin-line nodrag">{attr[0]}</p>

              {data.options.showTypes && (
                <Badge
                  size="M"
                  backgroundColor="neutral0"
                  textColor="neutral400"
                >
                  {attr[1].type}
                </Badge>
              )}

              {attr[1].type === "relation" && (
                <>
                  <Tooltip description={`${attr[1].relation || 'relation'} - ${attr[1].target || 'unknown'}`}>
                    <RelationIcon theme={theme}>
                      <PuzzlePiece />
                    </RelationIcon>
                  </Tooltip>
                  <Handle
                    type="source"
                    id={attr[0]}
                    position={Position.Right}
                    className="cte-plugin-handle"
                    style={{
                      borderColor: theme.colors.buttonPrimary500,
                      background: theme.colors.neutral0,
                      width: 10,
                      height: 10,
                      right: -10,
                      zIndex: 10,
                    }}
                  />
                </>
              )}
            </div>
          </Typography>
        );
      })}
    </Box>
  );
}
