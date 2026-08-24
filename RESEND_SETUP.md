# Resend Email Setup

Courtava sends account confirmation and password-reset emails through Supabase Auth. To deliver those emails with Resend, configure Resend as Supabase Auth's custom SMTP provider.

## Resend

1. Create a Resend API key.
2. Verify the sending domain you want to use, for example `auth.yourdomain.com`.
3. Use a sender address on that verified domain, for example `Courtava <no-reply@auth.yourdomain.com>`.

## Supabase

In the Supabase dashboard for this project, open Authentication settings and enable custom SMTP.

Use these settings:

```text
Host: smtp.resend.com
Port: 465
Username: resend
Password: <your Resend API key>
Sender email: no-reply@auth.yourdomain.com
Sender name: Courtava
```

Port `465` uses implicit TLS. Resend also supports STARTTLS ports such as `587`, but use one port consistently with the security mode selected in Supabase.

Do not add the Resend API key to Vite frontend environment variables. It belongs only in Supabase's SMTP configuration or server-side secrets.

## Email Templates

Sign-up confirmation uses a **6-digit code**, not a confirmation link. The Confirm signup template in Supabase must render `{{ .Token }}`. If it still uses `{{ .ConfirmationURL }}`, users receive a link the app no longer handles.

Password reset still uses a link and continues to rely on `{{ .ConfirmationURL }}`.

## App Behavior

After sign-up, the app shows a code-entry screen and verifies the address with Supabase Auth's `verifyOtp` endpoint. That screen has a **Resend code** action calling the resend endpoint. Signing in with an unconfirmed address also sends a fresh code and drops the user on the same screen.

Once custom SMTP is enabled in Supabase, all of these emails are delivered through Resend.
