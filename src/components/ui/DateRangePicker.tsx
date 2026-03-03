import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface DateRangePickerProps {
    date?: DateRange;
    onDateChange?: (date: DateRange | undefined) => void;
    className?: string;
    noDefaultDate?: boolean;
}

type PresetRange = "today" | "yesterday" | "last7days" | "last30days" | "thisMonth" | "lastMonth" | "thisYear" | "custom";

const getPresetRange = (preset: PresetRange): DateRange | undefined => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (preset) {
        case "today":
            return { from: today, to: today };

        case "yesterday": {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return { from: yesterday, to: yesterday };
        }

        case "last7days": {
            const last7 = new Date(today);
            last7.setDate(last7.getDate() - 6);
            return { from: last7, to: today };
        }

        case "last30days": {
            const last30 = new Date(today);
            last30.setDate(last30.getDate() - 29);
            return { from: last30, to: today };
        }

        case "thisMonth": {
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            return { from: firstDay, to: today };
        }

        case "lastMonth": {
            const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            return { from: firstDayLastMonth, to: lastDayLastMonth };
        }

        case "thisYear": {
            const firstDayYear = new Date(today.getFullYear(), 0, 1);
            return { from: firstDayYear, to: today };
        }

        default:
            return undefined;
    }
};


export function DateRangePicker({
    date,
    onDateChange,
    className,
    noDefaultDate = false,
}: DateRangePickerProps) {
    const [selectedPreset, setSelectedPreset] = React.useState<PresetRange>(noDefaultDate ? "custom" : "thisMonth");
    const [initialized, setInitialized] = React.useState(false);

    React.useEffect(() => {
        if (!noDefaultDate && !initialized && !date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            onDateChange?.({ from: firstDay, to: today });
            setInitialized(true);
        }
    }, [noDefaultDate, initialized, date, onDateChange]);

    const handlePresetChange = (preset: PresetRange) => {
        setSelectedPreset(preset);
        const range = getPresetRange(preset);
        onDateChange?.(range);
    };

    const handleDateSelect = (range: DateRange | undefined) => {
        onDateChange?.(range);
        if (range?.from && range?.to) {
            setSelectedPreset("custom");
        }
    };

    const formatDateRange = () => {
        if (!date?.from) {
            return "Seleccionar período";
        }

        if (!date.to) {
            return format(date.from, "PP", { locale: es });
        }

        if (date.from.getTime() === date.to.getTime()) {
            return format(date.from, "PP", { locale: es });
        }

        return `${format(date.from, "PP", { locale: es })} - ${format(date.to, "PP", { locale: es })}`;
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* Preset Selector */}
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="yesterday">Ayer</SelectItem>
                    <SelectItem value="last7days">Últimos 7 días</SelectItem>
                    <SelectItem value="last30days">Últimos 30 días</SelectItem>
                    <SelectItem value="thisMonth">Este mes</SelectItem>
                    <SelectItem value="lastMonth">Mes pasado</SelectItem>
                    <SelectItem value="thisYear">Este año</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
            </Select>

            {/* Calendar Popover */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "justify-start text-left font-normal min-w-[280px]",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formatDateRange()}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={handleDateSelect}
                        numberOfMonths={2}
                        disabled={(date) => date > new Date()}
                        locale={es}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
