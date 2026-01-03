"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  minDate?: Date;
  placeholder?: string;
}

export function DateTimePicker({
  date,
  setDate,
  minDate,
  placeholder = "Pick a date and time",
}: DateTimePickerProps) {
  const [selectedDateTime, setSelectedDateTime] = React.useState<Date | undefined>(date);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Preserve the time if it was already set
      const newDate = new Date(selectedDate);
      if (selectedDateTime) {
        newDate.setHours(selectedDateTime.getHours());
        newDate.setMinutes(selectedDateTime.getMinutes());
      }
      setSelectedDateTime(newDate);
      setDate(newDate);
    }
  };

  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    if (selectedDateTime) {
      const newDate = new Date(selectedDateTime);
      if (type === "hour") {
        newDate.setHours(parseInt(value) || 0);
      } else {
        newDate.setMinutes(parseInt(value) || 0);
      }
      setSelectedDateTime(newDate);
      setDate(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal border-2",
            !selectedDateTime && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDateTime ? (
            format(selectedDateTime, "PPP HH:mm")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDateTime}
          onSelect={handleDateSelect}
          disabled={(date) =>
            minDate ? date < minDate : false
          }
          initialFocus
        />
        <div className="p-3 border-t">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              min="0"
              max="23"
              value={selectedDateTime?.getHours() ?? 0}
              onChange={(e) => handleTimeChange("hour", e.target.value)}
              className="w-16 text-center"
              placeholder="HH"
            />
            <span>:</span>
            <Input
              type="number"
              min="0"
              max="59"
              value={selectedDateTime?.getMinutes() ?? 0}
              onChange={(e) => handleTimeChange("minute", e.target.value)}
              className="w-16 text-center"
              placeholder="MM"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
