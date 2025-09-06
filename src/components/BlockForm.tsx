import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Block } from "@/types";

interface BlockFormProps {
  onSubmit: (data: Omit<Block, 'id' | 'projectId' | 'createdAt'>) => void;
  initialData?: Partial<Block>;
  isEditing?: boolean;
}

export function BlockForm({ onSubmit, initialData, isEditing = false }: BlockFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom du bloc</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Bloc A, Immeuble 1..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Description du bloc..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">
        {isEditing ? 'Modifier' : 'Créer'} le bloc
      </Button>
    </form>
  );
}