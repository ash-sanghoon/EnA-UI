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
      ...new Set(
        graphData.nodes
          .map((node) => node.properties?.label)
          .filter((label) => label && label.trim() !== "")
      ),
    ];
    return uniqueLabels.sort(); // Sort labels alphabetically
  }, [graphData]);

  const labelRefs = useRef({});
  const popupRef = useRef({});
  const headerRef = useRef({});
  const [searchTerm, setSearchTerm] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleDragStop = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  const filteredLabels = useMemo(() => {
    return labelOptions.filter((label) =>
      label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [labelOptions, searchTerm]);

  const handleAddNewLabel = () => {
    const newLabel = searchTerm.trim();
    if (newLabel && !labelOptions.includes(newLabel)) {
      onLabelSelect(newLabel, selectedNode);
      setSearchTerm("");
    }
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
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [selectedNode]);

  if (!isOpen) return null;

  return (
    <Draggable
      nodeRef={popupRef}
      handle=".popup"
      position={position}
      onStop={handleDragStop}
    >
      <div
        ref={popupRef}
        style={{
          position: "fixed",
          top: "11%",
          left: "14%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          zIndex: 1000,
          width: "250px",
          height: "380px",
          display: "flex",
          flexDirection: "column",
        }}
        className="popup"
      >
        <Draggable nodeRef={headerRef} handle="h2">
          <div
            ref={headerRef}
            className="popup-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <h2
              style={{
                marginBottom: "15px",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              노드 클래스 편집
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                color: "#888",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        </Draggable>

        <input
          type="text"
          placeholder="클래스 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleEnterKey}
          style={{
            width: "calc(100% - 16px)",
            padding: "8px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />

        <div
          style={{
            overflowY: "auto",
            height: "250px",
            border: "1px solid #eee",
            borderRadius: "4px",
            marginBottom: "15px",
          }}
        >
          {filteredLabels.length > 0 ? (
            filteredLabels.map((label) => (
              <div
                key={label}
                ref={(el) => (labelRefs.current[label] = el)} // 각 라벨 DOM 참조 저장
                onClick={() => handleLabelSelect(label)}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  backgroundColor:
                    label === selectedNode?.properties?.label
                      ? "#e7f3ff"
                      : "white",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                {label}
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "10px",
                color: "#888",
                textAlign: "center",
              }}
            >
              <div
                onClick={handleAddNewLabel}
                style={{
                  color: "#007bff",
                  cursor: "pointer",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                "{searchTerm}" 클래스 추가
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={() => handleDeleteLabel(searchTerm)}
            style={{
              padding: "7px",
              backgroundColor: "#ff4d4d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            제거(Delete)
          </button>
          <button
            onClick={handleAddNewLabel}
            style={{
              padding: "7px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            저장(Enter)
          </button>
        </div>
      </div>
    </Draggable>
  );
};

export default LabelSelectorPopup;
