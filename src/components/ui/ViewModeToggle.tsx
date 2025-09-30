import { Button } from '@/components/ui/button';
import { Grid3X3, List } from 'lucide-react';

interface ViewModeToggleProps {
    viewMode: 'table' | 'cards';
    onViewModeChange: (mode: 'table' | 'cards') => void;
}

export default function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
    return (
        <div className="relative flex items-center p-1 bg-muted rounded-lg">
            <div 
                className={`absolute top-1 bottom-1 bg-primary border border-border rounded-md transition-all duration-200 ease-in-out shadow-sm ${
                    viewMode === 'table' ? 'left-1 right-[50%]' : 'left-[50%] right-1'
                }`}
            />
            
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange('table')}
                className={`relative z-10 h-8 px-3 transition-colors duration-200 ${
                    viewMode === 'table' 
                        ? 'text-foreground hover:bg-transparent' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange('cards')}
                className={`relative z-10 h-8 px-3 transition-colors duration-200 ${
                    viewMode === 'cards' 
                        ? 'text-foreground hover:bg-transparent' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
            >
                <Grid3X3 className="h-4 w-4" />
            </Button>
        </div>
    );
}