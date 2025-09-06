import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Category } from "@/types";

interface CategoryFormProps {
  onSubmit: (data: Omit<Category, 'id' | 'createdAt'>) => void;
}

export function CategoryForm({ onSubmit }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const predefinedColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom de la catégorie</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Plomberie, Électricité..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Description de la catégorie..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Couleur</Label>
        <div className="flex gap-2 flex-wrap">
          {predefinedColors.map(color => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded border-2 ${formData.color === color ? 'border-gray-800' : 'border-gray-300'}`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData(prev => ({ ...prev, color }))}
            />
          ))}
        </div>
        <Input
          type="color"
          value={formData.color}
          onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
        />
      </div>

      <Button type="submit" className="w-full">
        Créer la catégorie
      </Button>
    </form>
  );
}