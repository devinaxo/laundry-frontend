import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const formatDateOnly = (dateString: string) => {
	return new Date(dateString).toLocaleDateString('es-ES', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
};

export const formatDateTime = (dateString: string) => {
	return new Date(dateString).toLocaleDateString('es-ES', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};
