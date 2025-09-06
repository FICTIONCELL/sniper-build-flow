import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, QrCode, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QrScanner from "qr-scanner";
import { useReserves, useProjects, useBlocks, useApartments, useCategories } from "@/hooks/useLocalStorage";

interface SearchSuggestion {
  id: string;
  type: 'project' | 'block' | 'apartment' | 'category' | 'reserve';
  title: string;
  subtitle?: string;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
}

export const SearchBar = ({ onSearch, onSuggestionSelect }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  const [reserves] = useReserves();
  const [projects] = useProjects();
  const [blocks] = useBlocks();
  const [apartments] = useApartments();
  const [categories] = useCategories();

  const generateSuggestions = (searchQuery: string): SearchSuggestion[] => {
    if (!searchQuery.trim()) return [];
    
    const lowercaseQuery = searchQuery.toLowerCase();
    const suggestions: SearchSuggestion[] = [];

    // Search in projects
    projects
      .filter(p => p.name.toLowerCase().includes(lowercaseQuery))
      .forEach(p => {
        suggestions.push({
          id: p.id,
          type: 'project',
          title: p.name,
          subtitle: 'Projet'
        });
      });

    // Search in blocks
    blocks
      .filter(b => b.name.toLowerCase().includes(lowercaseQuery))
      .forEach(b => {
        const project = projects.find(p => p.id === b.projectId);
        suggestions.push({
          id: b.id,
          type: 'block',
          title: b.name,
          subtitle: `Bloc - ${project?.name || 'Projet inconnu'}`
        });
      });

    // Search in apartments
    apartments
      .filter(a => a.number.toLowerCase().includes(lowercaseQuery))
      .forEach(a => {
        const block = blocks.find(b => b.id === a.blockId);
        const project = projects.find(p => p.id === block?.projectId);
        suggestions.push({
          id: a.id,
          type: 'apartment',
          title: `Appt ${a.number}`,
          subtitle: `${project?.name || 'Projet'} / ${block?.name || 'Bloc'}`
        });
      });

    // Search in categories
    categories
      .filter(c => c.name.toLowerCase().includes(lowercaseQuery))
      .forEach(c => {
        suggestions.push({
          id: c.id,
          type: 'category',
          title: c.name,
          subtitle: 'Catégorie'
        });
      });

    // Search in reserves
    reserves
      .filter(r => 
        r.title.toLowerCase().includes(lowercaseQuery) ||
        r.description.toLowerCase().includes(lowercaseQuery)
      )
      .forEach(r => {
        const project = projects.find(p => p.id === r.projectId);
        suggestions.push({
          id: r.id,
          type: 'reserve',
          title: r.title,
          subtitle: `Réserve - ${project?.name || 'Projet inconnu'}`
        });
      });

    return suggestions.slice(0, 8); // Limit to 8 suggestions
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    const newSuggestions = generateSuggestions(value);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    setShowSuggestions(false);
    onSuggestionSelect?.(suggestion);
    onSearch(suggestion.title);
  };

  const handleSearch = () => {
    onSearch(query);
    setShowSuggestions(false);
  };

  const startQrScanner = async () => {
    if (!videoRef.current) {
      console.error('Video element not found');
      return;
    }

    try {
      // Check if camera permission is available
      if (!navigator.mediaDevices?.getUserMedia) {
        console.error('Camera not supported by this browser');
        alert('Votre navigateur ne supporte pas l\'accès à la caméra');
        setIsQrScannerOpen(false);
        return;
      }

      console.log('Starting QR scanner...');
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result.data);
          setQuery(result.data);
          onSearch(result.data);
          stopQrScanner();
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera on mobile
        }
      );

      await qrScannerRef.current.start();
      console.log('QR scanner started successfully');
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      
      // Handle specific error cases
      if (error.name === 'NotAllowedError') {
        alert('Accès à la caméra refusé. Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur.');
      } else if (error.name === 'NotFoundError') {
        alert('Aucune caméra trouvée sur cet appareil.');
      } else if (error.name === 'NotSupportedError') {
        alert('Le scanner QR n\'est pas supporté sur ce navigateur.');
      } else {
        alert('Erreur lors du démarrage du scanner QR: ' + error.message);
      }
      
      setIsQrScannerOpen(false);
    }
  };

  const stopQrScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsQrScannerOpen(false);
  };

  useEffect(() => {
    if (isQrScannerOpen) {
      startQrScanner();
    }
    return () => {
      stopQrScanner();
    };
  }, [isQrScannerOpen]);

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative flex">
        <Input
          placeholder="Rechercher projets, blocs, appartements..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="pr-20"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsQrScannerOpen(true)}
            className="h-8 w-8 p-0"
          >
            <QrCode className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSearch}
            className="h-8 w-8 p-0"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 z-50 bg-popover border rounded-md shadow-lg mt-1">
          {suggestions.map((suggestion) => (
            <button
              key={`${suggestion.type}-${suggestion.id}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm border-b last:border-b-0"
            >
              <div className="font-medium">{suggestion.title}</div>
              {suggestion.subtitle && (
                <div className="text-xs text-muted-foreground">{suggestion.subtitle}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* QR Scanner Dialog */}
      <Dialog open={isQrScannerOpen} onOpenChange={setIsQrScannerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Scanner un code QR
              <Button
                variant="ghost"
                size="sm"
                onClick={stopQrScanner}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-square bg-black rounded-lg overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Pointez votre caméra vers un code QR
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
};