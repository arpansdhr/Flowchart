import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, { ReactFlowProvider, addEdge, useNodesState, useEdgesState, Controls, ConnectionLineType } from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import Sidebar from './Sidebar';
import DownloadButton from './DownloadButton';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const FlowChart = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [inputLabel, setInputLabel] = useState('');
  const [defaultLabel, setDefaultLabel] = useState('');
  const [outputLabel, setOutputLabel] = useState('');
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredStats, setHoveredStats] = useState(null);
  const [nodeBg, setNodeBg] = useState('');

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === hoveredNode?.id) {
          if (!nodeBg) {
            node.style = { ...node.style, backgroundColor: 'null' };
          } else {
            node.style = { ...node.style, backgroundColor: nodeBg };
          }
        }
        return node;
      })
    );
  }, [hoveredNode, nodeBg, setNodes]);  

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true }, eds)
      ),
    [setEdges]
  );

  const onNodeDoubleClick = useCallback(
    (event, node) => {
      if (node && node.id) {
        setNodes((prevNodes) =>
          prevNodes.map((n) =>
            n.id === node.id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    label:
                      node.type === 'input'
                        ? inputLabel
                        : node.type === 'default'
                        ? defaultLabel
                        : outputLabel,
                  },
                }
              : n
          )
        );
      }
    },
    [setNodes, inputLabel, defaultLabel, outputLabel]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (!type) {
        return;
      }

      const position = {
        x: event.clientX,
        y: event.clientY,
      };

      const newNode = {
        id: `dndnode_${nodes.length + 1}`,
        type,
        position,
        data: {
          label:
            type === 'input'
              ? inputLabel
              : type === 'default'
              ? defaultLabel
              : outputLabel,
        },
      };

      setNodes((prevNodes) => prevNodes.concat(newNode));
    },
    [nodes, setNodes, inputLabel, defaultLabel, outputLabel]
  );

  const handleNodeHover = (event, node) => {
    setHoveredNode(node);
    // Generate placeholder statistics based on node type or any other relevant criteria
    let placeholderStats = {};
    if (node.type === 'input') {
      placeholderStats = { views: 100, clicks: 20, conversions: 5 };
    } else if (node.type === 'default') {
      placeholderStats = { views: 80, clicks: 10, conversions: 2 };
    } else if (node.type === 'output') {
      placeholderStats = { views: 120, clicks: 30, conversions: 8 };
    }
    setHoveredStats(placeholderStats);
  };  

  const handleNodeMouseLeave = () => {
    setHoveredNode(null);
  };

  const onLayout = useCallback(
    (direction) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);
  
      const updatedNodes = layoutedNodes.map(node => ({
        ...node,
        position: {
          x: node.position.x,
          y: node.position.y
        }
      }));
  
      setNodes(updatedNodes);
      setEdges(layoutedEdges);
    },
    [nodes, edges, setNodes, setEdges]
  );

  return (
    <div className="flex flex-col h-screen">
      <ReactFlowProvider>
        <div className="flex flex-grow">
          <div className="flex-grow bg-gray-100">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeDoubleClick={onNodeDoubleClick}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeMouseEnter={handleNodeHover}
              onNodeMouseLeave={handleNodeMouseLeave}
              connectionLineType={ConnectionLineType.SmoothStep}
              fitView
            />
          </div>
          <Sidebar />
          <DownloadButton />
        </div>
        <Controls />
      </ReactFlowProvider>
      {hoveredNode && (
        <div className="tooltip" style={{ position: 'absolute', top: hoveredNode.position.y, left: hoveredNode.position.x }}>
          <div>{hoveredNode.data.label}</div>
          {hoveredStats && (
            <div>
              <div>Views: {hoveredStats.views}</div>
              <div>Clicks: {hoveredStats.clicks}</div>
              <div>Conversions: {hoveredStats.conversions}</div>
            </div>
          )}
        </div>
      )}
      <div className="controls">
        <label className="pl-11">Input Node Label:</label>
        <input
          type="text"
          value={inputLabel}
          onChange={(e) => setInputLabel(e.target.value)}
          placeholder="Enter Input Node Label"
          className="text-center border border-gray-300 rounded py-2 px-3 text-sm text-gray-700 focus:outline-none focus:border-blue-500 placeholder-border"
        />
        <label>Default Node Label:</label>
        <input
          type="text"
          value={defaultLabel}
          onChange={(e) => setDefaultLabel(e.target.value)}
          placeholder="Enter Default Node Label"
          className="text-center border border-gray-300 rounded py-2 px-3 text-sm text-gray-700 focus:outline-none focus:border-blue-500 placeholder-border"
        />
        <label>Output Node Label:</label>
        <input
          type="text"
          value={outputLabel}
          onChange={(e) => setOutputLabel(e.target.value)}
          placeholder="Enter Output Node Label"
          className="text-center border border-gray-300 rounded py-2 px-3 text-sm text-gray-700 focus:outline-none focus:border-blue-500 placeholder-border"
        />
        <label className="updatenode__bglabel">Background:</label>
        <input
          value={nodeBg}
          onChange={(evt) => setNodeBg(evt.target.value)}
          placeholder="Specify node color"
          className="text-center border border-gray-300 rounded py-2 px-3 text-sm text-gray-700 focus:outline-none focus:border-blue-500 placeholder-border"
          style={{ backgroundColor: nodeBg }}
        />
        <div className="flex justify-center">
        <div className="inline-flex">
          <button onClick={() => onLayout('TB')} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l">
            Vertical Layout
          </button>
          <button onClick={() => onLayout('LR')} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r">
            Horizontal Layout
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default FlowChart;
