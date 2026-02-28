import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseISO, format } from "date-fns"
import { es } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const formatDateOnly = (dateString: string) => {
	const date = parseISO(dateString);
	return format(date, "d 'de' MMM yyyy", { locale: es });
};

export const formatDateTime = (dateString: string) => {
	const date = parseISO(dateString);
	return format(date, "d 'de' MMM yyyy, HH:mm", { locale: es });
};
