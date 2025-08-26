import React from 'react';

interface Recipe {
  id: string;
  name: string;
  preparation: {
    steps: string[];
    serving_tools?: string[];
    notes?: string;
  };
}

interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          Công thức: {recipe.name}
        </h2>
        <div className="text-sm sm:text-base">
          <h3 className="font-medium text-gray-800 mb-2">Nguyên liệu và các bước:</h3>
          <ul className="list-disc pl-5 mb-4">
            {recipe.preparation.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
          {recipe.preparation.serving_tools && (
            <>
              <h3 className="font-medium text-gray-800 mb-2">Dụng cụ phục vụ:</h3>
              <ul className="list-disc pl-5 mb-4">
                {recipe.preparation.serving_tools.map((tool, index) => (
                  <li key={index}>{tool}</li>
                ))}
              </ul>
            </>
          )}
          {recipe.preparation.notes && (
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Ghi chú:</h3>
              <p className="text-gray-600">{recipe.preparation.notes}</p>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition text-xs sm:text-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;