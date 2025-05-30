import { useState } from 'react';

interface ColorPickerModalProps {
  initialColor: string;
  onSave: (color: string) => void;
  onClose: () => void;
}

export default function ColorPickerModal({ initialColor, onSave, onClose }: ColorPickerModalProps) {
  const [color, setColor] = useState(initialColor);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-lg mb-4">Choisissez votre couleur</h2>
        <input
          type="color"
          value={color}
          onChange={e => setColor(e.target.value)}
          className="w-20 h-20 cursor-pointer"
        />
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">Annuler</button>
          <button onClick={() => onSave(color)} className="px-4 py-2 bg-blue-600 text-white rounded">Sauvegarder</button>
        </div>
      </div>
    </div>
  );
}
