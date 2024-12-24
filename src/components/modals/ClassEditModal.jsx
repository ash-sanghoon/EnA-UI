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
  const propertyInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [tempSelectedValue, setTempSelectedValue] = useState(null);
  const [newPropertyName, setNewPropertyName] = useState("");
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [localPropertyOptions, setLocalPropertyOptions] = useState({});
  const [position, setPosition] = useState(() => {
    const savedPosition = localStorage.getItem("labelSelectorPosition");
    return savedPosition ? JSON.parse(savedPosition) : { x: 10, y: 10 };
  });

  const [selectedProperty, setSelectedProperty] = useState(
    selectedNode ? "label" : "line_no"
  );

  useEffect(() => {
    if (isOpen) {
      if (inputRef.current) {
        inputRef.current.focus();
      }

      const selectedItem = selectedNode || selectedEdge;
      if (selectedItem?.properties) {
        const initialProperty = selectedEdge ? "line_no" : "label";
        const initialValue = selectedItem.properties[initialProperty] || null;

        setSelectedProperty(initialProperty);
        setTempSelectedValue(initialValue);

        if (initialValue && labelRefs.current[initialValue]) {
          labelRefs.current[initialValue].scrollIntoView({
            behavior: "auto",
            block: "center",
          });
        }
      }
      setSearchTerm("");
      setIsAddingProperty(false);
      setNewPropertyName("");

      // Initialize local property options
      initializePropertyOptions();
    }
  }, [isOpen, selectedNode, selectedEdge]);

  const initializePropertyOptions = () => {
    const selectedItem = selectedNode || selectedEdge;
    const items = selectedItem
      ? selectedNode
        ? graphData.nodes
        : graphData.edges
      : graphData.nodes;

    if (!selectedItem && items.length === 0) {
      setLocalPropertyOptions({});
      return;
    }

    const properties = {};

    if (selectedItem && selectedItem.properties) {
      Object.entries(selectedItem.properties).forEach(([key, value]) => {
        if (!properties[key]) properties[key] = new Set();
        if (value) properties[key].add(value);
      });
    }

    items.forEach((item) => {
      if (item.properties) {
        Object.entries(item.properties).forEach(([key, value]) => {
          if (!properties[key]) properties[key] = new Set();
          if (value) properties[key].add(value);
        });
      }
    });

    setLocalPropertyOptions(
      Object.fromEntries(
        Object.entries(properties).map(([key, values]) => [
          key,
          Array.from(values).filter(Boolean).sort(),
        ])
      )
    );
  };

  const filteredPropertyValues = useMemo(() => {
    const values = localPropertyOptions[selectedProperty] || [];
    if (!searchTerm) return values;

    return values.filter((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [localPropertyOptions, selectedProperty, searchTerm]);

  const handleDragStop = (e, data) => {
    const newPosition = { x: data.x, y: data.y };
    setPosition(newPosition);
    localStorage.setItem("labelSelectorPosition", JSON.stringify(newPosition));
  };

  const handlePropertySelect = (propertyName) => {
    const selectedItem = selectedNode || selectedEdge;
    setSelectedProperty(propertyName);
    setTempSelectedValue(selectedItem?.properties?.[propertyName] || null);
    setSearchTerm("");
    setIsAddingProperty(false);

    if (
      selectedItem?.properties?.[propertyName] &&
      labelRefs.current[selectedItem.properties[propertyName]]
    ) {
      labelRefs.current[selectedItem.properties[propertyName]].scrollIntoView({
        behavior: "auto",
        block: "center",
      });
    }
  };

  const handleAddProperty = () => {
    if (!newPropertyName.trim()) return;

    // Add the new property to the selected item
    const selectedItem = selectedNode || selectedEdge;
    if (selectedItem) {
      selectedItem.properties = {
        ...selectedItem.properties,
        [newPropertyName]: "",
      };
    }

    // Update local property options
    setLocalPropertyOptions((prev) => ({
      ...prev,
      [newPropertyName]: [],
    }));

    setSelectedProperty(newPropertyName);
    setTempSelectedValue("");
    setIsAddingProperty(false);
    setNewPropertyName("");

    // Focus search input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleValueSelect = (value) => {
    setTempSelectedValue(value);
  };

  const handleSave = () => {
    const valueToSave = tempSelectedValue || searchTerm.trim();
    if (!valueToSave) return;

    if (selectedNode) {
      onLabelSelect(valueToSave, selectedNode, selectedProperty, "node");
    } else if (selectedEdge) {
      onLabelSelect(valueToSave, selectedEdge, selectedProperty, "edge");
    } else {
      onLabelSelect(valueToSave, selectedNode, selectedProperty);
    }

    setSearchTerm("");
    setTempSelectedValue(null);
    onClose();
  };

  const handleDeleteValue = () => {
    onDeleteLabel(searchTerm, selectedProperty);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (isAddingProperty) {
        handleAddProperty();
      } else {
        handleSave();
      }
    } else if (e.key === "Escape") {
      if (isAddingProperty) {
        setIsAddingProperty(false);
        setNewPropertyName("");
      } else {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  const selectedItem = selectedNode || selectedEdge;
  const itemType = selectedNode ? "노드" : selectedEdge ? "엣지" : "노드";

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
          minWidth: "490px",
          minHeight: "300px",
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
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-xs font-semibold">속성 목록</h3>
              <button
                onClick={() => {
                  setIsAddingProperty(true);
                  setTimeout(() => propertyInputRef.current?.focus(), 0);
                }}
                className="text-xs text-blue-500 hover:text-blue-600"
              >
                + 추가
              </button>
            </div>
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md">
              {isAddingProperty && (
                <div className="p-2 border-b border-gray-100 bg-blue-50">
                  <input
                    ref={propertyInputRef}
                    type="text"
                    value={newPropertyName}
                    onChange={(e) => setNewPropertyName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="새 속성명 입력"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end mt-1 space-x-1">
                    <button
                      onClick={handleAddProperty}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded-md"
                    >
                      추가
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingProperty(false);
                        setNewPropertyName("");
                      }}
                      className="px-2 py-1 text-xs bg-gray-500 text-white rounded-md"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
              {Object.keys(localPropertyOptions).map((propertyName) => (
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
                    className="text-gray-500 text-sm truncate max-w-[100px]"
                    title={
                      propertyName === selectedProperty && tempSelectedValue
                        ? tempSelectedValue
                        : selectedItem?.properties?.[propertyName]
                    }
                  >
                    {propertyName === selectedProperty && tempSelectedValue
                      ? tempSelectedValue
                      : selectedItem?.properties?.[propertyName]}
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
                      value === tempSelectedValue
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
                      onClick={() => setTempSelectedValue(searchTerm.trim())}
                      className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700"
                    >
                      "{searchTerm}" 값 추가
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-between p-2">
              <button
                onClick={handleSave}
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
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default EnhancedLabelSelector;
