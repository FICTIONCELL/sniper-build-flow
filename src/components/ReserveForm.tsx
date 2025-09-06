import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera } from "lucide-react";
import { useProjects, useBlocks, useApartments, useCategories, useContractors, useReserves } from "@/hooks/useLocalStorage";
import { Reserve } from "@/types";

interface ReserveFormProps {
  onSubmit: (data: Omit<Reserve, 'id' | 'createdAt'>) => void;
}

export function ReserveForm({ onSubmit }: ReserveFormProps) {
  const [projects] = useProjects();
  const [blocks] = useBlocks();
  const [apartments] = useApartments();
  const [categories] = useCategories();
  const [contractors] = useContractors();
  const [reserves] = useReserves();

  const [formData, setFormData] = useState({
    projectId: '',
    blockId: '',
    apartmentId: '',
    categoryId: '',
    contractorId: '',
    title: '',
    description: '',
    images: [] as string[],
    status: 'ouverte' as Reserve['status'],
    priority: 'normal' as Reserve['priority']
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (!submitData.blockId || submitData.blockId === 'none') delete (submitData as any).blockId;
    if (!submitData.apartmentId || submitData.apartmentId === 'none') delete (submitData as any).apartmentId;
    onSubmit(submitData);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const readers = files.map(file => {
        const reader = new FileReader();
        return new Promise<string>((resolve) => {
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(images => {
        setFormData(prev => ({ ...prev, images: [...prev.images, ...images] }));
      });
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.capture = 'environment'; // Utilise la caméra arrière sur mobile
      fileInputRef.current.click();
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const filteredBlocks = blocks.filter(b => b.projectId === formData.projectId);
  const filteredApartments = apartments.filter(a => a.blockId === formData.blockId);

  const getFilteredContractors = () => {
    let filtered = contractors;

    if (formData.projectId) {
      filtered = filtered.filter(c => c.projectId === formData.projectId);
    }

    if (formData.categoryId) {
      filtered = filtered.filter(c => c.categoryIds?.includes(formData.categoryId));
    }

    return filtered;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Projet *</Label>
        <Select value={formData.projectId} onValueChange={(value) => 
          setFormData(prev => ({ ...prev, projectId: value, blockId: '', apartmentId: '' }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un projet" />
          </SelectTrigger>
          <SelectContent>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Bloc (optionnel)</Label>
        <Select value={formData.blockId} onValueChange={(value) => 
          setFormData(prev => ({ ...prev, blockId: value, apartmentId: '' }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un bloc" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucun bloc spécifique</SelectItem>
            {filteredBlocks.map(block => (
              <SelectItem key={block.id} value={block.id}>{block.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Appartement (optionnel)</Label>
        <Select value={formData.apartmentId} onValueChange={(value) => 
          setFormData(prev => ({ ...prev, apartmentId: value }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un appartement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucun appartement spécifique</SelectItem>
            {filteredApartments.map(apartment => (
              <SelectItem key={apartment.id} value={apartment.id}>{apartment.number}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Catégorie *</Label>
          <Select value={formData.categoryId} onValueChange={(value) =>
            setFormData(prev => ({ ...prev, categoryId: value }))
          } disabled={!formData.projectId}>
            <SelectTrigger>
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Sous-traitant *</Label>
          <Select value={formData.contractorId} onValueChange={(value) =>
            setFormData(prev => ({ ...prev, contractorId: value }))
          } disabled={!formData.projectId || !formData.categoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Sous-traitant" />
            </SelectTrigger>
            <SelectContent>
              {getFilteredContractors().map(contractor => (
                <SelectItem key={contractor.id} value={contractor.id}>{contractor.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Titre *</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Titre de la réserve"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Description détaillée..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Photos</Label>
        <div className="flex flex-wrap gap-2">
          {formData.images.map((image, index) => (
            <div key={index} className="relative">
              <img src={image} alt={`Preview ${index}`} className="w-20 h-20 object-cover rounded border" />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                onClick={() => removeImage(index)}
                aria-label="Supprimer l'image"
              >
                X
              </Button>
            </div>
          ))}
        </div>
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
          multiple
          accept="image/*"
          capture="environment"
          aria-label="Ajouter des photos"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="mt-2">
          <Camera className="mr-2 h-4 w-4" />
          Ajouter une photo
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Priorité</Label>
        <Select value={formData.priority} onValueChange={(value: Reserve['priority']) => 
          setFormData(prev => ({ ...prev, priority: value }))
        }>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="faible">Faible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        Créer la réserve
      </Button>
    </form>
  );
}