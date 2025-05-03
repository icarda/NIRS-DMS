"use client";

import { ChangeEvent, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileChange?: (files: FileList | null) => void;
  onPreviewChange?: (preview: string | null) => void;
  className?: string;
}

export function FileUpload({
  onFileChange,
  onPreviewChange,
  className,
  ...props
}: FileUploadProps) {
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const file = files?.[0];

    setFileName(file?.name || "");
    onFileChange?.(files);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onPreviewChange?.(result);
      };
      reader.readAsDataURL(file);
    } else {
      onPreviewChange?.(null);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Input type="file" onChange={handleFileChange} {...props} />
    </div>
  );
}
