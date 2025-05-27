"use client";

import { RefObject, useEffect, useRef, useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useDebounce } from "@/hooks/use-debounce";
import { autocompleteCities, getPlaceCoordinates } from "@/lib/google-maps";

interface LocationCommandProps {
  countryCode?: string;
  onSelect: (value: {
    description: string;
    placeId: string;
    lat: number;
    lng: number;
  }) => void;
  disabled?: boolean;
  value: string;
  onChange: (val: string) => void;
}

export function LocationCommand({
  countryCode,
  onSelect,
  disabled,
  value,
  onChange,
}: LocationCommandProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<
    { description: string; place_id: string }[]
  >([]);
  const [open, setOpen] = useState(false);
  const debouncedInput = useDebounce(value, 300);
  const justSelectedRef = useRef(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(wrapperRef as RefObject<HTMLDivElement>, () =>
    setOpen(false)
  );

  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (debouncedInput.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const fetch = async () => {
      const res = await autocompleteCities(debouncedInput, countryCode);
      setResults(res);
      setOpen(true);
    };

    fetch();
  }, [debouncedInput, countryCode]);

  const handleSelect = async (description: string, placeId: string) => {
    const coords = await getPlaceCoordinates(placeId);
    if (!coords) return;
    justSelectedRef.current = true;

    setSelected(description);
    onChange(description);
    setOpen(false);
    onSelect({ description, placeId, lat: coords.lat, lng: coords.lng });
  };

  return (
    <div className="relative w-full">
      <Command
        ref={wrapperRef}
        className="w-full rounded-md border bg-white shadow-sm"
      >
        <CommandInput
          value={value}
          onValueChange={(val) => {
            onChange(val);
            setOpen(true);
          }}
          disabled={disabled}
          placeholder="Search for a city..."
          className="px-3 py-2 text-sm"
        />
        {open && !disabled && (
          <CommandList className="absolute top-11 z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
            {results.length === 0 && <CommandEmpty>No results.</CommandEmpty>}
            {results.map((result) => (
              <CommandItem
                key={result.place_id}
                value={result.description}
                onSelect={() =>
                  handleSelect(result.description, result.place_id)
                }
                className="cursor-pointer px-3 py-2 hover:bg-muted"
              >
                {result.description}
              </CommandItem>
            ))}
          </CommandList>
        )}
      </Command>
    </div>
  );
}
