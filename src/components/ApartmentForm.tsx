import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Apartment } from "@/types";

interface ApartmentFormProps {
  onSubmit: (data: Omit<Apartment, 'id' | 'projectId' | 'blockId' | 'createdAt'>) => void;
  initialData?: Partial<Apartment>;
  isEditing?: boolean;
}

export function ApartmentForm({ onSubmit, initialData, isEditing = false }: ApartmentFormProps) {
  const [formData, setFormData] = useState({
    number: initialData?.number || '',
    type: initialData?.type || 'appartement' as Apartment['type'],
    surface: initialData?.surface || 0,
    status: initialData?.status || 'libre' as Apartment['status']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="number">Numéro</Label>
        <Input
          id="number"
          value={formData.number}
          onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
          placeholder="Ex: A101, B205..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select value={formData.type} onValueChange={(value: Apartment['type']) => 
          setFormData(prev => ({ ...prev, type: value }))
        }>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="appartement">Appartement</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="studio">Studio</SelectItem>
            <SelectItem value="duplex">Duplex</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="surface">Surface (m²)</Label>
        <Input
          id="surface"
          type="number"
          min="0"
          step="0.01"
          value={formData.surface}
          onChange={(e) => setFormData(prev => ({ ...prev, surface: parseFloat(e.target.value) || 0 }))}
          placeholder="Ex: 85.5"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Statut</Label>
        <Select value={formData.status} onValueChange={(value: Apartment['status']) => 
          setFormData(prev => ({ ...prev, status: value }))
        }>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="libre">Libre</SelectItem>
            <SelectItem value="reserve">Réservé</SelectItem>
            <SelectItem value="vendu">Vendu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        {isEditing ? 'Modifier' : 'Créer'} l'appartement
      </Button>
    </form>
  );
}