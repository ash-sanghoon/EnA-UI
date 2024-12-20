import React, { useState, useMemo, useRef, useEffect } from "react";
import Draggable from "react-draggable";

const LabelSelectorPopup = ({
  isOpen,
  onClose,
  graphData = { nodes: [] },
  onLabelSelect,
  onDeleteLabel,
  selectedNode,
}) => {
  const labelOptions = useMemo(() => {
    if (!graphData || !graphData.nodes) return [];
    const uniqueLabels = [
      ...new Set(graphData.nodes.map((node) => node.properties?.label)),
    ];
    return uniqueLabels.sort();
  }, [graphData]);

  const labelRefs = useRef({});
  const popupRef = useRef(null);
  const headerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [position, setPosition] = useState(() => {
    const savedPosition = localStorage.getItem("labelSelectorPosition");
    return savedPosition ? JSON.parse(savedPosition) : { x: 0, y: 0 };
  });

  const handleDragStop = (e, data) => {
    const newPosition = { x: data.x, y: data.y };
    setPosition(newPosition);
    localStorage.setItem("labelSelectorPosition", JSON.stringify(newPosition));
  };

  const filteredLabels = useMemo(() => {
    return labelOptions.filter((label) =>
      label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [labelOptions, searchTerm]);

  const handleAddNewLabel = () => {
    const newLabel = searchTerm.trim();
    if (!newLabel) return;

    if (labelOptions.includes(newLabel)) {
      // 이미 있는 레이블인 경우 선택 동작 수행
      handleLabelSelect(newLabel);
    } else {
      // 새 레이블 추가
      onLabelSelect(newLabel, selectedNode);
    }

    setSearchTerm("");
    onClose();
  };

  const handleDeleteLabel = (label) => {
    onDeleteLabel(label);
    onClose();
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      handleAddNewLabel();
    }
  };

  const handleLabelSelect = (label) => {
    if (selectedNode) {
      onLabelSelect(label, selectedNode);
    } else {
      onLabelSelect(label);
    }
    onClose();
  };

  useEffect(() => {
    if (selectedNode?.properties?.label) {
      const label = selectedNode.properties.label;
      const labelElement = labelRefs.current[label];
      if (labelElement) {
        labelElement.scrollIntoView({
          block: "center",
        });
      }
    }
  }, [selectedNode]);

  if (!isOpen) return null;

  return (
    <Draggable
      nodeRef={popupRef}
      handle=".drag-handle"
      position={position}
      onStop={handleDragStop}
    >
      <div
        ref={popupRef}
        className="fixed top-1/4 left-[18%] -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-md z-50 w-64 h-96 flex flex-col p-5"
      >
        {/* Header - Only draggable part */}
        <div
          ref={headerRef}
          className="drag-handle flex justify-between items-center mb-4 cursor-move"
        >
          <h2 className="text-base font-bold">노드 클래스 편집</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-medium focus:outline-none"
          >
            ×
          </button>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="클래스 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleEnterKey}
          className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Labels List - Not draggable */}
        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md mb-4 scrollbar scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {filteredLabels.length > 0 ? (
            filteredLabels.map((label) => (
              <div
                key={label}
                ref={(el) => (labelRefs.current[label] = el)}
                onClick={() => handleLabelSelect(label)}
                className={`p-3 cursor-pointer border-b border-gray-100 ${
                  label === selectedNode?.properties?.label
                    ? "bg-blue-50"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {label}
              </div>
            ))
          ) : (
            <div className="p-3 text-center">
              <div
                onClick={handleAddNewLabel}
                className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700"
              >
                "{searchTerm}" 클래스 추가
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => handleDeleteLabel(searchTerm)}
            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
          >
            제거(Delete)
          </button>
          <button
            onClick={handleAddNewLabel}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
          >
            저장(Enter)
          </button>
        </div>
      </div>
    </Draggable>
  );
};

export default LabelSelectorPopup;
