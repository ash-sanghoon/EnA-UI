import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const ThumbnailSelect = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: "", label: "선택", thumbnail: "/api/files/view/title_type_A.png" },
    { value: "A", label: "유형 A", thumbnail: "/api/files/view/title_type_A.png" },
    { value: "B", label: "유형 B", thumbnail: "/api/files/view/title_type_B.png" },
    { value: "C", label: "유형 C", thumbnail: "/api/files/view/title_type_C.png" },
    { value: "D", label: "유형 D", thumbnail: "/api/files/view/title_type_D.png" }
  ];

  
    const selectedOption = options.find(opt => opt.value === value) || options[0];
  
    return (
      <div className="w-full grid grid-cols-4 gap-4 items-center">

        <div className="col-span-4 relative w-full">
          <div
            className="w-full border rounded-lg p-2 flex items-center justify-between cursor-pointer hover:border-purple-500"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center space-x-3 w-full">
            <span className="flex-grow">{selectedOption.label}</span>
            <img
                src={selectedOption.thumbnail}
                alt={selectedOption.label}
                className="h-9 w-auto object-contain rounded"
              />
            </div>
            <ChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
              {options.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 p-2 hover:bg-purple-50 cursor-pointer w-full"
                  onClick={() => {
                    onChange({ target: { name: 'drawing_no_pattern', value: option.value }});
                    setIsOpen(false);
                  }}
                >
                  <span className="flex-grow">{option.label}</span>
                  <img
                    src={option.thumbnail}
                    alt={option.label}
                    className="h-9 w-auto object-contain rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default ThumbnailSelect;
