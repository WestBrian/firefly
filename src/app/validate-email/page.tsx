import { EmailLink } from "@/features/auth/components/email-link";

// TODO(#11): Remove after upgrading to a Next.js release with the validation fix.
export const instant = false;

export default function ValidateEmailPage() {
  return <EmailLink flow="verification" />;
}
