import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutGrid, 
  Sun, 
  Moon,
  Monitor,
  Minimize2
} from "lucide-react";
import { useTheme } from "next-themes";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { NotificationCenter } from "@/components/NotificationCenter";

interface TopBarProps {
  onCompactModeToggle: () => void;
  isCompactMode: boolean;
}

export const TopBar = ({ 
  onCompactModeToggle, 
  isCompactMode
}: TopBarProps) => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast({
      title: t('settings.theme'),
      description: `${t('settings.theme')} ${newTheme === 'dark' ? t('settings.dark') : newTheme === 'light' ? t('settings.light') : t('settings.system')} ${t('settings.activated')}`,
      duration: 2000,
    });
  };

  const handleCompactModeToggle = () => {
    onCompactModeToggle();
    // Naviguer vers le mode compact
    window.location.href = '/compact';
    toast({
      title: t('settings.compactMode') || 'Mode Compact',
      description: t('settings.compactModeDesc') || 'Interface optimisée mobile activée',
      duration: 2000,
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Compact Mode Toggle */}
      <Button
        variant={isCompactMode ? "default" : "outline"}
        size="sm"
        onClick={handleCompactModeToggle}
        className="relative gap-2"
      >
        <Minimize2 className="h-4 w-4" />
        {t('compactMode') || 'Mode Compact'}
        {isCompactMode && (
          <Badge 
            variant="secondary" 
            className="absolute -top-1 -right-1 h-2 w-2 p-0 rounded-full bg-primary"
          />
        )}
      </Button>

      {/* Theme Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {theme === 'dark' ? (
              <Moon className="h-4 w-4" />
            ) : theme === 'light' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Monitor className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleThemeChange('light')}>
            <Sun className="mr-2 h-4 w-4" />
            {t('settings.light')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
            <Moon className="mr-2 h-4 w-4" />
            {t('settings.dark')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange('system')}>
            <Monitor className="mr-2 h-4 w-4" />
            {t('settings.system')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Enhanced Notification Center */}
      <NotificationCenter />
    </div>
  );
};