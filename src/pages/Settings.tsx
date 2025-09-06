import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Moon, Sun, Bell, BellOff, Globe, Download, Upload, Smartphone, Trash2, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage, useProjects, useBlocks, useApartments, useCategories, useContractors, useReserves, useTasks, useReceptions } from "@/hooks/useLocalStorage";
import { useTranslation } from "@/contexts/TranslationContext";
import { generateDemoData } from "@/utils/demoData";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNotification } from "@/contexts/NotificationContext";

interface SettingsData {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: 'fr' | 'ar' | 'en' | 'es';
  compactMode: boolean;
}

const Settings = () => {
  const { toast } = useToast();
  const { t, language, setLanguage } = useTranslation();
  const [settings, setSettings] = useLocalStorage<SettingsData>('settings', {
    theme: 'light',
    notifications: true,
    language: 'fr',
    compactMode: false
  });
  const { state, updateSettings } = useNotification();

  // Data hooks for export/import
  const [projects, setProjects] = useProjects();
  const [blocks, setBlocks] = useBlocks();
  const [apartments, setApartments] = useApartments();
  const [categories, setCategories] = useCategories();
  const [contractors, setContractors] = useContractors();
  const [reserves, setReserves] = useReserves();
  const [tasks, setTasks] = useTasks();
  const [receptions, setReceptions] = useReceptions();

  const [currentTheme, setCurrentTheme] = useState(settings.theme);
  const [eraseCode, setEraseCode] = useState("");

  const loadDemoData = () => {
    const demoData = generateDemoData();
    
    setProjects(demoData.projects);
    setBlocks(demoData.blocks);
    setApartments(demoData.apartments);
    setCategories(demoData.categories);
    setContractors(demoData.contractors);
    setReserves(demoData.reserves);
    setTasks(demoData.tasks);
    setReceptions(demoData.receptions);

    toast({
      title: "Données démo chargées",
      description: "Un jeu de données complet a été chargé pour tester l'application",
    });
  };

  const handleEraseData = () => {
    if (eraseCode !== "1270") {
      toast({
        title: "Code incorrect",
        description: "Veuillez saisir le code 1270 pour confirmer l'effacement",
        variant: "destructive"
      });
      return;
    }

    // Effacer toutes les données
    setProjects([]);
    setBlocks([]);
    setApartments([]);
    setCategories([]);
    setContractors([]);
    setReserves([]);
    setTasks([]);
    setReceptions([]);
    
    setEraseCode("");
    
    toast({
      title: "Données effacées",
      description: "Toutes les données ont été supprimées de l'application",
    });
  };

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply RTL for Arabic
    if (language === 'ar') {
      root.setAttribute('dir', 'rtl');
    } else {
      root.setAttribute('dir', 'ltr');
    }
  }, [settings.theme, language]);

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setSettings(prev => ({ ...prev, theme }));
    setCurrentTheme(theme);
    toast({
      title: t('themeUpdated') || "Thème mis à jour",
      description: `${t('themeChangedTo') || 'Thème changé vers'}: ${getThemeName(theme)}`,
    });
  };

  const handleNotificationsChange = (notifications: boolean) => {
    setSettings(prev => ({ ...prev, notifications }));
    toast({
      title: t('notificationsUpdated') || "Notifications mises à jour",
      description: notifications ? t('notificationsEnabled') || "Notifications activées" : t('notificationsDisabled') || "Notifications désactivées",
    });
  };

  const handleLanguageChange = (newLanguage: 'fr' | 'ar' | 'en' | 'es') => {
    setSettings(prev => ({ ...prev, language: newLanguage }));
    setLanguage(newLanguage);
    toast({
      title: t('languageUpdated') || "Langue mise à jour",
      description: `${t('languageChangedTo') || 'Langue changée vers'}: ${getLanguageName(newLanguage)}`,
    });
  };

  const getLanguageName = (lang: string) => {
    const names: Record<string, string> = {
      fr: 'Français',
      ar: 'العربية',
      en: 'English', 
      es: 'Español'
    };
    return names[lang] || lang;
  };

  const getThemeName = (theme: string) => {
    switch (theme) {
      case 'light': return t('lightTheme');
      case 'dark': return t('darkTheme');
      case 'system': return t('systemTheme');
      default: return theme;
    }
  };

  const handleCompactModeChange = (compactMode: boolean) => {
    setSettings(prev => ({ ...prev, compactMode }));
    toast({
      title: t('compactModeUpdated') || "Mode compact mis à jour",
      description: compactMode ? t('compactModeEnabled') || "Mode compact activé" : t('compactModeDisabled') || "Mode compact désactivé",
    });
  };

  const exportData = () => {
    const allData = {
      projects,
      blocks,
      apartments,
      categories,
      contractors,
      reserves,
      tasks,
      receptions,
      settings,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: t('dataExported') || "Données exportées",
      description: t('dataExportedDescription') || "Vos données ont été exportées avec succès",
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (importedData.projects) setProjects(importedData.projects);
        if (importedData.blocks) setBlocks(importedData.blocks);
        if (importedData.apartments) setApartments(importedData.apartments);
        if (importedData.categories) setCategories(importedData.categories);
        if (importedData.contractors) setContractors(importedData.contractors);
        if (importedData.reserves) setReserves(importedData.reserves);
        if (importedData.tasks) setTasks(importedData.tasks);
        if (importedData.receptions) setReceptions(importedData.receptions);
        if (importedData.settings) setSettings(importedData.settings);

        toast({
          title: t('Data Imported') || "Données importées",
          description: t('Data Imported') || "Vos données ont été importées avec succès",
        });
      } catch (error) {
        toast({
          title: t('importError') || "Erreur d'importation",
          description: t('invalidFileFormat') || "Format de fichier invalide",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const resetSettings = () => {
    const defaultSettings: SettingsData = {
      theme: 'light',
      notifications: true,
      language: 'fr',
      compactMode: false
    };
    setSettings(defaultSettings);
    setCurrentTheme(defaultSettings.theme);
    setLanguage('fr');
    toast({
      title: t('settingsReset') || "Paramètres réinitialisés",
      description: t('settingsResetDescription') || "Tous les paramètres ont été remis à leurs valeurs par défaut",
    });
  };

  return (
    <div className="p-6 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          {t('settings')}
        </h1>
        <p className="text-muted-foreground">{t('customizeExperience') || 'Personnalisez votre expérience d\'utilisation'}</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentTheme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              {t('appearance') || 'Apparence'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-select" className="text-base">{t('interfaceTheme') || 'Thème de l\'interface'}</Label>
              <Select value={settings.theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      {t('lightTheme')}
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      {t('darkTheme')}
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <SettingsIcon className="h-4 w-4" />
                      {t('systemTheme')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('chooseAppearance') || 'Choisissez l\'apparence de l\'interface selon vos préférences'}
            </p>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {state.soundEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
              {t('notifications')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="Notification-sound-switch" className="text-base">{t('notificationSound') || 'Son des notifications'}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('Activer ou désactiver le son des notifications') || 'Activer ou désactiver le son des notifications'}
                </p>
              </div>
              <Switch
                id="notification-sound-switch"
                checked={state.soundEnabled}
                onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('languageAndRegion') || 'Langue et Région'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="language-select" className="text-base">{t('interfaceLanguage') || 'Langue de l\'interface'}</Label>
              <Select value={settings.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">
                    <div className="flex items-center gap-2">
                      🇫🇷 Français
                    </div>
                  </SelectItem>
                  <SelectItem value="ar">
                    <div className="flex items-center gap-2">
                      🇸🇦 العربية
                    </div>
                  </SelectItem>
                  <SelectItem value="en">
                    <div className="flex items-center gap-2">
                      🇺🇸 English
                    </div>
                  </SelectItem>
                  <SelectItem value="es">
                    <div className="flex items-center gap-2">
                      🇪🇸 Español
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('UI Language') || 'Langue d\'affichage de l\'interface utilisateur'}
            </p>
          </CardContent>
        </Card>

        {/* Compact Mode Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              {t('Compact Mode') || 'Mode Compact'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="compact-switch" className="text-base">{t('enableCompactMode') || 'Activer le mode compact'}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('compact Mode') || 'Interface optimisée pour mobile avec ajout rapide'}
                </p>
              </div>
              <Switch
                id="compact-switch"
                checked={settings.compactMode}
                onCheckedChange={handleCompactModeChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              {t('Data Management') || 'Gestion des Données'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">{t('Load Demo Data') || 'Charger données démo'}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('Charger données démo') || 'Charger un jeu de données complet pour tester l\'application'}
                </p>
              </div>
              <Button variant="outline" onClick={loadDemoData}>
                <Download className="h-4 w-4 mr-2" />
                {t('loadDemo') || 'Charger démo'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">{t('Export Data') || 'Exporter les données'}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('Exporter les données') || 'Télécharger une sauvegarde de toutes vos données'}
                </p>
              </div>
              <Button variant="outline" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                {t('export') || 'Exporter'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">{t('importData') || 'Importer les données'}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('importData') || 'Restaurer vos données depuis un fichier de sauvegarde'}
                </p>
              </div>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                  id="import-file"
                />
                <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  {t('import') || 'Importer'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reset Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">{t('Danger Zone') || 'Zone de Danger'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">{t('Reset To Default') || 'Effacer toutes les données'}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('Supprimer définitivement toutes les données') || 'Supprimer définitivement toutes les données de l\'application (CODE: 1270)'}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('Remettre à zéro') || 'Effacer données'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Effacer toutes les données</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action supprimera définitivement toutes les données de l'application.
                      Pour confirmer, veuillez saisir le code de confirmation : <strong>1270</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="my-4">
                    <Input
                      type="text"
                      placeholder="Saisissez 1270"
                      value={eraseCode}
                      onChange={(e) => setEraseCode(e.target.value)}
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setEraseCode("")}>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleEraseData}>
                      Effacer définitivement
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;