import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Search, Settings, Filter } from 'lucide-react';

const SymbolsView = () => {
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedInstruments, setSelectedInstruments] = useState([]);

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

      {/* Right Panel - Symbol Grid */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">심볼 라이브러리</h1>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            새 심볼 추가
          </button>
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