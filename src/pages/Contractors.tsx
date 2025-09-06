import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContractors, useCategories, generateId } from "@/hooks/useLocalStorage";
import { Contractor } from "@/types";
import { Plus, Users, Mail, Phone, Calendar, AlertTriangle, Edit, Trash2 } from "lucide-react";
import { ContractorForm } from "@/components/ContractorForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const Contractors = () => {
  const [contractors, setContractors] = useContractors();
  const [categories] = useCategories();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);
  const { toast } = useToast();

  const handleCreateContractor = (data: Omit<Contractor, 'id' | 'createdAt'>) => {
    const newContractor: Contractor = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setContractors(prev => [...prev, newContractor]);
    setIsDialogOpen(false);
    toast({
      title: "Sous-traitant créé",
      description: "Le nouveau sous-traitant a été ajouté avec succès",
    });
  };

  const handleUpdateContractor = (data: Omit<Contractor, 'id' | 'createdAt'>) => {
    if (!editingContractor) return;

    setContractors(prev => prev.map(contractor =>
      contractor.id === editingContractor.id
        ? { ...contractor, ...data }
        : contractor
    ));
    setEditingContractor(null);
    toast({
      title: "Sous-traitant modifié",
      description: "Les informations du sous-traitant ont été mises à jour",
    });
  };

  const handleDeleteContractor = (contractorId: string) => {
    setContractors(prev => prev.filter(c => c.id !== contractorId));
    toast({
      title: "Sous-traitant supprimé",
      description: "Le sous-traitant a été retiré de la liste",
    });
  };

  const getCategoryNames = (categoryIds?: string[]) => {
    if (!categoryIds || categoryIds.length === 0) return 'Aucune catégorie';
    return categoryIds
      .map(id => categories.find(c => c.id === id)?.name || 'Catégorie inconnue')
      .join(', ');
  };

  const getStatusColor = (status: Contractor['status']) => {
    switch (status) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'expire': return 'bg-red-100 text-red-800';
      case 'suspendu': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Contractor['status']) => {
    switch (status) {
      case 'actif': return 'Actif';
      case 'expire': return 'Expiré';
      case 'suspendu': return 'Suspendu';
      default: return status;
    }
  };

  const isContractExpired = (contractor: Contractor) => {
    const endDate = new Date(contractor.contractEnd);
    const today = new Date();
    return endDate < today && contractor.status === 'actif';
  };

  const getDaysUntilExpiration = (contractor: Contractor) => {
    const endDate = new Date(contractor.contractEnd);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isContractExpiringSoon = (contractor: Contractor) => {
    const days = getDaysUntilExpiration(contractor);
    return days <= 30 && days > 0 && contractor.status === 'actif';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sous-traitants</h1>
          <p className="text-muted-foreground">Gérez vos sous-traitants et leurs contrats</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Sous-traitant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau sous-traitant</DialogTitle>
            </DialogHeader>
            <ContractorForm onSubmit={handleCreateContractor} />
          </DialogContent>
        </Dialog>
      </div>

      {contractors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun sous-traitant</h3>
            <p className="text-muted-foreground mb-4">Commencez par ajouter votre premier sous-traitant</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un sous-traitant
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau sous-traitant</DialogTitle>
                </DialogHeader>
                <ContractorForm onSubmit={handleCreateContractor} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contractors.map((contractor) => (
            <Card key={contractor.id} className={`hover:shadow-md transition-shadow ${
              isContractExpired(contractor) ? 'border-red-200' : 
              isContractExpiringSoon(contractor) ? 'border-yellow-200' : ''
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{contractor.name}</CardTitle>
                  <div className="flex flex-col gap-1">
                    <Badge className={getStatusColor(contractor.status)}>
                      {getStatusLabel(contractor.status)}
                    </Badge>
                    {isContractExpired(contractor) && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Expiré
                      </Badge>
                    )}
                    {isContractExpiringSoon(contractor) && (
                      <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {getDaysUntilExpiration(contractor)}j
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>{contractor.specialty}</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-3">
                   <div className="flex items-center text-sm text-muted-foreground">
                     <Mail className="mr-2 h-4 w-4" />
                     <span className="truncate">{contractor.email}</span>
                   </div>
                   <div className="flex items-center text-sm text-muted-foreground">
                     <Phone className="mr-2 h-4 w-4" />
                     <span>{contractor.phone}</span>
                   </div>
                   <div className="flex items-center text-sm text-muted-foreground">
                     <Calendar className="mr-2 h-4 w-4" />
                     <span>
                       {new Date(contractor.contractStart).toLocaleDateString()} - {new Date(contractor.contractEnd).toLocaleDateString()}
                     </span>
                   </div>
                   <div className="text-sm text-muted-foreground">
                     <span className="font-medium">Catégories: </span>
                     {getCategoryNames(contractor.categoryIds)}
                   </div>
                   
                   {isContractExpired(contractor) && (
                     <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                       <div className="flex items-center">
                         <AlertTriangle className="w-4 h-4 mr-1" />
                         Contrat expiré depuis {Math.abs(getDaysUntilExpiration(contractor))} jour(s)
                       </div>
                     </div>
                   )}
                   
                   {isContractExpiringSoon(contractor) && (
                     <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                       <div className="flex items-center">
                         <AlertTriangle className="w-4 h-4 mr-1" />
                         Contrat expire dans {getDaysUntilExpiration(contractor)} jour(s)
                       </div>
                     </div>
                   )}

                   <div className="flex gap-2 mt-4">
                     <Dialog>
                       <DialogTrigger asChild>
                         <Button size="sm" variant="outline" onClick={() => setEditingContractor(contractor)}>
                           <Edit className="h-4 w-4 mr-1" />
                           Modifier
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="max-w-md">
                         <DialogHeader>
                           <DialogTitle>Modifier le sous-traitant</DialogTitle>
                         </DialogHeader>
                         <ContractorForm
                           onSubmit={handleUpdateContractor}
                           initialData={{
                             name: contractor.name,
                             email: contractor.email,
                             phone: contractor.phone,
                             specialty: contractor.specialty,
                             projectId: contractor.projectId,
                             categoryIds: contractor.categoryIds,
                             contractStart: contractor.contractStart,
                             contractEnd: contractor.contractEnd,
                             status: contractor.status
                           }}
                         />
                       </DialogContent>
                     </Dialog>

                     <AlertDialog>
                       <AlertDialogTrigger asChild>
                         <Button size="sm" variant="destructive">
                           <Trash2 className="h-4 w-4 mr-1" />
                           Supprimer
                         </Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                           <AlertDialogDescription>
                             Cette action supprimera définitivement le sous-traitant "{contractor.name}". 
                             Cette action ne peut pas être annulée.
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>Annuler</AlertDialogCancel>
                           <AlertDialogAction onClick={() => handleDeleteContractor(contractor.id)}>
                             Supprimer
                           </AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                     </AlertDialog>
                   </div>

                   <div className="text-xs text-muted-foreground">
                     Ajouté le {new Date(contractor.createdAt).toLocaleDateString()}
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

export default Contractors;