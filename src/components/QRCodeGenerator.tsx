import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Printer, Copy, QrCode, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { downloadPVPDF, printPVPDF } from "@/utils/pdfGenerator";
import { useTranslation } from "@/contexts/TranslationContext";

interface QRCodeData {
  pvNumber: string;
  date: string;
  id: string;
  type?: 'pv' | 'reserve' | 'project';
  title?: string;
  projectName?: string;
  description?: string;
}

interface QRCodeGeneratorProps {
  data: QRCodeData;
  size?: number;
  className?: string;
  projectName?: string;
  description?: string;
}

export const QRCodeGenerator = ({ data, size = 200, className = "", projectName, description }: QRCodeGeneratorProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const { toast } = useToast();
  const { t, language } = useTranslation();

  const generateQRData = () => {
    // Create a JSON string with all the data
    const qrData = {
      pvNumber: data.pvNumber,
      date: data.date,
      id: data.id,
      type: data.type || 'pv',
      title: data.title,
      timestamp: Date.now(),
    };
    
    return JSON.stringify(qrData);
  };

  const generateQRCode = async () => {
    try {
      const qrData = generateQRData();
      const url = await QRCode.toDataURL(qrData, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M',
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: t('error') || "Erreur",
        description: t('qrCodeGenerationError') || "Impossible de générer le code QR",
        variant: "destructive",
      });
    }
  };

  const downloadQR = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `QR_${data.pvNumber}_${data.date.replace(/\//g, '-')}.png`;
    link.href = qrCodeUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: t('qrCodeDownloaded') || "QR Code téléchargé",
      description: t('qrCodeSaved') || "Le code QR a été sauvegardé",
    });
  };

  const downloadPV = () => {
    const pvData = {
      pvNumber: data.pvNumber,
      date: data.date,
      title: data.title || t('untitled') || 'Sans titre',
      projectName: projectName || data.projectName || t('unknownProject') || 'Projet inconnu',
      description: description || data.description || '',
      qrCodeDataUrl: qrCodeUrl,
    };

    try {
      downloadPVPDF(pvData, language);
      toast({
        title: t('pvGenerated') || "PV généré",
        description: t('pvDownloaded') || "Le PV a été téléchargé en PDF",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: t('error') || "Erreur",
        description: t('pdfGenerationError') || "Impossible de générer le PDF",
        variant: "destructive",
      });
    }
  };

  const printPV = () => {
    const pvData = {
      pvNumber: data.pvNumber,
      date: data.date,
      title: data.title || t('untitled') || 'Sans titre',
      projectName: projectName || data.projectName || t('unknownProject') || 'Projet inconnu',
      description: description || data.description || '',
      qrCodeDataUrl: qrCodeUrl,
    };

    try {
      printPVPDF(pvData, language);
      toast({
        title: t('printLaunched') || "Impression lancée",
        description: t('pvSentToPrinter') || "Le PV a été envoyé vers l'imprimante",
      });
    } catch (error) {
      console.error('Error printing PDF:', error);
      toast({
        title: t('error') || "Erreur",
        description: t('printError') || "Impossible d'imprimer le PV",
        variant: "destructive",
      });
    }
  };

  const printQR = () => {
    if (!qrCodeUrl) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${t('qrCode')} - ${data.pvNumber}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px; 
                direction: ${language === 'ar' ? 'rtl' : 'ltr'};
              }
              .qr-container { 
                margin: 20px auto; 
                display: inline-block; 
              }
              .info { 
                margin: 10px 0; 
                font-size: 14px; 
              }
            </style>
          </head>
          <body>
            <h2>${t('qrCode')} - ${data.type?.toUpperCase() || 'PV'}</h2>
            <div class="qr-container">
              <img src="${qrCodeUrl}" alt="QR Code" />
            </div>
            <div class="info">
              <p><strong>${t('pvNumber')}:</strong> ${data.pvNumber}</p>
              <p><strong>${t('date')}:</strong> ${data.date}</p>
              <p><strong>ID:</strong> ${data.id}</p>
              ${data.title ? `<p><strong>${t('title')}:</strong> ${data.title}</p>` : ''}
              <p><strong>${t('generatedOn')}:</strong> ${new Date().toLocaleString(language === 'ar' ? 'ar-SA' : language)}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const copyQRData = async () => {
    const qrData = generateQRData();
    try {
      await navigator.clipboard.writeText(qrData);
      toast({
        title: t('dataCopied') || "Données copiées",
        description: t('qrDataCopied') || "Les données du code QR ont été copiées dans le presse-papiers",
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: t('error') || "Erreur",
        description: t('copyError') || "Impossible de copier les données",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [data, size]);

  if (!qrCodeUrl) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">{t('generatingQrCode') || 'Génération du code QR...'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          {t('qrCode')} - {data.pvNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <img 
            src={qrCodeUrl} 
            alt="QR Code" 
            className="mx-auto border rounded-lg shadow-sm"
          />
        </div>
        
        <div className="text-sm text-muted-foreground space-y-1">
          <p><span className="font-medium">{t('date')}:</span> {data.date}</p>
          <p><span className="font-medium">ID:</span> {data.id}</p>
          {data.title && <p><span className="font-medium">{t('title')}:</span> {data.title}</p>}
          {projectName && <p><span className="font-medium">{t('project')}:</span> {projectName}</p>}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={downloadPV} className="bg-primary/10 hover:bg-primary/20">
            <FileText className="mr-2 h-4 w-4" />
            {t('downloadPdf')}
          </Button>
          <Button variant="outline" size="sm" onClick={printPV}>
            <Printer className="mr-2 h-4 w-4" />
            {t('print')} PDF
          </Button>
          <Button variant="outline" size="sm" onClick={downloadQR}>
            <Download className="mr-2 h-4 w-4" />
            {t('download')} QR
          </Button>
          <Button variant="outline" size="sm" onClick={copyQRData}>
            <Copy className="mr-2 h-4 w-4" />
            {t('copy') || 'Copier'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};