import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getLocalStorage = (key: string): any => {
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return null;
    
    // Проверка, действительно ли значение является корректным JSON
    const value = JSON.parse(item);
    return value;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    // В случае ошибки удаляем повреждённые данные
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.error(`Could not remove corrupted item ${key} from localStorage:`, e);
    }
    return null;
  }
};

const setLocalStorage = (key: string, value: any): void => {
  try {
    // Проверка значения перед сохранением
    if (value === undefined) {
      console.warn(`Attempted to store undefined value for ${key}. Using null instead.`);
      value = null;
    }
    
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
  }
};

export { getLocalStorage, setLocalStorage };
