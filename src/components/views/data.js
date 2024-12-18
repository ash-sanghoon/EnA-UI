export const data = {
  nodes: [
    {
      name: "Node1",
      properties: { label: "globe valve", data: 10 },
      position: [
        [300, 300], // 중앙에 위치
        [400, 450], // 중앙에 위치
      ],
    },
    {
      name: "Node2",
      properties: { label: "ball valve", data: 20 },
      position: [
        [450, 250],
        [600, 400],
      ],
    },
    {
      name: "Node3",
      properties: { label: "reducer", data: 30 },
      position: [
        [650, 100],
        [800, 250],
      ],
    },
    {
      name: "Node4",
      properties: { label: "plate open", data: 40 },
      position: [
        [200, 350],
        [350, 500],
      ],
    },
    {
      name: "Node5",
      properties: { label: "equipment", data: 50 },
      position: [
        [500, 400],
        [650, 480],
      ],
    },
    {
      name: "Node6",
      properties: { label: "actuator", data: 60 },
      position: [
        [700, 300],
        [900, 450],
      ],
    },
    {
      name: "Node7",
      properties: { label: "filter", data: 70 },
      position: [
        [100, 100],
        [250, 200],
      ],
    },
    {
      name: "Node8",
      properties: { label: "sensor", data: 80 },
      position: [
        [850, 150],
        [1000, 250],
      ],
    },
  ],
  edges: [
    {
      name: "Edge1",
      properties: { type: "connection", data: 1.5 },
      source: "Node1",
      target: "Node2",
    },
    {
      name: "Edge2",
      properties: { type: "relationship", data: 2.0 },
      source: "Node2",
      target: "Node3",
    },
    {
      name: "Edge3",
      properties: { type: "link", data: 1.8 },
      source: "Node2",
      target: "Node5",
    },
    {
      name: "Edge4",
      properties: { type: "dependency", data: 3.0 },
      source: "Node4",
      target: "Node5",
    },
    {
      name: "Edge5",
      properties: { type: "association", data: 1.0 },
      source: "Node5",
      target: "Node6",
    },
    {
      name: "Edge6",
      properties: { type: "connection", data: 2.5 },
      source: "Node6",
      target: "Node3",
    },
    {
      name: "Edge7",
      properties: { type: "link", data: 2.1 },
      source: "Node1",
      target: "Node4",
    },
    {
      name: "Edge8",
      properties: { type: "relationship", data: 1.9 },
      source: "Node7",
      target: "Node1",
    },
    {
      name: "Edge9",
      properties: { type: "dependency", data: 3.2 },
      source: "Node5",
      target: "Node8",
    },
  ],
};

export default data;
