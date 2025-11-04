"use client";

import * as React from "react";

import { Command as CommandPrimitive } from "cmdk";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Selectable = Record<"value" | "label", string>;

interface MultiSelectProps {
  data: Selectable[];
  value: string[];
  onChange(value: string[]): void;
  placeholder?: string;
}

export function MultiSelect({
  data,
  value,
  onChange,
  placeholder,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const selected = React.useMemo(
    () => data.filter((item) => value.includes(item.value)),
    [data, value]
  );

  const handleUnselect = React.useCallback(
    (selectable: Selectable) => {
      onChange(value.filter((v) => v !== selectable.value));
    },
    [onChange, value]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "") {
            onChange(value.slice(0, -1));
          }
        }
        if (e.key === "Escape") {
          input.blur();
        }
      }
    },
    [onChange, value]
  );

  const selectables = data.filter(
    (selectable) => !value.includes(selectable.value)
  );

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible bg-transparent"
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-x-1 gap-y-2 overflow-hidden">
          {selected.map((selectable) => {
            return (
              <Badge key={selectable.value} variant="default">
                {selectable.label}
                <button
                  className="ml-1 rounded-full outline-hidden ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(selectable);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(selectable)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder || "Select traits..."}
            className="flex-1 bg-transparent outline-hidden placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className={cn("relative", open && "mt-2")}>
        <CommandList>
          {open && selectables.length > 0 ? (
            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-hidden animate-in">
              <ScrollArea>
                <CommandGroup className="h-full overflow-auto">
                  {selectables.map((selectable) => {
                    return (
                      <CommandItem
                        key={selectable.value}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onSelect={() => {
                          setInputValue("");
                          onChange([...value, selectable.value]);
                        }}
                        className={"cursor-pointer"}
                      >
                        {selectable.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </ScrollArea>
            </div>
          ) : null}
        </CommandList>
      </div>
    </Command>
  );
}
