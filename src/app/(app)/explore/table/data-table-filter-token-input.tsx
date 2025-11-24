"use client";
"use client";

import { useState } from "react";

import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DataTableTokenInputFilterField } from "./types";

type DataTableFilterTokenInputProps<TData> =
  DataTableTokenInputFilterField<TData> & {
    table: Table<TData>;
  };

function parseTokens(rawValue: string): string[] {
  return rawValue
    .split(/[\n\r,\t]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function mergeTokens(existing: string[], incoming: string[]) {
  const seen = new Set(existing.map((token) => token.toLowerCase()));
  const nextTokens = [...existing];

  incoming.forEach((token) => {
    const normalized = token.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      nextTokens.push(token);
    }
  });

  return nextTokens;
}

export function DataTableFilterTokenInput<TData>({
  table,
  value: _value,
  placeholder,
  description,
}: DataTableFilterTokenInputProps<TData>) {
  const value = _value as string;
  const column = table.getAllLeafColumns().find((col) => col.id === value);
  const filterValue = column?.getFilterValue();
  const tokens = Array.isArray(filterValue) ? (filterValue as string[]) : [];
  const [inputValue, setInputValue] = useState("");

  const applyTokens = (nextTokens: string[]) => {
    column?.setFilterValue(nextTokens.length ? nextTokens : undefined);
  };

  const handleAddTokens = (raw?: string) => {
    const tokensToAdd = parseTokens(raw ?? inputValue);
    if (tokensToAdd.length === 0) return;
    const merged = mergeTokens(tokens, tokensToAdd);
    applyTokens(merged);
    setInputValue("");
  };

  const handleRemoveToken = (token: string) => {
    const nextTokens = tokens.filter((item) => item !== token);
    applyTokens(nextTokens);
  };

  return (
    <div className="grid gap-3">
      <Label htmlFor={value} className="text-muted-foreground sr-only px-2">
        {value}
      </Label>
      <Textarea
        id={value}
        value={inputValue}
        placeholder={
          placeholder ?? "Paste IDs separated by commas or new lines"
        }
        className="min-h-[60px] placeholder:text-xs"
        onChange={(e) => setInputValue(e.target.value)}
        onPaste={(e) => {
          const clipboardValue = e.clipboardData?.getData("text");
          if (!clipboardValue) return;
          setTimeout(() => {
            const parsed = parseTokens(clipboardValue);
            if (parsed.length) {
              const merged = mergeTokens(tokens, parsed);
              applyTokens(merged);
              setInputValue("");
            }
          }, 0);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleAddTokens();
          }
        }}
      />
      <div className="text-muted-foreground flex items-center justify-end gap-2 text-xs">
        <Button
          size="sm"
          className="text-xs"
          type="button"
          onClick={() => handleAddTokens()}
        >
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tokens.length !== 0 &&
          tokens.map((token, index) => (
            <div
              key={`${token}-${index}`}
              className="bg-muted flex w-fit items-center justify-between rounded-md px-2 py-1 text-sm"
            >
              <span className="font-mono">{token}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleRemoveToken(token)}
              >
                <X className="text-muted-foreground h-3 w-3" />
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}
