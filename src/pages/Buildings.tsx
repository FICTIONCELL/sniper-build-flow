import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Edit, Trash2, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProjects, useBlocks, useApartments, generateId } from "@/hooks/useLocalStorage";
import { BlockForm } from "@/components/BlockForm";
import { ApartmentForm } from "@/components/ApartmentForm";
import { useTranslation } from "@/contexts/TranslationContext";
import { Block, Apartment } from "@/types";

const Buildings = () => {
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const [projects] = useProjects();
  const [blocks, setBlocks] = useBlocks();
  const [apartments, setApartments] = useApartments();
  
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isApartmentDialogOpen, setIsApartmentDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedBlockId, setSelectedBlockId] = useState<string>("");

  const handleCreateBlock = (data: Omit<Block, 'id' | 'projectId' | 'createdAt'>) => {
    if (!selectedProjectId) {
      toast({
        title: t('selectProject') || "Sélectionnez un projet",
        description: t('selectProjectDescription') || "Veuillez sélectionner un projet avant de créer un bloc",
        variant: "destructive"
      });
      return;
    }

    const newBlock: Block = {
      ...data,
      id: generateId(),
      projectId: selectedProjectId,
      createdAt: new Date().toISOString()
    };

    setBlocks(prev => [...prev, newBlock]);
    setIsBlockDialogOpen(false);
    toast({
      title: t('blockCreated') || "Bloc créé",
      description: t('blockCreatedDescription') || "Le bloc a été créé avec succès",
    });
  };

  const handleEditBlock = (data: Omit<Block, 'id' | 'projectId' | 'createdAt'>) => {
    if (!editingBlock) return;

    const updatedBlock = { ...editingBlock, ...data };
    setBlocks(prev => prev.map(block => block.id === editingBlock.id ? updatedBlock : block));
    setEditingBlock(null);
    setIsBlockDialogOpen(false);
    toast({
      title: t('blockUpdated') || "Bloc mis à jour",
      description: t('blockUpdatedDescription') || "Le bloc a été mis à jour avec succès",
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
    // Also delete apartments in this block
    setApartments(prev => prev.filter(apt => apt.blockId !== blockId));
    toast({
      title: t('blockDeleted') || "Bloc supprimé",
      description: t('blockDeletedDescription') || "Le bloc et ses appartements ont été supprimés",
    });
  };

  const handleCreateApartment = (data: Omit<Apartment, 'id' | 'blockId' | 'createdAt'>) => {
    if (!selectedBlockId) {
      toast({
        title: t('selectBlock') || "Sélectionnez un bloc",
        description: t('selectBlockDescription') || "Veuillez sélectionner un bloc avant de créer un appartement",
        variant: "destructive"
      });
      return;
    }

    const newApartment: Apartment = {
      ...data,
      id: generateId(),
      blockId: selectedBlockId,
      createdAt: new Date().toISOString()
    };

    setApartments(prev => [...prev, newApartment]);
    setIsApartmentDialogOpen(false);
    toast({
      title: t('apartmentCreated') || "Appartement créé",
      description: t('apartmentCreatedDescription') || "L'appartement a été créé avec succès",
    });
  };

  const handleEditApartment = (data: Omit<Apartment, 'id' | 'blockId' | 'createdAt'>) => {
    if (!editingApartment) return;

    const updatedApartment = { ...editingApartment, ...data };
    setApartments(prev => prev.map(apt => apt.id === editingApartment.id ? updatedApartment : apt));
    setEditingApartment(null);
    setIsApartmentDialogOpen(false);
    toast({
      title: t('apartmentUpdated') || "Appartement mis à jour",
      description: t('apartmentUpdatedDescription') || "L'appartement a été mis à jour avec succès",
    });
  };

  const handleDeleteApartment = (apartmentId: string) => {
    setApartments(prev => prev.filter(apt => apt.id !== apartmentId));
    toast({
      title: t('apartmentDeleted') || "Appartement supprimé",
      description: t('apartmentDeletedDescription') || "L'appartement a été supprimé avec succès",
    });
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : t('unknownProject') || 'Projet inconnu';
  };

  const getBlockName = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    return block ? block.name : t('unknownBlock') || 'Bloc inconnu';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'occupé': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'réservé': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          {t('buildingsAndApartments') || 'Bâtiments et Appartements'}
        </h1>
        <p className="text-muted-foreground">
          {t('manageBuildingsDescription') || 'Gérez vos bâtiments et appartements'}
        </p>
      </div>

      {/* Project Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t('selectProject') || 'Sélectionner un Projet'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {projects.map(project => (
              <Button
                key={project.id}
                variant={selectedProjectId === project.id ? "default" : "outline"}
                onClick={() => setSelectedProjectId(project.id)}
              >
                {project.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blocks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            {t('blocks') || 'Blocs'}
          </h2>
          <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('addBlock') || 'Ajouter un Bloc'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingBlock ? t('editBlock') || 'Modifier le Bloc' : t('createBlock') || 'Créer un Bloc'}
                </DialogTitle>
              </DialogHeader>
              <BlockForm
                onSubmit={editingBlock ? handleEditBlock : handleCreateBlock}
                initialData={editingBlock || undefined}
                isEditing={!!editingBlock}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {blocks
            .filter(block => !selectedProjectId || block.projectId === selectedProjectId)
            .map(block => (
              <Card key={block.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{block.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingBlock(block);
                          setIsBlockDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBlock(block.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('project') || 'Projet'}: {getProjectName(block.projectId)}
                  </p>
                  {block.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {block.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {t('apartments') || 'Appartements'}: {apartments.filter(apt => apt.blockId === block.id).length}
                  </p>
                </CardContent>
              </Card>
            ))
          }
        </div>
      </div>

      {/* Block Selection for Apartments */}
      {selectedProjectId && (
        <Card>
          <CardHeader>
            <CardTitle>{t('selectBlock') || 'Sélectionner un Bloc'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {blocks
                .filter(block => block.projectId === selectedProjectId)
                .map(block => (
                  <Button
                    key={block.id}
                    variant={selectedBlockId === block.id ? "default" : "outline"}
                    onClick={() => setSelectedBlockId(block.id)}
                  >
                    {block.name}
                  </Button>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apartments Section */}
      {selectedBlockId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Home className="h-6 w-6" />
              {t('apartments') || 'Appartements'}
            </h2>
            <Dialog open={isApartmentDialogOpen} onOpenChange={setIsApartmentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addApartment') || 'Ajouter un Appartement'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingApartment ? t('editApartment') || 'Modifier l\'Appartement' : t('createApartment') || 'Créer un Appartement'}
                  </DialogTitle>
                </DialogHeader>
                <ApartmentForm
                  onSubmit={editingApartment ? handleEditApartment : handleCreateApartment}
                  initialData={editingApartment || undefined}
                  isEditing={!!editingApartment}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {apartments
              .filter(apt => apt.blockId === selectedBlockId)
              .map(apartment => (
                <Card key={apartment.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {t('apartment') || 'Appartement'} {apartment.number}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingApartment(apartment);
                            setIsApartmentDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteApartment(apartment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">{t('type') || 'Type'}:</span> {apartment.type}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">{t('surface') || 'Surface'}:</span> {apartment.surface}m²
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{t('status') || 'Statut'}:</span>
                        <Badge className={getStatusColor(apartment.status)}>
                          {apartment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('block') || 'Bloc'}: {getBlockName(apartment.blockId)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default Buildings;