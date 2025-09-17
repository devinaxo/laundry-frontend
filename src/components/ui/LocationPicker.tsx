import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
    latitude: number;
    longitude: number;
    onLocationChange: (latitude: number, longitude: number) => void;
    className?: string;
}

function LocationMarker({
    position,
    onLocationChange
}: {
    position: [number, number];
    onLocationChange: (lat: number, lng: number) => void;
}) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            onLocationChange(lat, lng);
        },
    });

    return <Marker position={position} />;
}

export default function LocationPicker({
    latitude,
    longitude,
    onLocationChange,
    className = ''
}: LocationPickerProps) {
    const [mapKey, setMapKey] = useState(0);
    const mapRef = useRef<L.Map | null>(null);

    const position: [number, number] = [latitude, longitude];

    useEffect(() => {
        setMapKey(prev => prev + 1);
    }, []);

    const handleLocationChange = (lat: number, lng: number) => {
        onLocationChange(lat, lng);
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocalización no disponible en este navegador');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude: lat, longitude: lng } = position.coords;
                onLocationChange(lat, lng);

                if (mapRef.current) {
                    mapRef.current.flyTo([lat, lng], 16);
                }

                toast.success('Ubicación actual obtenida');
            },
            (error) => {
                console.error('Error getting location:', error);
                toast.error('No se pudo obtener la ubicación actual');
            }
        );
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex gap-x-3 items-center">
                <Label>Ubicación del Cliente <span className="text-red-500">*</span></Label>
                <div className="flex justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={getCurrentLocation}
                        className="px-3 h-6 w-6"
                        title="Usar mi ubicación actual"
                    >
                        <Navigation className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="rounded-lg border border-border overflow-hidden" style={{ height: '300px' }}>
                <MapContainer
                    key={mapKey}
                    center={position}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                    ref={mapRef}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                        position={position}
                        onLocationChange={handleLocationChange}
                    />
                </MapContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Latitud</Label>
                    <div className="p-2 bg-muted rounded font-mono text-foreground text-sm">
                        {latitude.toFixed(6)}
                    </div>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Longitud</Label>
                    <div className="p-2 bg-muted rounded font-mono text-foreground text-sm">
                        {longitude.toFixed(6)}
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                    Haz clic en el mapa para seleccionar la ubicación exacta, o usa tu ubicación actual.
                </p>
            </div>
        </div>
    );
}