const data = {
  nodes: [
    {
      name: "Node1",
      properties: { label: "globe valve", data: 10 },
      position: [
        [100, 100],
        [150, 150],
      ],
    },
    {
      name: "Node2",
      properties: { label: "ball valve", data: 20 },
      position: [
        [200, 200],
        [250, 250],
      ],
    },
    {
      name: "Node3",
      properties: { label: "reducer", data: 30 },
      position: [
        [300, 300],
        [350, 350],
      ],
    },
    {
      name: "Node4",
      properties: { label: "plate open", data: 40 },
      position: [
        [400, 400],
        [450, 450],
      ],
    },
    {
      name: "Node5",
      properties: { label: "globe valve", data: 50 },
      position: [
        [500, 500],
        [550, 550],
      ],
    },
    {
      name: "Node6",
      properties: { label: "equipment", data: 60 },
      position: [
        [600, 600],
        [700, 700],
      ],
    },
    {
      name: "Node7",
      properties: { label: "actuator", data: 70 },
      position: [
        [750, 750],
        [850, 850],
      ],
    },
    {
      name: "Node8",
      properties: { label: "filter", data: 80 },
      position: [
        [900, 900],
        [1000, 1000],
      ],
    },
    {
      name: "Node9",
      properties: { label: "sensor", data: 90 },
      position: [
        [1100, 200],
        [1300, 700],
      ],
    },
    {
      name: "Node10",
      properties: { label: "pressure gauge", data: 100 },
      position: [
        [1400, 600],
        [1600, 900],
      ],
    },
    {
      name: "Node11",
      properties: { label: "flow meter", data: 110 },
      position: [
        [400, 1000],
        [600, 1200],
      ],
    },
    {
      name: "Node12",
      properties: { label: "check valve", data: 120 },
      position: [
        [700, 150],
        [850, 300],
      ],
    },
    {
      name: "Node13",
      properties: { label: "temperature sensor", data: 130 },
      position: [
        [1700, 700],
        [1900, 1100],
      ],
    },
    {
      name: "Node14",
      properties: { label: "butterfly valve", data: 140 },
      position: [
        [200, 1400],
        [300, 1500],
      ],
    },
    {
      name: "Node15",
      properties: { label: "controller", data: 150 },
      position: [
        [400, 1600],
        [500, 1800],
      ],
    },
    {
      name: "Node16",
      properties: { label: "rotary actuator", data: 160 },
      position: [
        [600, 200],
        [700, 400],
      ],
    },
    {
      name: "Node17",
      properties: { label: "electronic sensor", data: 170 },
      position: [
        [800, 300],
        [900, 500],
      ],
    },
    {
      name: "Node18",
      properties: { label: "safety valve", data: 180 },
      position: [
        [1000, 100],
        [1200, 400],
      ],
    },
    {
      name: "Node19",
      properties: { label: "pressure relief valve", data: 190 },
      position: [
        [1100, 700],
        [1250, 850],
      ],
    },
    {
      name: "Node20",
      properties: { label: "pressure transmitter", data: 200 },
      position: [
        [1300, 500],
        [1450, 750],
      ],
    },
    {
      name: "Node21",
      properties: { label: "temperature gauge", data: 210 },
      position: [
        [1500, 150],
        [1650, 400],
      ],
    },
    {
      name: "Node22",
      properties: { label: "analog sensor", data: 220 },
      position: [
        [1600, 500],
        [1750, 700],
      ],
    },
    {
      name: "Node23",
      properties: { label: "digital sensor", data: 230 },
      position: [
        [1800, 600],
        [1900, 800],
      ],
    },
    {
      name: "Node24",
      properties: { label: "rotary encoder", data: 240 },
      position: [
        [2000, 100],
        [2200, 400],
      ],
    },
    {
      name: "Node25",
      properties: { label: "flow control valve", data: 250 },
      position: [
        [2100, 700],
        [2300, 1000],
      ],
    },
    {
      name: "Node26",
      properties: { label: "pneumatic valve", data: 260 },
      position: [
        [2400, 800],
        [2600, 1200],
      ],
    },
    {
      name: "Node27",
      properties: { label: "actuator control", data: 270 },
      position: [
        [2700, 200],
        [2900, 500],
      ],
    },
    {
      name: "Node28",
      properties: { label: "industrial valve", data: 280 },
      position: [
        [3000, 400],
        [3200, 800],
      ],
    },
    {
      name: "Node29",
      properties: { label: "mechanical switch", data: 290 },
      position: [
        [3300, 600],
        [3500, 1100],
      ],
    },
    {
      name: "Node30",
      properties: { label: "safety actuator", data: 300 },
      position: [
        [3700, 700],
        [3900, 1200],
      ],
    },
  ],
  edges: [
    { source: "Node1", target: "Node2" },
    { source: "Node2", target: "Node3" },
    { source: "Node3", target: "Node4" },
    { source: "Node4", target: "Node5" },
    { source: "Node5", target: "Node6" },
    { source: "Node6", target: "Node7" },
    { source: "Node7", target: "Node8" },
    { source: "Node8", target: "Node9" },
    { source: "Node9", target: "Node10" },
    { source: "Node10", target: "Node11" },
    { source: "Node11", target: "Node12" },
    { source: "Node12", target: "Node13" },
    { source: "Node13", target: "Node14" },
    { source: "Node14", target: "Node15" },
    { source: "Node15", target: "Node16" },
    { source: "Node16", target: "Node17" },
    { source: "Node17", target: "Node18" },
    { source: "Node18", target: "Node19" },
    { source: "Node19", target: "Node20" },
    { source: "Node20", target: "Node21" },
    { source: "Node21", target: "Node22" },
    { source: "Node22", target: "Node23" },
    { source: "Node23", target: "Node24" },
    { source: "Node24", target: "Node25" },
    { source: "Node25", target: "Node26" },
    { source: "Node26", target: "Node27" },
    { source: "Node27", target: "Node28" },
    { source: "Node28", target: "Node29" },
    { source: "Node29", target: "Node30" },
  ],
};

export default data;
