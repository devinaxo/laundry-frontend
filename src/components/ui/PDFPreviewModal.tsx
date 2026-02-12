import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { Download, Loader2 } from 'lucide-react';
import { Spinner } from '@/components/ui/shadcn-io/spinner';

interface PDFPreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    document: React.ReactElement;
    fileName: string;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
    open,
    onOpenChange,
    title,
    description,
    document,
    fileName
}) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (open) {
            setIsLoading(true);
            const timer = setTimeout(() => setIsLoading(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle>{title}</DialogTitle>
                            {description && <DialogDescription>{description}</DialogDescription>}
                        </div>
                        <PDFDownloadLink
                            document={document}
                            fileName={fileName}
                        >
                            {({ loading }) => (
                                <Button
                                    variant="default"
                                    size="sm"
                                    disabled={loading}
                                    className="gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Generando...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-4 w-4" />
                                            Descargar PDF
                                        </>
                                    )}
                                </Button>
                            )}
                        </PDFDownloadLink>
                    </div>
                </DialogHeader>
                <div className="flex-1 relative border rounded-lg overflow-hidden bg-muted/50">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                            <div className="flex flex-col items-center gap-2">
                                <Spinner variant="ellipsis" className="h-8 w-8 text-primary" />
                                <p className="text-sm text-muted-foreground">Cargando vista previa...</p>
                            </div>
                        </div>
                    )}
                    <PDFViewer
                        width="100%"
                        height="100%"
                        className="border-0"
                    >
                        {document}
                    </PDFViewer>
                </div>
            </DialogContent>
        </Dialog>
    );
};
