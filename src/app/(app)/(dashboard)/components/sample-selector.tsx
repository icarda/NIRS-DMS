import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function SampleSelector({
  options,
  active,
  onChange,
}: {
  options: string[];
  active: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={options.length === 0}>
          Select Samples
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {options.map((key) => {
                const checked = active.includes(key);
                return (
                  <CommandItem
                    key={key}
                    onSelect={() => {
                      if (checked) {
                        onChange(active.filter((k) => k !== key));
                      } else {
                        onChange([...active, key]);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="mr-2"
                    />
                    {key.replace("sample_", "Sample ")}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
