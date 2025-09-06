import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjects, generateId } from "@/hooks/useLocalStorage";
import { Project } from "@/types";
import { Plus, Building2, Calendar, Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ProjectForm } from "@/components/ProjectForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNotification } from "@/contexts/NotificationContext";

const Projects = () => {
  const [projects, setProjects] = useProjects();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { addNotification } = useNotification();

  const handleCreateProject = (data: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setProjects(prev => [...prev, newProject]);
    setIsDialogOpen(false);

    // Ajouter une notification
    addNotification({
      type: 'success',
      title: 'Nouveau projet créé',
      description: `Le projet "${newProject.name}" a été créé avec succès.`,
    });
  };

  const handleUpdateProject = (data: Omit<Project, 'id' | 'createdAt'>) => {
    if (!editingProject) return;

    setProjects(prev => prev.map(project =>
      project.id === editingProject.id
        ? { ...project, ...data }
        : project
    ));
    setEditingProject(null);
    setIsDialogOpen(false);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'en_cours': return 'bg-blue-100 text-blue-800';
      case 'termine': return 'bg-green-100 text-green-800';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Project['status']) => {
    switch (status) {
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'en_attente': return 'En attente';
      default: return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projets</h1>
          <p className="text-muted-foreground">Gérez vos projets de construction</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Projet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un nouveau projet</DialogTitle>
            </DialogHeader>
            <ProjectForm onSubmit={handleCreateProject} />
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun projet</h3>
            <p className="text-muted-foreground mb-4">Commencez par créer votre premier projet</p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {editingProject ? "Modifier un projet" : "Créer un projet"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProject ? "Modifier le projet" : "Créer un nouveau projet"}
                    </DialogTitle>
                  </DialogHeader>
                  <ProjectForm
                    onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
                    initialData={editingProject ? {
                      name: editingProject.name,
                      description: editingProject.description,
                      startDate: editingProject.startDate,
                      endDate: editingProject.endDate,
                      status: editingProject.status
                    } : undefined}
                  />
                </DialogContent>
              </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>
                      {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-muted-foreground">
                  Créé le {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <Link to={`/projects/${project.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Voir détails
                    </Button>
                  </Link>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditingProject(project)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Modifier le projet</DialogTitle>
                      </DialogHeader>
                      <ProjectForm
                        onSubmit={handleUpdateProject}
                        initialData={{
                          name: project.name,
                          description: project.description,
                          startDate: project.startDate,
                          endDate: project.endDate,
                          status: project.status
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action supprimera définitivement le projet "{project.name}".
                          Cette action ne peut pas être annulée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteProject(project.id)}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;