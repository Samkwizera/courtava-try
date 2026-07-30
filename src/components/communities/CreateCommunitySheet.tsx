import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCourts } from "@/hooks/useCourts";

interface CreateCommunitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    court_id?: string;
    schedule?: string;
  }) => Promise<unknown>;
}

export function CreateCommunitySheet({
  open,
  onOpenChange,
  onSubmit,
}: CreateCommunitySheetProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [courtId, setCourtId] = useState("");
  const [schedule, setSchedule] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { dbCourts } = useCourts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const result = await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      court_id: courtId || undefined,
      schedule: schedule.trim() || undefined,
    });

    setIsSubmitting(false);

    if (result) {
      setName("");
      setDescription("");
      setCourtId("");
      setSchedule("");
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="mb-6">
          <SheetTitle>Create Community</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Community Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Saturday Morning Runs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell people what your community is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="court">Meeting Location</Label>
            <Select value={courtId} onValueChange={setCourtId}>
              <SelectTrigger id="court">
                <SelectValue placeholder="Select a court" />
              </SelectTrigger>
              <SelectContent>
                {dbCourts.map((court) => (
                  <SelectItem key={court.id} value={court.id}>
                    {court.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Schedule</Label>
            <Input
              id="schedule"
              placeholder="e.g., Saturdays 9am, Tues & Thurs 6pm"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Community"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
