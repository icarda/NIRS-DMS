"use client";

import { useState, useTransition } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { countries } from "country-data-list";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { FormError } from "@/components/form-error";
import { LocationCommand } from "@/components/location-autocomplete";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Country, CountryDropdown } from "@/components/ui/country-dropdown";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { register } from "@/features/auth/actions/register";
import { registerSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const centers = ["ICARDA", "CIMMYT"] as const;
const positions = ["Engineer", "Researcher", "Associate"] as const;

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | undefined>("");

  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      location: "",
      position: "",
      email: "",
      password: "",
      country: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setError("");
    startTransition(() => {
      register(values).then((data) => {
        setError(data.message);
      });
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>First Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="Max"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="Robinson"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Country</FormLabel>
                    <FormControl>
                      <CountryDropdown
                        placeholder="Country"
                        defaultValue={field.value}
                        onChange={(country) => {
                          field.onChange(country.name);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LocationCommand
                          onSelect={(val) => {
                            form.setValue("location", val.description, {
                              shouldValidate: true,
                              shouldTouch: true,
                            });
                            console.log(val);
                          }}
                          value={field.value}
                          onChange={field.onChange}
                          // countryCode={
                          //   countries.all.find(
                          //     (c) => c.name === form.getValues("country")
                          //   )?.alpha2 ?? undefined
                          // }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="center"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Center</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select center" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {centers.map((center) => (
                          <SelectItem key={center} value={center}>
                            {center}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Position</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {positions.map((position) => (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Password</FormLabel>
                    <FormControl>
                      <Input disabled={isPending} type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormError message={error} />
              <Button disabled={isPending} type="submit" className="w-full">
                Register
              </Button>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="underline underline-offset-4"
                >
                  Login
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4">
        By registering, you agree to our{" "}
        <Link href="#" className="hover:text-primary">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="hover:text-primary">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
