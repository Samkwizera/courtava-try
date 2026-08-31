import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export type IssueCategory = "bug" | "account" | "court_data" | "feature" | "other";

export interface IssueReportInput {
  category: IssueCategory;
  subject: string;
  description: string;
}

export function isValidIssueReport({ subject, description }: IssueReportInput) {
  const subjectLength = subject.trim().length;
  const descriptionLength = description.trim().length;
  return subjectLength >= 3 && subjectLength <= 120 && descriptionLength >= 10 && descriptionLength <= 4000;
}

export function useIssueReports() {
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async ({ category, subject, description }: IssueReportInput) => {
      if (!user) throw new Error("Sign in to report an issue");
      if (!isValidIssueReport({ category, subject, description })) {
        throw new Error("Add a short subject and at least 10 characters of detail");
      }

      const { error } = await supabase.from("issue_reports").insert({
        user_id: user.id,
        reporter_email: user.email ?? null,
        category,
        subject: subject.trim(),
        description: description.trim(),
        page_path: window.location.pathname,
        app_version: __APP_VERSION__,
        user_agent: navigator.userAgent,
      });

      if (error) throw error;
    },
  });

  return {
    submitReport: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
  };
}
