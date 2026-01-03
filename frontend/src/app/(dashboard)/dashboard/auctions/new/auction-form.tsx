"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createAuctionAction } from "@/app/actions/auction-actions";
import type { Item } from "@/types/item";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";

const CATEGORIES = [
  "electronics",
  "fashion",
  "home",
  "sports",
  "toys",
  "books",
  "art",
  "collectibles",
  "other",
] as const;

const auctionSchema = z
  .object({
    itemId: z.string().min(1, "Please select an item"),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    category: z.enum(CATEGORIES, { message: "Please select a category" }),
    startingPrice: z.number().min(1, "Starting price must be at least 1"),
    minIncrement: z.number().min(1, "Minimum increment must be at least 1"),
    startTime: z.date({ message: "Please select a start time" }),
    endTime: z.date({ message: "Please select an end time" }),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  })
  .refine(
    (data) => {
      const now = new Date();
      return data.startTime > new Date(now.getTime() + 60000);
    },
    {
      message: "Start time must be at least 1 minute in the future",
      path: ["startTime"],
    }
  );

type AuctionFormValues = z.infer<typeof auctionSchema>;

interface AuctionFormProps {
  items: Item[];
  preselectedItemId: string | null;
}

export default function AuctionForm({
  items,
  preselectedItemId,
}: AuctionFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");

  const now = new Date();
  const minStartTime = new Date(now.getTime() + 60000);
  const minEndTime = new Date(now.getTime() + 3600000);

  const form = useForm<AuctionFormValues>({
    resolver: zodResolver(auctionSchema),
    mode: "onChange",
    defaultValues: {
      itemId: preselectedItemId || "",
      title: "",
      description: "",
      startingPrice: 0,
      minIncrement: 10,
    },
  });

  const onSubmit = async (data: AuctionFormValues) => {
    setError("");

    try {
      await createAuctionAction({
        itemId: data.itemId,
        title: data.title,
        description: data.description,
        category: data.category,
        startingPrice: data.startingPrice,
        minIncrement: data.minIncrement,
        startTime: data.startTime.toISOString(),
        endTime: data.endTime.toISOString(),
      });

      router.push("/dashboard/auctions");
    } catch (err: any) {
      setError(err.message || "Failed to create auction");
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Auction Details</CardTitle>
        <CardDescription>Configure your auction settings</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border-2 border-destructive/30 text-destructive px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="itemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Item *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose an item" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.title} ({item.category})
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auction Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Vintage Watch Auction"
                      {...field}
                    />
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
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Auction details..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starting Price *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="100"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minIncrement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Increment</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="10"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time *</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        date={field.value}
                        setDate={field.onChange}
                        minDate={minStartTime}
                        placeholder="Pick start time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time *</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        date={field.value}
                        setDate={field.onChange}
                        minDate={minEndTime}
                        placeholder="Pick end time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="bg-primary hover:bg-[var(--navy-dark)] flex-1 shadow-md hover:shadow-lg"
              >
                {form.formState.isSubmitting ? "Creating..." : "Create Auction"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
