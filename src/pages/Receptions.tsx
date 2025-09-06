import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReceptions, useProjects, useBlocks, useCategories, useReserves, useContractors, generateId } from "@/hooks/useLocalStorage";
import { Reception } from "@/types";
import { Plus, ClipboardCheck, AlertTriangle, CheckCircle, Edit, Trash2, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import { useTranslation } from "@/contexts/TranslationContext";

const Receptions = () => {
  const [receptions, setReceptions] = useReceptions();
  const [projects] = useProjects();
  const [blocks] = useBlocks();
  const [categories] = useCategories();
  const [reserves] = useReserves();
  const [contractors] = useContractors();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedContractor, setSelectedContractor] = useState("");
  const [responsibleParties, setResponsibleParties] = useState("");
  
  const [editingReception, setEditingReception] = useState<Reception | null>(null);
  const [editingData, setEditingData] = useState<Partial<Reception>>({});
  
  const { t } = useTranslation();

  // Filtres dynamiques basés sur les sélections
  const getFilteredContractors = () => {
    if (!selectedCategory || selectedCategory === "all") return contractors;
    return contractors.filter(c => c.categoryIds.includes(selectedCategory));
  };

  const getFilteredCategories = () => {
    if (!selectedContractor || selectedContractor === "all") return categories;
    const contractor = contractors.find(c => c.id === selectedContractor);
    if (!contractor?.categoryIds.length) return categories;
    return categories.filter(c => contractor.categoryIds.includes(c.id));
  };

  const getFilteredBlocks = () => {
    if (!selectedProject) return [];
    return blocks.filter(b => b.projectId === selectedProject);
  };

  // Gestion des relations
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Reset contractor if it doesn't match the new category
    if (selectedContractor && selectedContractor !== "all") {
      const contractor = contractors.find(c => c.id === selectedContractor);
      if (contractor && !contractor.categoryIds.includes(categoryId)) {
        setSelectedContractor("all");
      }
    }
  };

  const handleContractorChange = (contractorId: string) => {
    setSelectedContractor(contractorId);
    // Auto-select category if contractor has one
    const contractor = contractors.find(c => c.id === contractorId);
    if (contractor?.categoryIds.length > 0) {
      setSelectedCategory(contractor.categoryIds[0]);
    }
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    setSelectedBlocks([]); // Reset blocks when project changes
  };

  const handleCreateReception = () => {
    if (!selectedProject) {
      toast({
        title: t('error') || "Erreur",
        description: "Veuillez sélectionner un projet",
        variant: "destructive",
      });
      return;
    }

    // Calculer les réserves liées
    const relatedReserves = reserves.filter(r => {
      let match = r.projectId === selectedProject && r.status === 'ouverte';
      if (selectedBlocks.length > 0 && !selectedBlocks.includes(r.blockId || '')) match = false;
      if (selectedCategory && selectedCategory !== 'all' && r.categoryId !== selectedCategory) match = false;
      return match;
    });

    const hasReserves = relatedReserves.length > 0;
    const urgentReserves = relatedReserves.filter(r => r.priority === 'urgent').length;
    
    // Calculer si c'est dans les délais (logique simplifiée)
    const project = projects.find(p => p.id === selectedProject);
    const projectEndDate = project ? new Date(project.endDate) : new Date();
    const today = new Date();
    const isOnTime = today <= projectEndDate;
    const delayDays = isOnTime ? 0 : Math.floor((today.getTime() - projectEndDate.getTime()) / (1000 * 60 * 60 * 24));

    // Générer le PV automatiquement
    const pvNumber = `PV-${project?.name.split(' ').join('-')}-${today.toLocaleDateString().split('/').join('-')}`;
    const pvContent = generatePV({
      pvNumber,
      projectName: project?.name || 'Projet inconnu',
      blockNames: selectedBlocks.map(blockId => blocks.find(b => b.id === blockId)?.name || 'Bloc inconnu').filter(Boolean),
      categoryName: selectedCategory && selectedCategory !== 'all' ? categories.find(c => c.id === selectedCategory)?.name || 'Catégorie inconnue' : null,
      contractorName: selectedContractor && selectedContractor !== 'all' ? contractors.find(c => c.id === selectedContractor)?.name || 'Sous-traitant inconnu' : null,
      receptionDate: today.toLocaleDateString(),
      hasReserves,
      reserveCount: relatedReserves.length,
      urgentReserves,
      isOnTime,
      delayDays,
      responsibleParties: responsibleParties.split(',').map(p => p.trim()).filter(p => p),
      reserves: relatedReserves,
    });

    const newReception: Reception = {
      id: generateId(),
      projectId: selectedProject,
      blockId: selectedBlocks.length === 1 ? selectedBlocks[0] : undefined,
      categoryId: selectedCategory && selectedCategory !== 'all' ? selectedCategory : undefined,
      date: new Date().toISOString(),
      responsibleParties: responsibleParties.split(',').map(p => p.trim()).filter(p => p),
      hasReserves,
      reserveCount: relatedReserves.length,
      isOnTime,
      delayDays,
      pvGenerated: true,
      pvContent,
      createdAt: new Date().toISOString(),
    };

    setReceptions(prev => [...prev, newReception]);
    setIsDialogOpen(false);
    setSelectedProject("");
    setSelectedBlocks([]);
    setSelectedCategory("all");
    setSelectedContractor("all");
    setResponsibleParties("");

    toast({
      title: "Réception créée",
      description: `Réception créée avec succès. ${hasReserves ? `${relatedReserves.length} réserve(s) identifiée(s)` : 'Aucune réserve'}`,
    });
  };

  const generatePV = (data: {
    projectName: string;
    blockNames: string[];
    categoryName: string | null;
    contractorName: string | null;
    receptionDate: string;
    hasReserves: boolean;
    reserveCount: number;
    urgentReserves: number;
    isOnTime: boolean;
    delayDays: number;
    responsibleParties: string[];
    pvNumber: string;
    reserves?: Array<{title: string}>;
  }) => {
    const partiesText = data.responsibleParties && data.responsibleParties.length > 0
      ? data.responsibleParties.map(party => `- ${party}`).join('\n')
      : 'Non spécifiées';

    const blockText = data.blockNames && data.blockNames.length > 0
      ? `Blocs: ${data.blockNames.join(', ')}`
      : '';

    const categoryText = data.categoryName ? `Catégorie: ${data.categoryName}` : '';

    const contractorText = data.contractorName ? `Sous-traitant: ${data.contractorName}` : '';

    const header = `PROCÈS-VERBAL DE RÉCEPTION DE CHANTIER

ID du PV: ${data.pvNumber}
Projet: ${data.projectName}
${blockText}
${categoryText}
${contractorText}
Date de réception: ${data.receptionDate}

PARTIES PRÉSENTES:
${partiesText}

`;

    const introduction = `Suite à la visite du chantier effectuée en date du ${data.receptionDate}, il a été procédé à la vérification des travaux réalisés.
Après examen des ouvrages et conformément aux dispositions contractuelles, il est constaté ce qui suit :`;

    const scenario1 = `Les travaux sont jugés conformes au marché et aux règles de l’art.
Le Maître d’Ouvrage prononce la réception définitive sans réserve, les délais contractuels ayant été respectés.`;

    const scenario2 = `Des réserves ont été émises concernant les éléments suivants :
${data.hasReserves && data.reserves && data.reserves.length > 0 ? data.reserves.map(reserve => `- ${reserve.title}`).join('\n') : 'Aucune réserve spécifique indiquée'}
L’Entreprise s’engage à lever ces réserves dans un délai de 15 jours à compter de ce jour.`;

    const scenario3 = `Les travaux ont été exécutés avec retard par rapport au délai contractuel fixé.
Un retard de ${data.delayDays} jours est constaté.
Les dispositions contractuelles relatives aux pénalités de retard pourront être appliquées par le Maître d’Ouvrage.`;

    const closure = `Le présent procès-verbal est établi pour servir et valoir ce que de droit.

Signatures :

Maître d’Ouvrage : _________________________
Maître d’Œuvre : _________________________
Entreprise exécutante : _________________________
Bureau de contrôle (si présent) : _________________________

`;

    if (!data.hasReserves && data.isOnTime) {
      return `${header}${introduction}

${scenario1}

${closure}
Généré le ${new Date().toLocaleString()}`;
    } else if (!data.hasReserves && !data.isOnTime) {
      return `${header}${introduction}

${scenario3}

${closure}
Généré le ${new Date().toLocaleString()}`;
    } else if (data.hasReserves && data.isOnTime) {
      return `${header}${introduction}

${scenario2}

${closure}
Généré le ${new Date().toLocaleString()}`;
    } else {
      return `${header}${introduction}

${scenario2}

${scenario3}

${closure}
Généré le ${new Date().toLocaleString()}`;
    }
  };

  const handleDeleteReception = (id: string) => {
    setReceptions(prev => prev.filter(r => r.id !== id));
    toast({
      title: "Réception supprimée",
      description: "La réception a été supprimée avec succès",
    });
  };

  const handleEditReception = (reception: Reception) => {
    setEditingReception(reception);
    setEditingData(reception);
  };

  const handleSaveEdit = () => {
    if (editingReception && editingData) {
      setReceptions(prev => prev.map(r => 
        r.id === editingReception.id 
          ? { ...r, ...editingData }
          : r
      ));
      setEditingReception(null);
      setEditingData({});
      toast({
        title: "Réception modifiée",
        description: "La réception a été modifiée avec succès",
      });
    }
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Projet inconnu';
  };

  const getBlockName = (blockId?: string) => {
    if (!blockId) return null;
    return blocks.find(b => b.id === blockId)?.name || 'Bloc inconnu';
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return null;
    return categories.find(c => c.id === categoryId)?.name || 'Catégorie inconnue';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Réceptions</h1>
          <p className="text-muted-foreground">Gérez les réceptions de vos projets avec relations dynamiques</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Réception
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle réception</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <Label className="text-sm font-medium">Projet *</Label>
                <Select value={selectedProject} onValueChange={handleProjectChange}>
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

              <div>
                <Label className="text-sm font-medium">Blocs (optionnel)</Label>
                <div className="max-h-32 overflow-y-auto border rounded p-2 space-y-1">
                  {getFilteredBlocks().map(block => (
                    <label key={block.id} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedBlocks.includes(block.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBlocks(prev => [...prev, block.id]);
                          } else {
                            setSelectedBlocks(prev => prev.filter(id => id !== block.id));
                          }
                        }}
                      />
                      <span>{block.name}</span>
                    </label>
                  ))}
                  {getFilteredBlocks().length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      {selectedProject ? "Aucun bloc disponible" : "Sélectionnez d'abord un projet"}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Catégorie (optionnel)</Label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {getFilteredCategories().map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Sous-traitant (optionnel)</Label>
                <Select value={selectedContractor} onValueChange={handleContractorChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un sous-traitant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les sous-traitants</SelectItem>
                    {getFilteredContractors().map(contractor => (
                      <SelectItem key={contractor.id} value={contractor.id}>{contractor.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategory && selectedCategory !== "all" && getFilteredContractors().length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Aucun sous-traitant associé à cette catégorie
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Parties responsables</Label>
                <Textarea
                  placeholder="Entrez les noms séparés par des virgules"
                  value={responsibleParties}
                  onChange={(e) => setResponsibleParties(e.target.value)}
                />
              </div>

              <Button onClick={handleCreateReception} className="w-full">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Créer la réception
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {receptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune réception</h3>
            <p className="text-muted-foreground mb-4">Commencez par créer votre première réception</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {receptions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((reception) => (
              <Card key={reception.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      {editingReception?.id === reception.id ? (
                        <div className="space-y-2">
                          <Input
                            value={getProjectName(editingData.projectId || reception.projectId)}
                            disabled
                          />
                          <Input
                            placeholder="Parties responsables"
                            value={editingData.responsibleParties?.join(', ') || ''}
                            onChange={(e) => setEditingData(prev => ({
                              ...prev,
                              responsibleParties: e.target.value.split(',').map(p => p.trim()).filter(p => p)
                            }))}
                          />
                        </div>
                      ) : (
                        <>
                          <CardTitle className="text-lg">
                            Réception - {getProjectName(reception.projectId)}
                          </CardTitle>
                          <CardDescription>
                            {getBlockName(reception.blockId) && `Bloc: ${getBlockName(reception.blockId)} • `}
                            {getCategoryName(reception.categoryId) && `Catégorie: ${getCategoryName(reception.categoryId)} • `}
                            {new Date(reception.date).toLocaleDateString()}
                          </CardDescription>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingReception?.id === reception.id ? (
                        <>
                          <Button size="sm" onClick={handleSaveEdit}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditingReception(null);
                            setEditingData({});
                          }}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEditReception(reception)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer cette réception ? Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteReception(reception.id)}>
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      <div className="flex flex-col gap-2">
                        {reception.hasReserves ? (
                          <Badge variant="destructive">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Avec réserves ({reception.reserveCount})
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Sans réserve
                          </Badge>
                        )}
                        {reception.isOnTime ? (
                          <Badge variant="outline" className="border-green-200 text-green-700">
                            Dans les délais
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Retard: {reception.delayDays}j
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Date de réception</p>
                        <p>{new Date(reception.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Parties responsables</p>
                        <p>{reception.responsibleParties && reception.responsibleParties.length > 0 ? reception.responsibleParties.join(', ') : 'Non spécifiées'}</p>
                      </div>
                    </div>

                    {reception.hasReserves && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">
                            {reception.reserveCount} réserve(s) identifiée(s)
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <QRCodeGenerator
                        data={{
                          pvNumber: `REC-${reception.id.slice(-6)}`,
                          date: new Date(reception.date).toLocaleDateString(),
                          id: reception.id,
                          type: 'pv',
                          title: `Réception - ${getProjectName(reception.projectId)}`,
                          projectName: getProjectName(reception.projectId),
                          description: reception.pvContent
                        }}
                        projectName={getProjectName(reception.projectId)}
                        description={reception.pvContent}
                        className="mt-4"
                      />
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

export default Receptions;