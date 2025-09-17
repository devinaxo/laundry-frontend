import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { Client } from '@/types/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ClientMapModalProps {
    client: Client | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ClientMapModal({ client, isOpen, onClose }: ClientMapModalProps) {
    const [mapKey, setMapKey] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setMapKey(prev => prev + 1);
        }
    }, [isOpen]);

    if (!client) return null;

    const latitude = parseFloat(client.latitude);
    const longitude = parseFloat(client.longitude);
    const position: [number, number] = [latitude, longitude];

    const copyCoordinates = () => {
        const coordinates = `${latitude}, ${longitude}`;
        navigator.clipboard.writeText(coordinates);
        toast.success('Coordenadas copiadas al portapapeles');
    };

    const openInGoogleMaps = () => {
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        window.open(url, '_blank');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Ubicación de {client.forename} {client.surname}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="flex flex-col space-y-4 flex-1 min-h-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-muted-foreground">Dirección:</span>
                            <p className="text-foreground">{client.address}</p>
                        </div>
                        <div>
                            <span className="font-medium text-muted-foreground">Coordenadas:</span>
                            <p className="text-foreground font-mono">
                                {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg overflow-hidden border border-border" style={{ height: '400px' }}>
                        <MapContainer
                            key={mapKey}
                            center={position}
                            zoom={16}
                            style={{ height: '100%', width: '100%' }}
                            className="z-0"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={position}>
                                <Popup>
                                    <div className="text-center">
                                        <p className="font-medium">{client.forename} {client.surname}</p>
                                        <p className="text-sm text-muted-foreground">{client.address}</p>
                                        <p className="text-xs font-mono mt-1">
                                            {latitude.toFixed(6)}, {longitude.toFixed(6)}
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={copyCoordinates}
                                className="flex items-center gap-2"
                            >
                                <Copy className="h-4 w-4" />
                                Copiar Coordenadas
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={openInGoogleMaps}
                                className="flex items-center gap-2"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Abrir en Google Maps
                            </Button>
                        </div>
                        <Button onClick={onClose}>
                            Cerrar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}