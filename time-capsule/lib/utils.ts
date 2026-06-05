import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(error: any, defaultMessage: string = "An error occurred"): string {
  if (!error) return defaultMessage;
  
  const message = error.message || String(error);
  const errString = message.toLowerCase();
  
  if (
    error.code === 4001 || 
    error.code === 'ACTION_REJECTED' ||
    errString.includes("user rejected") ||
    errString.includes("user denied") ||
    errString.includes("transaction rejected") ||
    errString.includes("rejected the request") ||
    errString.includes("rejectallapprovals")
  ) {
    return "Transaction rejected by user";
  }

  // Nested error messages
  if (error.error?.message) {
    return getErrorMessage(error.error, defaultMessage);
  }
  
  return error.message || defaultMessage;
}
