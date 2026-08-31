import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isValidIssueReport, useIssueReports, type IssueCategory } from "@/hooks/useIssueReports";

const CATEGORY_OPTIONS: { value: IssueCategory; label: string }[] = [
  { value: "bug", label: "Something is not working" },
  { value: "account", label: "Account or sign-in" },
  { value: "court_data", label: "Incorrect court information" },
  { value: "feature", label: "Feature suggestion" },
  { value: "other", label: "Other" },
];

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const { submitReport, isSubmitting } = useIssueReports();
  const [category, setCategory] = useState<IssueCategory>("bug");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const canSubmit = isValidIssueReport({ category, subject, description });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) {
      toast.error("Add a short subject and at least 10 characters of detail");
      return;
    }

    try {
      await submitReport({ category, subject, description });
      toast.success("Thanks — we received your report");
      navigate("/support", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send report");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-28">
      <PageHeader title="Report an issue" back="/support" />
      <main className="mx-auto w-full max-w-2xl p-4">
        <p className="mb-6 text-sm leading-6 text-muted-foreground">
          Tell us what happened. We automatically include your current page, app version, and browser details to help investigate.
        </p>
        <Section grouped>
          <form className="space-y-5 p-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="issue-category">What can we help with?</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as IssueCategory)}>
                <SelectTrigger id="issue-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-subject">Subject</Label>
              <Input
                id="issue-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Briefly describe the problem"
                minLength={3}
                maxLength={120}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-description">What happened?</Label>
              <Textarea
                id="issue-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What did you expect, and what happened instead?"
                rows={6}
                minLength={10}
                maxLength={4000}
                required
              />
              <p className="text-xs text-muted-foreground">Do not include passwords or other sensitive information.</p>
            </div>

            <Button className="w-full" type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Sending..." : "Send report"}
            </Button>
          </form>
        </Section>
      </main>
    </div>
  );
}
