import React, { useState, useMemo, useRef, useEffect } from "react";
import Draggable from "react-draggable";

const EnhancedLabelSelector = ({
  isOpen,
  onClose,
  graphData = { nodes: [], edges: [] },
  onLabelSelect,
  onDeleteLabel,
  selectedNode,
  selectedEdge,
}) => {
  const popupRef = useRef(null);
  const headerRef = useRef(null);
  const labelRefs = useRef({});
  const inputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [position, setPosition] = useState(() => {
    const savedPosition = localStorage.getItem("labelSelectorPosition");
    return savedPosition ? JSON.parse(savedPosition) : { x: 10, y: 10 }; // 기본 위치 조정
  });

  const [selectedProperty, setSelectedProperty] = useState(
    selectedNode ? "label" : "lineNo"
  );

  useEffect(() => {
    // 컴포넌트가 마운트된 후에 input에 포커스를 줍니다.
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setSelectedProperty(selectedNode ? "label" : "lineNo");
  }, [selectedNode, selectedEdge]);

  const propertyOptions = useMemo(() => {
    const selectedItem = selectedNode || selectedEdge;
    const items = selectedItem
      ? selectedNode
        ? graphData.nodes
        : graphData.edges
      : graphData.nodes; // selectedItem이 없으면 기본적으로 nodes 사용

    if (!selectedItem && items.length === 0) return {};

    const properties = {};

    // 먼저 선택된 아이템의 properties를 추가
    if (selectedItem && selectedItem.properties) {
      Object.entries(selectedItem.properties).forEach(([key, value]) => {
        if (!properties[key]) properties[key] = new Set();
        if (value) properties[key].add(value);
      });
    }

    // 그 다음 같은 타입의 다른 아이템들의 properties도 추가
    items.forEach((item) => {
      if (item.properties) {
        Object.entries(item.properties).forEach(([key, value]) => {
          if (!properties[key]) properties[key] = new Set();
          if (value) properties[key].add(value);
        });
      }
    });

    return Object.fromEntries(
      Object.entries(properties).map(([key, values]) => [
        key,
        Array.from(values).filter(Boolean).sort(),
      ])
    );
  }, [graphData, selectedNode, selectedEdge]);

  const filteredPropertyValues = useMemo(() => {
    const values = propertyOptions[selectedProperty] || [];
    if (!searchTerm) return values;

    return values.filter((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [propertyOptions, selectedProperty, searchTerm]);

  const handleDragStop = (e, data) => {
    const newPosition = { x: data.x, y: data.y };
    setPosition(newPosition);
    localStorage.setItem("labelSelectorPosition", JSON.stringify(newPosition));
  };

  const handlePropertySelect = (propertyName) => {
    setSelectedProperty(propertyName);
    setSearchTerm("");
  };

  const handleValueSelect = (value) => {
    if (selectedNode) {
      onLabelSelect(value, selectedNode, selectedProperty, "node");
    } else if (selectedEdge) {
      onLabelSelect(value, selectedEdge, selectedProperty, "edge");
    } else {
      onLabelSelect(value, selectedNode, selectedProperty);
    }
    onClose();
  };

  const handleAddNewValue = () => {
    const newValue = searchTerm.trim();
    if (!newValue) return;

    if (selectedNode) {
      onLabelSelect(newValue, selectedNode, selectedProperty, "node");
    } else if (selectedEdge) {
      onLabelSelect(newValue, selectedEdge, selectedProperty, "edge");
    } else {
      onLabelSelect(newValue, selectedNode, selectedProperty);
    }
    setSearchTerm("");
    onClose();
  };

  const handleDeleteValue = () => {
    onDeleteLabel(searchTerm, selectedProperty);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleEnterPress();
    }
  };

  const handleEnterPress = () => {
    const newValue = searchTerm.trim();
    if (!newValue) return;

    if (
      filteredPropertyValues.length === 1 &&
      filteredPropertyValues[0].toLowerCase() === newValue.toLowerCase()
    ) {
      handleValueSelect(filteredPropertyValues[0]);
    } else if (
      filteredPropertyValues.length === 0 ||
      !filteredPropertyValues.some(
        (v) => v.toLowerCase() === newValue.toLowerCase()
      )
    ) {
      handleValueSelect(newValue);
    } else if (filteredPropertyValues.length > 0) {
      handleValueSelect(filteredPropertyValues[0]);
    }

    setSearchTerm("");
  };

  if (!isOpen) return null;

  const selectedItem = selectedNode || selectedEdge;
  const itemType = selectedNode ? "노드" : selectedEdge ? "엣지" : "노드"; // selectedItem이 없을 경우 기본적으로 "노드"로 설정

  return (
    <Draggable
      nodeRef={popupRef}
      handle=".drag-handle"
      position={position}
      onStop={handleDragStop}
    >
      <div
        ref={popupRef}
        className="fixed z-[5000] bg-white rounded-lg shadow-md z-50 flex flex-col overflow-hidden resize"
        style={{
          width: "500px",
          height: "450px",
          minWidth: "490px", // 최소 너비 고정
          minHeight: "300px", // 최소 높이 고정
        }}
        onMouseLeave={() => {
          popupRef.current.style.opacity = "0.75";
        }}
        onMouseEnter={() => {
          popupRef.current.style.opacity = "1";
        }}
      >
        <div
          ref={headerRef}
          className="drag-handle flex justify-between items-center p-4 cursor-move bg-gray-50 border-b border-gray-200"
        >
          <h2 className="text-sm font-bold">{itemType} 속성 편집</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg font-medium focus:outline-none"
          >
            ×
          </button>
        </div>

        <div className="flex gap-3 p-4 h-full overflow-hidden">
          <div className="w-[160px] flex flex-col min-h-0">
            <h3 className="text-xs font-semibold mb-1">속성 목록</h3>
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md">
              {Object.keys(propertyOptions).map((propertyName) => (
                <div
                  key={propertyName}
                  onClick={() => handlePropertySelect(propertyName)}
                  className={`p-2 cursor-pointer border-b border-gray-100 flex items-center justify-between space-x-2 ${
                    propertyName === selectedProperty
                      ? "bg-blue-50"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <span className="flex-shrink-0 text-sm" title={propertyName}>
                    {propertyName}
                  </span>
                  <span
                    className="text-gray-500 text-sm truncate max-w-[80px]"
                    title={selectedItem?.properties?.[propertyName]}
                  >
                    {selectedItem?.properties?.[propertyName]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="text-xs font-semibold mb-1">
              {selectedProperty} 값 목록
            </h3>
            <input
              type="text"
              ref={inputRef}
              placeholder={`${selectedProperty} 값 검색`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md mb-3">
              {filteredPropertyValues.length > 0 ? (
                filteredPropertyValues.map((value) => (
                  <div
                    key={value}
                    ref={(el) => (labelRefs.current[value] = el)}
                    onClick={() => handleValueSelect(value)}
                    className={`p-2 cursor-pointer border-b border-gray-100 truncate ${
                      value === selectedItem?.properties?.[selectedProperty]
                        ? "bg-blue-50"
                        : "bg-white hover:bg-gray-50"
                    }`}
                    title={value}
                  >
                    {value}
                  </div>
                ))
              ) : (
                <div className="p-2 text-center text-sm text-gray-500">
                  {searchTerm && (
                    <div
                      onClick={handleAddNewValue}
                      className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700"
                    >
                      "{searchTerm}" 값 추가
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-between p-2">
              {searchTerm ? (
                <>
                  <button
                    onClick={handleAddNewValue}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md"
                  >
                    저장(Enter)
                  </button>
                  <button
                    onClick={handleDeleteValue}
                    className="px-3 py-1 bg-red-500 text-white rounded-md"
                  >
                    제거(Delete)
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEnterPress}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md"
                  >
                    저장(Enter)
                  </button>
                  <button
                    onClick={handleDeleteValue}
                    className="px-3 py-1 bg-red-500 text-white rounded-md"
                  >
                    제거(Delete)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default EnhancedLabelSelector;
