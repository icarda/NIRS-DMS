import { Table } from "@tanstack/react-table";
import Papa from "papaparse";
import * as XLSX from "xlsx";

export function exportToCSV(
  table: Table<any>,
  tab: "study" | "trial" | "wet-chemistry" = "wet-chemistry"
) {
  const columnIds = table.getVisibleLeafColumns().map((col) => col.id);
  const headers = table
    .getVisibleLeafColumns()
    .map((col) => col.columnDef.meta?.label ?? col.id);

  const rows = table.getFilteredRowModel().rows;

  const data = rows.map((row) => columnIds.map((id) => row.getValue(id)));

  const csv = Papa.unparse({ fields: headers, data });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${tab}_data.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToXLSX(
  table: Table<any>,
  tab: "study" | "trial" | "wet-chemistry" = "wet-chemistry"
) {
  const columnIds = table.getVisibleLeafColumns().map((col) => col.id);
  const headers = table
    .getVisibleLeafColumns()
    .map((col) => col.columnDef.meta?.label ?? col.id);

  const rows = table.getFilteredRowModel().rows;

  const data = rows.map((row) => {
    const rowValues: Record<string, any> = {};
    columnIds.forEach((id, i) => {
      const header = headers[i];
      rowValues[header] = row.getValue(id);
    });
    return rowValues;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  XLSX.writeFile(workbook, `${tab}_data.xlsx`);
}
