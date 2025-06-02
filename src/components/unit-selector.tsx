"use client";

import { useState } from "react";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function UnitSelector({
  value,
  onChange,
  units,
}: {
  value: string;
  onChange: (val: string) => void;
  units: string[];
}) {
  const [open, setOpen] = useState(false);
  const [predefinedUnits, setPredefinedUnits] = useState(units);
  const [customUnit, setCustomUnit] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {value || "Select or add unit"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0">
        <Command>
          <CommandInput placeholder="Search units..." />
          <CommandEmpty>No unit found.</CommandEmpty>
          <CommandGroup>
            {predefinedUnits.map((unit) => (
              <CommandItem
                key={unit}
                onSelect={() => {
                  onChange(unit);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === unit ? "opacity-100" : "opacity-0"
                  )}
                />
                {unit}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
        <div className="border-t p-2">
          <div className="flex items-center gap-2">
            <Input
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value)}
              placeholder="Add a new unit"
            />
            <Button
              onClick={() => {
                if (customUnit.trim() !== "") {
                  onChange(customUnit.trim());
                  setCustomUnit("");
                  setPredefinedUnits((prev) => [...prev, customUnit.trim()]);
                  setOpen(false);
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
