import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects, useReserves, useTasks, useContractors } from "@/hooks/useLocalStorage";
import { Building2, AlertTriangle, CheckCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects] = useProjects();
  const [reserves] = useReserves();
  const [tasks] = useTasks();
  const [contractors] = useContractors();

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'en_cours').length,
    openReserves: reserves.filter(r => r.status === 'ouverte').length,
    urgentReserves: reserves.filter(r => r.priority === 'urgent' && r.status === 'ouverte').length,
    activeTasks: tasks.filter(t => t.status === 'en_cours').length,
    expiredContracts: contractors.filter(c => {
      const endDate = new Date(c.contractEnd);
      const today = new Date();
      return endDate < today && c.status === 'actif';
    }).length,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble de vos projets de construction</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => navigate('/projects')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets Actifs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              sur {stats.totalProjects} projets total
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => navigate('/reserves')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réserves Ouvertes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openReserves}</div>
            <p className="text-xs text-muted-foreground">
              dont {stats.urgentReserves} urgentes
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => navigate('/tasks')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches Actives</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTasks}</div>
            <p className="text-xs text-muted-foreground">
              en cours d'exécution
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => navigate('/contractors')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contrats Expirés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.expiredContracts}</div>
            <p className="text-xs text-muted-foreground">
              nécessitent attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projets Récents</CardTitle>
            <CardDescription>Derniers projets créés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-muted-foreground">{project.status}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun projet créé
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Réserves Urgentes</CardTitle>
            <CardDescription>Nécessitent une attention immédiate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reserves.filter(r => r.priority === 'urgent' && r.status === 'ouverte').slice(0, 5).map((reserve) => (
                <div key={reserve.id} className="flex items-center justify-between p-2 border rounded border-destructive/20">
                  <div>
                    <p className="font-medium">{reserve.title}</p>
                    <p className="text-sm text-muted-foreground">{reserve.status}</p>
                  </div>
                  <span className="text-xs text-destructive font-medium">
                    {reserve.priority}
                  </span>
                </div>
              ))}
              {reserves.filter(r => r.priority === 'urgent' && r.status === 'ouverte').length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune réserve urgente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;