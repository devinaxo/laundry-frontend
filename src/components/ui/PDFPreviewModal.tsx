import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePDF } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import { Download, AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/shadcn-io/spinner';

interface PDFPreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    document: React.ReactElement<DocumentProps>;
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
    const [instance] = usePDF({ document });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
                <DialogHeader className="pr-10">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <DialogTitle>{title}</DialogTitle>
                            {description && <DialogDescription>{description}</DialogDescription>}
                        </div>
                        <Button
                            variant="default"
                            size="sm"
                            disabled={instance.loading || !!instance.error}
                            className="gap-2 shrink-0"
                            asChild={!instance.loading && !instance.error}
                        >
                            {instance.loading ? (
                                <span>
                                    <Spinner variant="ellipsis" className="h-4 w-4" />
                                    Generando...
                                </span>
                            ) : (
                                <a href={instance.url!} download={fileName}>
                                    <Download className="h-4 w-4" />
                                    Descargar PDF
                                </a>
                            )}
                        </Button>
                    </div>
                </DialogHeader>
                <div className="flex-1 relative border rounded-lg overflow-hidden bg-muted/50">
                    {instance.loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                            <div className="flex flex-col items-center gap-2">
                                <Spinner variant="ellipsis" className="h-8 w-8 text-primary" />
                                <p className="text-sm text-muted-foreground">Generando documento...</p>
                            </div>
                        </div>
                    )}
                    {instance.error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                            <div className="flex flex-col items-center gap-2 text-destructive">
                                <AlertCircle className="h-8 w-8" />
                                <p className="text-sm">Error al generar el PDF: {instance.error}</p>
                            </div>
                        </div>
                    )}
                    {instance.url && (
                        <iframe
                            src={instance.url}
                            className="w-full h-full border-0"
                            title="Vista previa del PDF"
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
