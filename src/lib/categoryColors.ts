export function normalizeCategoryKey(value?: string): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function categoryColorHex(name?: string, slug?: string): string {
  const key = normalizeCategoryKey(slug || name);
  switch (key) {
    case "brasil":
      return "#2563eb"; // blue-600
    case "marilia":
      return "#dc2626"; // red-600
    case "mundo":
      return "#0ea5e9"; // sky-500
    case "regiao":
      return "#ea580c"; // orange-600
    case "saude":
      return "#16a34a"; // green-600
    case "cultura":
      return "#8b5cf6"; // violet-500
    case "esportes":
      return "#f59e0b"; // amber-500
    case "cidade":
      return "#2563eb"; // blue-600
    case "educacao":
      return "#e11d48"; // rose-600
    default:
      return "#9ca3af"; // slate-400
  }
}

