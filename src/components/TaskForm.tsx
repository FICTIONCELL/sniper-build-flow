import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/hooks/useLocalStorage";
import { Task } from "@/types";

interface TaskFormProps {
  onSubmit: (data: Omit<Task, 'id' | 'createdAt'>) => void;
}

export function TaskForm({ onSubmit }: TaskFormProps) {
  const [projects] = useProjects();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    startDate: '',
    endDate: '',
    duration: 1,
    status: 'en_attente' as Task['status'],
    priority: 'normal' as Task['priority'],
    progress: 0,
    dependencies: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Titre *</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Titre de la tâche"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Description de la tâche..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Projet *</Label>
          <Select value={formData.projectId} onValueChange={(value) => 
            setFormData(prev => ({ ...prev, projectId: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Projet" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Assigné à</Label>
          <Input
            value={formData.assignedTo}
            onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
            placeholder="Nom de la personne"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date de début *</Label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Date de fin *</Label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Durée (jours)</Label>
          <Input
            type="number"
            min="1"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Priorité</Label>
          <Select value={formData.priority} onValueChange={(value: Task['priority']) => 
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
      </div>

      <Button type="submit" className="w-full">
        Créer la tâche
      </Button>
    </form>
  );
}