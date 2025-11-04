"use client";

import { useId, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createApiClient } from "@/features/auth/actions/api-client";
import { apiClientSchema } from "@/features/auth/schemas/api-client";

export function ApiClientAddDialog() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenResult, setIsOpenResult] = useState(false);
  const [result, setResult] = useState<null | {
    id: number;
    clientId: string;
    clientSecret: string | null;
    name: string;
    clientType: "public" | "confidential";
    scopes: string;
    description: string | null;
    status: "active" | "inactive";
    createdAt: string;
  }>(null);

  const clientIdRef = useRef<HTMLInputElement | null>(null);
  const clientSecretRef = useRef<HTMLInputElement | null>(null);

  const id = useId();

  const form = useForm<z.infer<typeof apiClientSchema>>({
    resolver: zodResolver(apiClientSchema),
    defaultValues: {
      name: "",
      type: "public",
      scopes: "",
      description: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof apiClientSchema>) => {
    try {
      setIsLoading(true);
      const res = await createApiClient(data);

      if ("error" in res && res.error) {
        throw res;
      }

      form.reset({
        name: "",
        type: "public",
        scopes: "",
        description: "",
      });

      toast.success("API Client created successfully.");
      // @ts-ignore
      setResult(res);
      setIsOpenResult(true);
    } catch (e) {
      const error = e as { error: boolean; message: string };
      toast.error(
        error.message || "An error occurred while creating the API Client."
      );
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add new API Client</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Client name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. My API Client" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Client type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="gap-2"
                        >
                          <div className="has-data-[state=checked]:border-primary/50 shadow-2xs relative flex w-full items-start gap-2 rounded-md border border-input p-4 outline-hidden">
                            <RadioGroupItem
                              value="public"
                              id={`${id}-1`}
                              aria-describedby={`${id}-1-description`}
                              className="order-1 after:absolute after:inset-0"
                            />
                            <div className="grid grow gap-2">
                              <Label htmlFor={`${id}-1`}>Public client</Label>
                              <p
                                id={`${id}-1-description`}
                                className="text-xs text-muted-foreground"
                              >
                                Uses only a Client ID (no secret). Best for apps
                                that cannot keep secrets (e.g. browser or mobile
                                clients).
                              </p>
                            </div>
                          </div>

                          <div className="has-data-[state=checked]:border-primary/50 shadow-2xs relative flex w-full items-start gap-2 rounded-md border border-input p-4 outline-hidden">
                            <RadioGroupItem
                              value="confidential"
                              id={`${id}-2`}
                              aria-describedby={`${id}-2-description`}
                              className="order-1 after:absolute after:inset-0"
                            />
                            <div className="grid grow gap-2">
                              <Label htmlFor={`${id}-2`}>
                                Confidential client
                              </Label>
                              <p
                                id={`${id}-2-description`}
                                className="text-xs text-muted-foreground"
                              >
                                Authenticates with both a Client ID and a Client
                                Secret. Suitable for backend services that can
                                keep secrets secure.
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scopes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Scopes</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select scope" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["read:data"].map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the purpose of this API client"
                          className="resize-none"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create API client"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog open={isOpenResult} onOpenChange={setIsOpenResult}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Auth client created</DialogTitle>
          </DialogHeader>
          <div className="mt-2 flex flex-col gap-4">
            {/* label and value, for client id and client secret */}
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label className="text-gray-800">Client ID</Label>
                <div className="mb-1 flex items-center gap-2">
                  <Input
                    className="flex-1"
                    type="text"
                    value={result?.clientId}
                    ref={clientIdRef}
                    readOnly
                  />
                  <CopyButton text={result?.clientId} />
                </div>
              </div>
              {/* only show client secret if the client type is confidential */}
              {result?.clientSecret && (
                <div className="grid grid-cols-1 gap-1">
                  <Label className="text-gray-800">Client Secret</Label>
                  <div className="mb-1 flex items-center gap-2">
                    <Input
                      className="flex-1"
                      type="text"
                      value={result?.clientSecret}
                      ref={clientSecretRef}
                      readOnly
                    />
                    <CopyButton text={result?.clientSecret} />
                  </div>
                </div>
              )}
            </div>
            {result?.clientType === "confidential" && (
              <Alert variant="default">
                <AlertCircleIcon />
                <AlertTitle>Client Secret Generated !</AlertTitle>
                <AlertDescription>
                  <p className="mt-2">
                    Please copy and store the client secret securely now. You
                    won't be able to see it again!{" "}
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </div>
          <div className="mt-1 flex justify-end">
            <Button variant="outline" onClick={() => setIsOpenResult(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
