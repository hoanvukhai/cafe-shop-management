import React, { useState, useRef, useEffect } from 'react';
import { preparationInstructions, PreparationInstruction } from '../data/preparation_instructions';
import { IoCloseSharp } from "react-icons/io5";

const PreparationPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedInstruction, setSelectedInstruction] = useState<PreparationInstruction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredInstructions = Object.values(preparationInstructions)
    .filter((instruction) => instruction.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 5); // Limit to 5 results

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    // Dọn dẹp khi component unmount hoặc modal đóng
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isModalOpen]);

  return (
    <div className="p-6 max-w-4xl mx-auto mt-16">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Hướng dẫn sơ chế</h2>
        <div className="mb-4 relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tìm công thức:</label>
          <input
            type="text"
            placeholder="Tìm công thức..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {search && filteredInstructions.length > 0 && (
            <div className="absolute z-40 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredInstructions.map((instruction, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedInstruction(instruction);
                    setSearch('');
                    setIsModalOpen(true);
                  }}
                >
                  {instruction.name}
                </div>
              ))}
            </div>
          )}
          {search && filteredInstructions.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
              <p className="text-gray-500">Không tìm thấy công thức.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.values(preparationInstructions).map((instruction) => (
          <div
            key={instruction.name}
            className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition cursor-pointer"
            onClick={() => {
              setSelectedInstruction(instruction);
              setIsModalOpen(true);
            }}
          >
            <h3 className="text-lg font-semibold text-gray-800">{instruction.name}</h3>
            {instruction.preparation.yield && (
              <span className="inline-block bg-green-100 text-green-800 text-sm px-2 py-1 rounded mt-2">
                Sản lượng: {instruction.preparation.yield}
              </span>
            )}
            {instruction.preparation.notes && (
              <p className="text-sm text-gray-600 italic mt-2">Ghi chú: {instruction.preparation.notes}</p>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && selectedInstruction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
        onClick={() => setIsModalOpen(false)}
      >
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()} // Ngăn sự kiện nổi bọt ra ngoài
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-1 right-4 text-red-500 hover:text-red-700 text-xl font-bold"
              aria-label="Đóng"
            >
              x
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4">{selectedInstruction.name}</h3>
            {selectedInstruction.preparation.ingredients && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700">Nguyên liệu:</h4>
                <ul className="list-disc pl-5">
                  {selectedInstruction.preparation.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-gray-600">{ingredient}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedInstruction.preparation.equipment && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700">Dụng cụ:</h4>
                <ul className="list-disc pl-5">
                  {selectedInstruction.preparation.equipment.map((equipment, index) => (
                    <li key={index} className="text-gray-600">{equipment}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700">Các bước:</h4>
              <ol className="list-decimal pl-5">
                {selectedInstruction.preparation.steps.map((step, index) => (
                  <li key={index} className="text-gray-600">{step}</li>
                ))}
              </ol>
            </div>
            {selectedInstruction.preparation.yield && (
              <p className="text-gray-600">Sản lượng: {selectedInstruction.preparation.yield}</p>
            )}
            {selectedInstruction.preparation.notes && (
              <p className="text-gray-600 italic">Ghi chú: {selectedInstruction.preparation.notes}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreparationPage;