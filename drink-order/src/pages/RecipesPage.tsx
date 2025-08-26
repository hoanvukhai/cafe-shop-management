import React, { useState, useRef, useEffect } from 'react';
import { recipes, Recipe } from '../data/recipes';
import { IoCloseSharp } from "react-icons/io5";

const RecipesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lọc công thức dựa trên tìm kiếm, giới hạn 5 kết quả
  const filteredRecipes = recipes.recipes
    .filter((recipe) => recipe.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 5);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Khóa cuộn khi mở modal
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isModalOpen]);

  return (
    <div className="p-6 max-w-4xl mx-auto mt-16">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Công thức pha chế</h2>
        <div className="mb-4 relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tìm công thức:</label>
          <input
            type="text"
            placeholder="Tìm công thức..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {search && filteredRecipes.length > 0 && (
            <div className="absolute z-40 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredRecipes.map((recipe, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedRecipe(recipe);
                    setSearch('');
                    setIsModalOpen(true);
                  }}
                >
                  {recipe.name}
                </div>
              ))}
            </div>
          )}
          {search && filteredRecipes.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
              <p className="text-gray-500">Không tìm thấy công thức.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recipes.recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition cursor-pointer"
            onClick={() => {
              setSelectedRecipe(recipe);
              setIsModalOpen(true);
            }}
          >
            <h3 className="text-lg font-semibold text-gray-800">{recipe.name}</h3>
            {recipe.preparation.notes && (
              <p className="text-sm text-gray-600 italic mt-2">Ghi chú: {recipe.preparation.notes}</p>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && selectedRecipe && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative bg-white rounded-lg shadow-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-2xl font-bold"
              aria-label="Đóng"
            >
              x
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4">{selectedRecipe.name}</h3>
            {selectedRecipe.preparation.steps && selectedRecipe.preparation.steps.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700">Các bước:</h4>
                <ol className="list-decimal pl-5">
                  {selectedRecipe.preparation.steps.map((step, index) => (
                    <li key={index} className="text-gray-600">{step}</li>
                  ))}
                </ol>
              </div>
            )}
            {selectedRecipe.preparation.serving_tools && selectedRecipe.preparation.serving_tools.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700">Dụng cụ phục vụ:</h4>
                <ul className="list-disc pl-5">
                  {selectedRecipe.preparation.serving_tools.map((tool, index) => (
                    <li key={index} className="text-gray-600">{tool}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedRecipe.preparation.notes && (
              <p className="text-gray-600 italic">Ghi chú: {selectedRecipe.preparation.notes}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesPage;