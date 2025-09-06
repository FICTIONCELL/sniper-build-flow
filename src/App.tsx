import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import { NotificationProvider, useNotification } from "@/contexts/NotificationContext";
import { useProjects, useContractors, useReserves } from "@/hooks/useLocalStorage";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Reserves from "./pages/Reserves";
import Contractors from "./pages/Contractors";
import ResolveReserves from "./pages/ResolveReserves";
import Receptions from "./pages/Receptions";
import Tasks from "./pages/Tasks";
import Planning from "./pages/Planning";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";
import CompactReserves from "./pages/CompactReserves";
import CompactDashboard from "./pages/CompactDashboard";
import TestPV from "./pages/TestPV";
import Buildings from "./pages/Buildings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const NotificationChecker = () => {
  const { addNotification } = useNotification();
  const [projects] = useProjects();
  const [contractors] = useContractors();
  const [reserves] = useReserves();
  const location = useLocation();

  useEffect(() => {
    const checkNotifications = () => {
      const today = new Date();

      // Vérifier les projets proches de la fin ou en retard
      projects.forEach(project => {
        const endDate = new Date(project.endDate);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          addNotification({
            type: 'error',
            title: `Projet en retard : ${project.name}`,
            description: `Ce projet a dépassé sa date de fin de ${Math.abs(diffDays)} jours.`,
          });
        } else if (diffDays <= 30) {
          addNotification({
            type: 'warning',
            title: `Projet proche de la fin : ${project.name}`,
            description: `Ce projet se termine dans ${diffDays} jours.`,
          });
        }
      });

      // Vérifier les contrats de sous-traitants proches de l'expiration
      contractors.forEach(contractor => {
        const endDate = new Date(contractor.contractEnd);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          addNotification({
            type: 'error',
            title: `Contrat expiré : ${contractor.name}`,
            description: `Le contrat de ce sous-traitant a expiré il y a ${Math.abs(diffDays)} jours.`,
          });
        } else if (diffDays <= 30) {
          addNotification({
            type: 'warning',
            title: `Contrat proche de l'expiration : ${contractor.name}`,
            description: `Le contrat de ce sous-traitant expire dans ${diffDays} jours.`,
          });
        }
      });

      // Vérifier les réserves en retard
      reserves.forEach(reserve => {
        if (reserve.status === 'ouverte') {
          addNotification({
            type: 'warning',
            title: `Réserve ouverte : ${reserve.title}`,
            description: `Cette réserve est toujours ouverte et nécessite une attention.`,
          });
        }
      });
    };

    // Vérifier les notifications au chargement de la page et toutes les 24 heures
    checkNotifications();
    const interval = setInterval(checkNotifications, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [location]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NotificationProvider>
        <NotificationChecker />
        <Routes>
          {/* Route compact sans Layout pour plein écran */}
          <Route
            path="/compact"
            element={<CompactDashboard />}
          />

          {/* Toutes les autres routes avec Layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/reserves" element={<Reserves />} />
                <Route path="/reserves/compact" element={<CompactReserves />} />
                <Route path="/contractors" element={<Contractors />} />
                <Route path="/resolve-reserves" element={<ResolveReserves />} />
                <Route path="/receptions" element={<Receptions />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/planning" element={<Planning />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/buildings" element={<Buildings />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/test-pv" element={<TestPV />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </NotificationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
