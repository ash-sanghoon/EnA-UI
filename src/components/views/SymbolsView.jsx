import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, Plus, Search, Settings, Filter } from 'lucide-react';

const SymbolsView = () => {
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedInstruments, setSelectedInstruments] = useState([]);
  const [image, setImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const industries = [
    {
      id: 'petrochemical',
      name: 'Petrochemical',
      standards: [
        {
          id: 'iso',
          name: 'ISO',
          clients: [
            {
              id: 'saudi-aramco',
              name: 'Saudi Aramco',
              projects: [
                { id: 'ras-tanura', name: 'Ras Tanura Refinery' },
                { id: 'yanbu', name: 'Yanbu Refinery' }
              ]
            },
            {
              id: 'adnoc',
              name: 'ADNOC',
              projects: [
                { id: 'ruwais', name: 'Ruwais Refinery' }
              ]
            }
          ]
        }
      ]
    }
  ];

  const instrumentTypes = [
    { id: 'valve', label: 'Valve' },
    { id: 'pump', label: 'Pump' },
    { id: 'tank', label: 'Tank' },
    { id: 'compressor', label: 'Compressor' },
    { id: 'heat_exchanger', label: 'Heat Exchanger' },
    { id: 'instrument', label: 'Instrument' },
    { id: 'pipe', label: 'Pipe' },
    { id: 'vessel', label: 'Vessel' }
  ];

  const symbols = [
    { id: 1, name: 'Gate Valve', type: 'Valve', standard: 'ISO', usage: 85 },
    { id: 2, name: 'Control Valve', type: 'Valve', standard: 'ISO', usage: 92 },
    { id: 3, name: 'Pressure Sensor', type: 'Instrument', standard: 'ISA', usage: 78 }
  ];

  useEffect(() => {
    // Load image and detections from the backend
    const loadData = async () => {
      try {
        const imageResponse = await fetch('/test_data/output_flow.png');
        const imageBlob = await imageResponse.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        setImage(imageUrl);

        const detectionsResponse = await fetch('/test_data/detection_results.json');
        const detectionsData = await detectionsResponse.json();
        setDetections(detectionsData.detections);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      drawCanvas(ctx, img);
    };
    
    img.src = image;
  }, [image, detections]);

  const drawCanvas = (ctx, img) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, 0, 0);

    detections.forEach((detection, index) => {
      const { x0, y0, x1, y1 } = detection.bbox;
      ctx.strokeStyle = index === selectedBox ? '#00ff00' : '#ff0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    });
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on existing box
    const clickedBoxIndex = detections.findIndex(detection => {
      const { x0, y0, x1, y1 } = detection.bbox;
      return x >= x0 && x <= x1 && y >= y0 && y <= y1;
    });

    if (clickedBoxIndex !== -1) {
      setSelectedBox(clickedBoxIndex);
      setIsDragging(true);
    } else {
      setIsDrawing(true);
      setDrawStart({ x, y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging && !isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && selectedBox !== null) {
      const updatedDetections = [...detections];
      const detection = updatedDetections[selectedBox];
      const width = detection.bbox.x1 - detection.bbox.x0;
      const height = detection.bbox.y1 - detection.bbox.y0;

      detection.bbox.x0 = x - width / 2;
      detection.bbox.y0 = y - height / 2;
      detection.bbox.x1 = x + width / 2;
      detection.bbox.y1 = y + height / 2;
      detection.bbox.x_center = x;
      detection.bbox.y_center = y;

      setDetections(updatedDetections);
    }

    const ctx = canvas.getContext('2d');
    drawCanvas(ctx, document.getElementById('source-image'));
  };

  const handleMouseUp = async (e) => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Create new detection
      const newDetection = {
        class_name: "new_symbol",
        confidence: 1.0,
        bbox: {
          x0: Math.min(drawStart.x, x),
          y0: Math.min(drawStart.y, y),
          x1: Math.max(drawStart.x, x),
          y1: Math.max(drawStart.y, y),
          x_center: (drawStart.x + x) / 2,
          y_center: (drawStart.y + y) / 2,
          width: Math.abs(x - drawStart.x),
          height: Math.abs(y - drawStart.y)
        }
      };

      setDetections([...detections, newDetection]);
    }

    // Save changes to backend
    try {
      const response = await fetch('/api/save-detections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          detections: detections
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save detections');
      }
    } catch (error) {
      console.error('Error saving detections:', error);
    }

    setIsDragging(false);
    setIsDrawing(false);
    setSelectedBox(null);
  };

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleInstrumentChange = (instrumentId) => {
    setSelectedInstruments(prev => {
      if (prev.includes(instrumentId)) {
        return prev.filter(id => id !== instrumentId);
      } else {
        return [...prev, instrumentId];
      }
    });
  };

  return (
    <div className="flex h-screen">
      {/* Left Panel - Hierarchy Browser */}
      <div className="w-80 bg-white border-r">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="심볼 검색..."
              className="w-full text-sm border-none focus:ring-0"
            />
          </div>
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Instrument 종류</h3>
            <div className="grid grid-cols-2 gap-3">
              {instrumentTypes.map((instrument) => (
                <label key={instrument.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedInstruments.includes(instrument.id)}
                    onChange={() => handleInstrumentChange(instrument.id)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600">{instrument.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4">
          {industries.map(industry => (
            <div key={industry.id}>
              <div
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleExpand(industry.id)}
              >
                {expandedItems[industry.id] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <span className="font-medium">{industry.name}</span>
              </div>
              
              {expandedItems[industry.id] && industry.standards.map(standard => (
                <div key={standard.id} className="ml-4">
                  <div
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleExpand(standard.id)}
                  >
                    {expandedItems[standard.id] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span>{standard.name}</span>
                  </div>
                  
                  {expandedItems[standard.id] && standard.clients.map(client => (
                    <div key={client.id} className="ml-4">
                      <div
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleExpand(client.id)}
                      >
                        {expandedItems[client.id] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <span>{client.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Symbol Grid and Canvas */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">심볼 라이브러리</h1>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => setIsDrawing(true)}
            >
              Draw Box
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              새 심볼 추가
            </button>
          </div>
        </div>

        <div className="relative">
          <img
            id="source-image"
            src={image}
            style={{ display: 'none' }}
            alt="Source"
          />
          <canvas
            ref={canvasRef}
            className="border border-gray-300"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          {symbols.map(symbol => (
            <div key={symbol.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="h-32 bg-gray-100 rounded mb-3 flex items-center justify-center">
                <Settings className="w-12 h-12 text-gray-400" />
              </div>
              <h4 className="font-medium">{symbol.name}</h4>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{symbol.standard}</span>
                <span>{symbol.usage}% usage</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SymbolsView;