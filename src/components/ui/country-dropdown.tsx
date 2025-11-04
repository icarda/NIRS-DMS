"use client";

import React, { forwardRef, useCallback, useEffect, useState } from "react";

import { countries } from "country-data-list";
import { hasFlag } from "country-flag-icons";
import * as FLAGS from "country-flag-icons/react/3x2";
import { CheckIcon, ChevronDown, Globe } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface Country {
  alpha2: string;
  alpha3: string;
  countryCallingCodes: string[];
  currencies: string[];
  emoji?: string;
  ioc: string;
  languages: string[];
  name: string;
  status: string;
}

interface CountryDropdownProps {
  options?: Country[];
  onChange?: (country: Country) => void;
  defaultValue?: string;
  disabled?: boolean;
  placeholder?: string;
  slim?: boolean;
}

const CountryDropdownComponent = (
  {
    options = countries.all.filter(
      (country: Country) =>
        country.emoji &&
        country.status !== "deleted" &&
        country.ioc !== "PRK" &&
        country.alpha2 !== "EH" // Exclude Western Sahara
    ),
    onChange,
    defaultValue,
    disabled = false,
    placeholder = "Select a country",
    slim = false,
    ...props
  }: CountryDropdownProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) => {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
    undefined
  );

  useEffect(() => {
    if (defaultValue) {
      const initialCountry = options.find(
        (country) => country.name === defaultValue
      );
      if (initialCountry) {
        setSelectedCountry(initialCountry);
      } else {
        setSelectedCountry(undefined);
      }
    } else {
      // Reset selected country if defaultValue is undefined or null
      setSelectedCountry(undefined);
    }
  }, [defaultValue, options]);

  const handleSelect = useCallback(
    (country: Country) => {
      setSelectedCountry(country);
      onChange?.(country);
      setOpen(false);
    },
    [onChange]
  );

  const triggerClasses = cn(
    "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
    slim === true && "w-20"
  );

  const SelectedCountryFlag =
    FLAGS[(selectedCountry?.alpha2 as keyof typeof FLAGS) || "MA"];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        ref={ref}
        className={triggerClasses}
        disabled={disabled}
        {...props}
      >
        {selectedCountry ? (
          <div className="flex w-0 grow items-center gap-2 overflow-hidden">
            <div className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-md">
              <SelectedCountryFlag className="h-5 w-5" />
            </div>
            {slim === false && (
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                {selectedCountry.name}
              </span>
            )}
          </div>
        ) : (
          <span>
            {slim === false ? (
              placeholder || setSelectedCountry.name
            ) : (
              <Globe size={20} />
            )}
          </span>
        )}
        <ChevronDown size={16} />
      </PopoverTrigger>
      <PopoverContent
        collisionPadding={10}
        side="bottom"
        className="min-w-(--radix-popper-anchor-width) p-0"
      >
        <Command className="max-h-[200px] w-full sm:max-h-[270px]">
          <CommandList>
            <div className="sticky top-0 z-10 bg-popover">
              <CommandInput placeholder="Search country..." />
            </div>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {options
                .filter((x) => x.name)
                .map((option, key: number) => {
                  const Flag = hasFlag(option.alpha2)
                    ? FLAGS[option.alpha2 as keyof typeof FLAGS]
                    : FLAGS["MA"]; // Default to Morocco flag if not found

                  return (
                    <CommandItem
                      className="flex w-full items-center gap-2"
                      key={key}
                      onSelect={() => handleSelect(option)}
                    >
                      <div className="flex w-0 grow space-x-2 overflow-hidden">
                        <div className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-md">
                          <Flag className="h-5 w-5" />
                        </div>
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                          {option.name}
                        </span>
                      </div>
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4 shrink-0",
                          option.name === selectedCountry?.name
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

CountryDropdownComponent.displayName = "CountryDropdownComponent";

export const CountryDropdown = forwardRef(CountryDropdownComponent);
