import "reactflow/dist/style.css";
import "./styles.css";
import React, { useEffect, useMemo, useRef } from "react";
import { useFetchClient } from '@strapi/strapi/admin';
// import { HeaderLayout } from "@strapi/admin/strapi-admin";
import { Button } from "@strapi/design-system";
import { Search, Drag, Download, ArrowClockwise } from "@strapi/icons";
import { useTheme } from "styled-components";
import {
  SmartBezierEdge,
  SmartStepEdge,
  SmartStraightEdge,
} from "@tisoap/react-flow-smart-edge";
import { Background, ControlButton, Controls, ReactFlow } from "reactflow";
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

const HomePage = () => {
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
    showModal,
    setShowModal,
  } = useDigramStore();

  const nodeTypes = useMemo(() => ({ special: CustomNode }), []);
  const edgeTypes = useMemo(
    () => ({
      smartbezier: SmartBezierEdge,
      smartstep: SmartStepEdge,
      smartstraight: SmartStraightEdge,
    }),
    []
  );

  const regenrate = async () => {
    const { data } = await get(`/schema-visualizer-v2/get-types`);
    setData(data);
    drawDiagram();
  };

  useEffectSkipInitial(() => {
    regenrate();
  }, [options.showAdminTypes, options.showPluginTypes]);

  useEffect(() => {
    redrawEdges();
  }, [options.edgeType, options.showEdges]);

  useEffect(() => {
    redrawNodes();
  }, [
    options.showTypes,
    options.showIcons,
    options.showRelationsOnly,
    options.showDefaultFields,
  ]);

  const ref = useRef(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* <HeaderLayout
        title="Content-Type Explorer"
        primaryAction={
          <Button
            startIcon={<Download />}
            onClick={() => setShowModal(true)}
          >
            Export Diagram
          </Button>
        }
        secondaryAction={
          <Button
            variant="secondary"
            startIcon={<ArrowClockwise />}
            onClick={regenrate}
          >
            Regenrate
          </Button>
        }
      /> */}
      <Button
            startIcon={<Download />}
            onClick={() => setShowModal(true)}
          >
            Export Diagram
          </Button>
      <Button
            variant="secondary"
            startIcon={<ArrowClockwise />}
            onClick={regenrate}
          >
            Regenrate
          </Button>
      <OptionsBar />
      <div
        ref={ref}
        style={{
          height: "100%",
          borderTop: `1px solid ${theme.colors?.neutral150}`,
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          minZoom={0}
          preventScrolling={!options.scrollMode}
          snapGrid={[20, 20]}
          snapToGrid={options.snapToGrid}
          fitViewOptions={{
            maxZoom: 1,
          }}
        >
          <Controls
            position="top-left"
            showInteractive={false}
            className="cte-plugin-controls"
            style={{
              "--button-background": theme.colors?.neutral150,
              "--button-foreground": theme.colors?.neutral1000,
              "--button-hover": theme.colors?.buttonPrimary500,
            } as React.CSSProperties}
          >
            <ControlButton
              onClick={() => toggleOption("scrollMode")}
              title="Toggle Mouse Wheel Behavior (Zoom/Scroll)"
            >
              {
                options.scrollMode
                ? <Drag fill="neutral1000" />
                : <Search fill="neutral1000" />
              }
            </ControlButton>
          </Controls>
          <Background
            variant={options.backgroundPattern}
            color={getBackgroundColor(options.backgroundPattern, theme)}
          />
        </ReactFlow>
        {showModal && <ExportModal imageRef={ref} />}
      </div>
    </div>
  );
};

export { HomePage };
