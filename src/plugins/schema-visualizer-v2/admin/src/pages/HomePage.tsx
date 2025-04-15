import "reactflow/dist/style.css";
import "./styles.css";
import React, { useEffect, useMemo, useRef, useCallback } from "react";
import { useFetchClient } from '@strapi/strapi/admin';
import { Layouts } from "@strapi/admin/strapi-admin";
import { Button, Modal } from "@strapi/design-system";
import { Search, Drag, Download, ArrowClockwise } from "@strapi/icons";
import { useTheme } from "styled-components";
import {
  SmartBezierEdge,
  SmartStepEdge,
  SmartStraightEdge,
} from "@tisoap/react-flow-smart-edge";
import { Background, ControlButton, Controls, ReactFlow, BackgroundVariant } from "reactflow";
import { getBackgroundColor } from "../utils/themeUtils";
import { useDigramStore } from "../store";
import { CustomNode } from "../components/CustomNode";
import { OptionsBar } from "../components/OptionsBar";
import { ExportModal } from "../components/ExportModal";

const useEffectSkipInitial = (func: () => void, deps: React.DependencyList) => {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) func();
    else didMount.current = true;
  }, deps);
};

// Memoized HomePage component to prevent unnecessary re-renders
const HomePage = React.memo(() => {
  const theme = useTheme();
  const { get } = useFetchClient();
  const {
    nodes,
    redrawEdges,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    redrawNodes,
    drawDiagram,
    toggleOption,
    options,
    setData,
  } = useDigramStore();

  // Memoized node types definition
  const nodeTypes = useMemo(() => ({ special: CustomNode }), []);

  // Memoized edge types definition
  const edgeTypes = useMemo(
    () => ({
      smartbezier: SmartBezierEdge,
      smartstep: SmartStepEdge,
      smartstraight: SmartStraightEdge,
    }),
    []
  );

  // Memoized regenerate function to prevent unnecessary recreations
  const regenrate = useCallback(async () => {
    const { data } = await get(`/schema-visualizer-v2/get-types`);
    setData(data);
    drawDiagram();
  }, [get, setData, drawDiagram]);

  useEffectSkipInitial(() => {
    regenrate();
  }, [options.showAdminTypes, options.showPluginTypes, regenrate]);

  useEffect(() => {
    redrawEdges();
  }, [options.edgeType, options.showEdges, redrawEdges]);

  useEffect(() => {
    redrawNodes();
  }, [
    options.showTypes,
    options.showIcons,
    options.showRelationsOnly,
    options.showDefaultFields,
    redrawNodes,
  ]);

  // Memoize the toggle function for better performance
  const handleScrollToggle = useCallback(() => {
    toggleOption("scrollMode");
  }, [toggleOption]);

  const ref = useRef<HTMLDivElement>(null);

  // Memoize background style to avoid recreating on each render
  const backgroundStyle = useMemo(() => getBackgroundColor(options.backgroundPattern, theme),
    [options.backgroundPattern, theme]);

  // Memoize the ReactFlow props to prevent re-renders
  const flowProps = useMemo(() => ({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    nodeTypes,
    edgeTypes,
    fitView: true,
    minZoom: 0,
    preventScrolling: !options.scrollMode,
    snapGrid: [20, 20] as [number, number],
    snapToGrid: options.snapToGrid,
    elevateEdgesOnSelect: true,
    fitViewOptions: {
      maxZoom: 1,
    },
    // Disable user-created connections
    connectOnClick: false,
    nodesConnectable: false,
  }), [
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    nodeTypes,
    edgeTypes,
    options.scrollMode,
    options.snapToGrid
  ]);

  // Memoize the control button styles
  const controlsStyle = useMemo(() => ({
    "--button-background": theme.colors?.neutral150,
    "--button-foreground": theme.colors?.neutral1000,
    "--button-hover": theme.colors?.buttonPrimary500,
  } as React.CSSProperties), [theme.colors]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Layouts.Header
        title="Schema Visualizer"
        primaryAction={
          <Modal.Root>
            <Modal.Trigger>
            <Button
            startIcon={<Download />}
          >
            Export Diagram
          </Button>
            </Modal.Trigger>
            <ExportModal imageRef={ref as React.RefObject<HTMLDivElement>} />
          </Modal.Root>
        }
        secondaryAction={
          <Button
            variant="secondary"
            startIcon={<ArrowClockwise />}
            onClick={regenrate}
          >
            Regenerate
          </Button>
        }
      />
      {/* TODO remove styling when this issue is fixed: https://github.com/strapi/design-system/issues/1853 */}
			<style>
				{`
					.cte-plugin-controls button {
            background-color: var(--button-background);
            border: none;
          }

          .cte-plugin-controls button:hover {
            background-color: var(--button-hover);
          }

          .cte-plugin-controls button svg {
            fill: var(--button-foreground);
          }
				`}
			</style>
      <OptionsBar />
      <div
        ref={ref}
        style={{
          height: "100%",
          borderTop: `1px solid ${theme.colors?.neutral150}`,
        }}
      >
        <ReactFlow
          {...flowProps}
        >
          <Controls
            position="top-left"
            showInteractive={false}
            className="cte-plugin-controls"
            style={controlsStyle}
          >
            <ControlButton
              onClick={handleScrollToggle}
              title="Toggle Mouse Wheel Behavior (Zoom/Scroll)"
            >
              {
                options.scrollMode
                ? <Drag fill="#000000" />
                : <Search fill="#000000" />
              }
            </ControlButton>
          </Controls>
          <Background
            variant={options.backgroundPattern as BackgroundVariant}
            color={backgroundStyle}
          />
        </ReactFlow>
      </div>
    </div>
  );
});

// Add display name for better debugging
HomePage.displayName = 'HomePage';

export { HomePage };
