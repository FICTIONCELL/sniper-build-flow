import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useReserves, useProjects, useBlocks, useApartments, useCategories, useContractors, generateId } from "@/hooks/useLocalStorage";
import { Reserve } from "@/types";
import { Plus, AlertTriangle, Eye, Filter, Download } from "lucide-react";
import { ReserveForm } from "@/components/ReserveForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Reserves = () => {
  const [reserves, setReserves] = useReserves();
  const [projects] = useProjects();
  const [blocks] = useBlocks();
  const [apartments] = useApartments();
  const [categories] = useCategories();
  const [contractors] = useContractors();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportProject, setExportProject] = useState<string>("all");
  const [exportCategory, setExportCategory] = useState<string>("all");
  const [exportContractor, setExportContractor] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterContractor, setFilterContractor] = useState<string>("all");

  // Filtres dynamiques basés sur les sélections
  const getFilteredCategories = () => {
    if (filterProject === "all" && filterContractor === "all") return categories;

    let categoryIds = new Set<string>();

    if (filterProject !== "all") {
      const projectReserves = reserves.filter(r => r.projectId === filterProject);
      projectReserves.forEach(r => categoryIds.add(r.categoryId));
    }

    if (filterContractor !== "all") {
      const contractor = contractors.find(c => c.id === filterContractor);
      if (contractor) {
        contractor.categoryIds?.forEach(id => categoryIds.add(id));
      }
    }

    return categories.filter(c => categoryIds.has(c.id));
  };

  const getFilteredContractors = () => {
    if (filterProject === "all" && filterCategory === "all") return contractors;

    let filtered = contractors;

    if (filterProject !== "all") {
      filtered = filtered.filter(c => c.projectId === filterProject);
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(c => c.categoryIds?.includes(filterCategory));
    }

    return filtered;
  };

  const getFilteredProjects = () => {
    if (filterCategory === "all" && filterContractor === "all") return projects;

    let projectIds = new Set<string>();

    if (filterCategory !== "all") {
      const categoryReserves = reserves.filter(r => r.categoryId === filterCategory);
      categoryReserves.forEach(r => projectIds.add(r.projectId));
    }

    if (filterContractor !== "all") {
      const contractor = contractors.find(c => c.id === filterContractor);
      if (contractor) {
        projectIds.add(contractor.projectId);
      }
    }

    return projects.filter(p => projectIds.has(p.id));
  };

  const handleCreateReserve = (data: Omit<Reserve, 'id' | 'createdAt'>) => {
    const newReserve: Reserve = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setReserves(prev => [...prev, newReserve]);
    setIsDialogOpen(false);
  };

  const filteredReserves = reserves.filter(reserve => {
    if (filterStatus !== "all" && reserve.status !== filterStatus) return false;
    if (filterPriority !== "all" && reserve.priority !== filterPriority) return false;
    if (filterProject !== "all" && reserve.projectId !== filterProject) return false;
    if (filterCategory !== "all" && reserve.categoryId !== filterCategory) return false;
    if (filterContractor !== "all" && reserve.contractorId !== filterContractor) return false;
    return true;
  });

  const getStatusColor = (status: Reserve['status']) => {
    switch (status) {
      case 'ouverte': return 'bg-red-100 text-red-800';
      case 'en_cours': return 'bg-yellow-100 text-yellow-800';
      case 'resolue': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generatePVContent = (reserve: Reserve, date: string, delayDays: number, reservesList: string[]) => {
    const hasReserves = reservesList.length > 0;
    const isOnTime = delayDays <= 0;

    if (!hasReserves && isOnTime) {
      return `Suite à la visite du chantier effectuée en date du ${date}, il a été procédé à la vérification des travaux réalisés.
Après examen des ouvrages et conformément aux dispositions contractuelles, il est constaté que l’ensemble des prestations est conforme au marché et aux règles de l’art.
En conséquence, le Maître d’Ouvrage prononce la réception définitive des travaux sans aucune réserve, les délais contractuels ayant été respectés.`;
    } else if (!hasReserves && !isOnTime) {
      return `Suite à la visite du chantier effectuée en date du ${date}, il a été procédé à la vérification des travaux réalisés.
Les ouvrages sont jugés conformes aux stipulations contractuelles et aux règles de l’art, ne nécessitant aucune réserve.
Toutefois, il est constaté que les travaux ont été exécutés avec un retard de ${Math.abs(delayDays)} jours par rapport au délai contractuel.
Le Maître d’Ouvrage se réserve le droit d’appliquer, le cas échéant, les dispositions prévues au marché relatives aux pénalités de retard.`;
    } else if (hasReserves && isOnTime) {
      return `Suite à la visite du chantier effectuée en date du ${date}, il a été procédé à la vérification des travaux réalisés.
Après examen, certains ouvrages présentent des non-conformités ou inachèvements mineurs.
En conséquence, la réception est prononcée avec réserves, lesquelles portent notamment sur : ${reservesList.join(', ')}.
L’Entreprise s’engage à lever ces réserves dans un délai maximum de [x jours/semaines] à compter de ce jour.`;
    } else {
      return `Suite à la visite du chantier effectuée en date du ${date}, il a été procédé à la vérification des travaux réalisés.
Il est constaté que les ouvrages, bien que globalement conformes, présentent certaines réserves relatives à ${reservesList.join(', ')}.
De plus, un retard de ${Math.abs(delayDays)} jours est constaté par rapport au délai contractuel initial.
La réception est prononcée avec réserves et hors délai.
Le Maître d’Ouvrage se réserve le droit de faire appliquer les pénalités de retard prévues au contrat, jusqu’à la levée effective des réserves.`;
    }
  };

  const getPriorityColor = (priority: Reserve['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'faible': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Reserve['status']) => {
    switch (status) {
      case 'ouverte': return 'Ouverte';
      case 'en_cours': return 'En cours';
      case 'resolue': return 'Résolue';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: Reserve['priority']) => {
    switch (priority) {
      case 'urgent': return 'Urgent';
      case 'normal': return 'Normal';
      case 'faible': return 'Faible';
      default: return priority;
    }
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Projet inconnu';
  };

  const getBlockName = (blockId?: string) => {
    if (!blockId) return null;
    return blocks.find(b => b.id === blockId)?.name || 'Bloc inconnu';
  };

  const getApartmentNumber = (apartmentId?: string) => {
    if (!apartmentId) return null;
    return apartments.find(a => a.id === apartmentId)?.number || 'Appartement inconnu';
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Catégorie inconnue';
  };

  const getContractorName = (contractorId: string) => {
    return contractors.find(c => c.id === contractorId)?.name || 'Sous-traitant inconnu';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Réserves</h1>
          <p className="text-muted-foreground">Gérez les réserves de vos projets</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Exporter les réserves</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Projet</label>
                  <Select value={exportProject} onValueChange={setExportProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un projet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les projets</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie</label>
                  <Select value={exportCategory} onValueChange={setExportCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sous-traitant</label>
                  <Select value={exportContractor} onValueChange={setExportContractor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un sous-traitant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les sous-traitants</SelectItem>
                      {contractors.map(contractor => (
                        <SelectItem key={contractor.id} value={contractor.id}>{contractor.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={() => {
                    const filteredReserves = reserves.filter(reserve => {
                      if (exportProject !== "all" && reserve.projectId !== exportProject) return false;
                      if (exportCategory !== "all" && reserve.categoryId !== exportCategory) return false;
                      if (exportContractor !== "all" && reserve.contractorId !== exportContractor) return false;
                      return true;
                    });

const csvContent = [
  ["Titre", "Projet", "Bloc", "Appartement", "Description", "Priorité", "Date de création"].join(","),
  ...filteredReserves.map(reserve => [
    `"${reserve.title.replace(/"/g, '""')}"`,
    `"${getProjectName(reserve.projectId).replace(/"/g, '""')}"`,
    `"${(getBlockName(reserve.blockId) || '').replace(/"/g, '""')}"`,
    `"${(getApartmentNumber(reserve.apartmentId) || '').replace(/"/g, '""')}"`,
    `"${reserve.description.replace(/"/g, '""')}"`,
    `"${getPriorityLabel(reserve.priority).replace(/"/g, '""')}"`,
    `"${new Date(reserve.createdAt).toLocaleDateString()}"`
  ].join(","))
].join("\n");

                    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "reserves_export.csv";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setIsExportDialogOpen(false);
                  }}
                >
                  Exporter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Réserve
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle réserve</DialogTitle>
              </DialogHeader>
              <ReserveForm onSubmit={handleCreateReserve} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filtres:</span>
        </div>
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Projet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les projets</SelectItem>
            {getFilteredProjects().map(project => (
              <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {getFilteredCategories().map(category => (
              <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterContractor} onValueChange={setFilterContractor}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sous-traitant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les sous-traitants</SelectItem>
            {getFilteredContractors().map(contractor => (
              <SelectItem key={contractor.id} value={contractor.id}>{contractor.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="ouverte">Ouverte</SelectItem>
            <SelectItem value="en_cours">En cours</SelectItem>
            <SelectItem value="resolue">Résolue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Priorité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les priorités</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="faible">Faible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredReserves.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune réserve</h3>
            <p className="text-muted-foreground mb-4">
              {reserves.length === 0 ? "Commencez par créer votre première réserve" : "Aucune réserve ne correspond aux filtres"}
            </p>
            {reserves.length === 0 && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer une réserve
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Créer une nouvelle réserve</DialogTitle>
                  </DialogHeader>
                  <ReserveForm onSubmit={handleCreateReserve} />
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          {filteredReserves.map((reserve) => (
            <Card key={reserve.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{reserve.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {reserve.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getStatusColor(reserve.status)}>
                      {getStatusLabel(reserve.status)}
                    </Badge>
                    <Badge className={getPriorityColor(reserve.priority)}>
                      {getPriorityLabel(reserve.priority)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Projet:</p>
                      <p className="text-muted-foreground">{getProjectName(reserve.projectId)}</p>
                    </div>
                    <div>
                      <p className="font-medium">Catégorie:</p>
                      <p className="text-muted-foreground">{getCategoryName(reserve.categoryId)}</p>
                    </div>
                    {getBlockName(reserve.blockId) && (
                      <div>
                        <p className="font-medium">Bloc:</p>
                        <p className="text-muted-foreground">{getBlockName(reserve.blockId)}</p>
                      </div>
                    )}
                    {getApartmentNumber(reserve.apartmentId) && (
                      <div>
                        <p className="font-medium">Appartement:</p>
                        <p className="text-muted-foreground">{getApartmentNumber(reserve.apartmentId)}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">Sous-traitant:</p>
                      <p className="text-muted-foreground">{getContractorName(reserve.contractorId)}</p>
                    </div>
                    <div>
                      <p className="font-medium">Créé le:</p>
                      <p className="text-muted-foreground">{new Date(reserve.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {reserve.images && reserve.images.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">{reserve.images.length} image(s) attachée(s)</p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Voir détails
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        {reserve && (
                          <>
                            <DialogHeader>
                              <DialogTitle>{reserve.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium">Projet</p>
                                  <p>{getProjectName(reserve.projectId)}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Statut</p>
                                  <Badge className={getStatusColor(reserve.status)}>
                                    {getStatusLabel(reserve.status)}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Priorité</p>
                                  <Badge className={getPriorityColor(reserve.priority)}>
                                    {getPriorityLabel(reserve.priority)}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Catégorie</p>
                                  <p>{getCategoryName(reserve.categoryId)}</p>
                                </div>
                                {getBlockName(reserve.blockId) && (
                                  <div>
                                    <p className="text-sm font-medium">Bloc</p>
                                    <p>{getBlockName(reserve.blockId)}</p>
                                  </div>
                                )}
                                {getApartmentNumber(reserve.apartmentId) && (
                                  <div>
                                    <p className="text-sm font-medium">Appartement</p>
                                    <p>{getApartmentNumber(reserve.apartmentId)}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium">Sous-traitant</p>
                                  <p>{getContractorName(reserve.contractorId)}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Date de création</p>
                                  <p>{new Date(reserve.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Description</p>
                                <p className="text-muted-foreground">{reserve.description}</p>
                              </div>
                              {reserve.images && reserve.images.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium">Images</p>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {reserve.images.map((image, index) => (
                                      <img key={index} src={image} alt={`Image ${index}`} className="w-20 h-20 object-cover rounded border" />
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium">Procès-Verbal</p>
                                <div className="border rounded p-4 mt-2 bg-gray-50">
                                  <p className="text-sm whitespace-pre-line">
                                    {generatePVContent(
                                      reserve,
                                      new Date(reserve.createdAt).toLocaleDateString(),
                                      0, // Remplacer par la logique de calcul des jours de retard
                                      reserve.description.split(', ') // Remplacer par la logique de récupération des réserves
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>
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

export default Reserves;