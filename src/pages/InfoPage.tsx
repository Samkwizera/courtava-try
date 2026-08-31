import { useLocation, useNavigate } from "react-router-dom";
import { Bug, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";

const CONTENT = {
  privacy: {
    title: "Privacy policy",
    intro: "Courtava uses the information needed to provide accounts, nearby courts, games, check-ins, and community features.",
    sections: [
      ["Information we use", "Account details, profile information, court and game activity, check-ins, preferences, and location when you choose to enable it."],
      ["How it is used", "To operate Courtava, personalize nearby activity, secure accounts, send requested reminders, and improve reliability."],
      ["Your choices", "You can disable location and notifications in Settings. You can also request a password reset or permanently delete your account."],
      ["Data protection", "Courtava uses authenticated access and database row-level security. Never share your password or recovery links."],
    ],
  },
  terms: {
    title: "Terms of use",
    intro: "Use Courtava responsibly and only for lawful basketball community activity.",
    sections: [
      ["Your account", "Keep your account information accurate and protect your login details. You are responsible for activity performed through your account."],
      ["Community conduct", "Do not harass players, misrepresent games, publish unsafe content, or interfere with other people’s use of Courtava."],
      ["Court and game information", "Availability, fees, schedules, and attendance can change. Confirm important details with the venue or host before traveling."],
      ["Account action", "Courtava may restrict abusive or unsafe use. You may stop using the service and delete your account from Settings."],
    ],
  },
} as const;

export default function InfoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const kind = location.pathname.includes("terms") ? "terms" : location.pathname.includes("support") ? "support" : "privacy";

  if (kind === "support") return <div className="min-h-[100dvh] bg-background pb-12"><PageHeader title="Help and support" back="/settings" /><main className="mx-auto max-w-2xl p-4"><p className="mb-6 text-sm leading-6 text-muted-foreground">Find quick answers and report technical problems.</p><Section grouped><button type="button" onClick={() => navigate("/report-issue")} className="ios-tap flex w-full items-center justify-between p-4 text-left hover:bg-muted/40"><span className="flex items-center gap-3"><Bug className="h-5 w-5 text-primary" /><span><span className="block font-medium">Report a problem</span><span className="block text-sm text-muted-foreground">Tell us what went wrong</span></span></span><ChevronRight className="h-5 w-5 text-muted-foreground" /></button></Section><Section label="Common questions" grouped><div className="p-4"><h2 className="font-medium">Why can’t I see nearby courts?</h2><p className="mt-1 text-sm leading-5 text-muted-foreground">Check that location is allowed, then confirm the map and court filters are not hiding results.</p></div><div className="p-4"><h2 className="font-medium">Why didn’t I receive a reminder?</h2><p className="mt-1 text-sm leading-5 text-muted-foreground">Enable browser permission and the matching reminder in Settings.</p></div></Section></main></div>;

  const content = CONTENT[kind];
  return <div className="min-h-[100dvh] bg-background pb-12"><PageHeader title={content.title} back="/settings" /><main className="mx-auto max-w-2xl p-4"><p className="mb-6 text-sm leading-6 text-muted-foreground">{content.intro}</p><div className="grid gap-5">{content.sections.map(([title, body]) => <section key={title}><h2 className="text-base font-bold">{title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p></section>)}</div><p className="mt-8 text-xs text-muted-foreground">Last updated August 30, 2026</p></main></div>;
}
