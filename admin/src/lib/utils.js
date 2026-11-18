import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num) {
  if (num === null || num === undefined) return "0";
  return new Intl.NumberFormat("vi-VN").format(num);
}

export function formatDate(dateString) {
  if (!dateString) return "---";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function exportToCSV(data, filename = "export.csv", headers = null) {
  if (!data || !data.length) {
    return;
  }
  let headerRow = "";
  let keys = [];

  if (headers && headers.length) {
    headerRow = headers.map((h) => `"${(h.label || h.key).replace(/"/g, '""')}"`).join(",");
    keys = headers.map((h) => h.key);
  } else {
    keys = Object.keys(data[0]);
    headerRow = keys.map((k) => `"${k.replace(/"/g, '""')}"`).join(",");
  }

  const rows = data.map((item) => {
    return keys
      .map((key) => {
        let val = item[key];
        if (val === null || val === undefined) val = "";
        else if (typeof val === "object") val = JSON.stringify(val);
        else val = String(val);
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(",");
  });

  const csvContent = "\uFEFF" + [headerRow, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


