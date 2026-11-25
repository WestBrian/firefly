"use client";

import { IconLock, IconMail, IconUser } from "@tabler/icons-react";
import { useForm, useStore } from "@tanstack/react-form";
import { useId, useState, type ReactNode } from "react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/components/ui/input-group";

import { authErrorMessage, type AuthResult } from "../lib/auth-errors";

const defaultValues = {
  email: "",
  password: "",
  username: "",
};

type AuthValues = typeof defaultValues;

const inputIcons = { email: IconMail, password: IconLock, text: IconUser };

type AuthField = {
  name: keyof AuthValues;
  label: string;
  type: keyof typeof inputIcons;
  autoComplete: string;
  description?: string;
  placeholder?: string;
};

export const emailField = {
  name: "email",
  label: "Email address",
  type: "email",
  autoComplete: "username",
  placeholder: "you@example.com",
} satisfies AuthField;
export const passwordField = {
  name: "password",
  label: "Password",
  type: "password",
  autoComplete: "current-password",
} satisfies AuthField;
export const newPasswordField = {
  ...passwordField,
  autoComplete: "new-password",
} satisfies AuthField;
export const usernameField = {
  name: "username",
  label: "Username",
  type: "text",
  autoComplete: "username webauthn",
  description:
    "Use your passkey username or choose a new one to create an account.",
} satisfies AuthField;

export function AuthForm({
  fields,
  label,
  variant = "default",
  pending,
  submit,
  onSubmittingChange,
  children,
}: {
  fields: readonly AuthField[];
  label: string;
  variant?: "default" | "secondary";
  pending: boolean;
  submit: (values: AuthValues) => Promise<AuthResult>;
  onSubmittingChange?: (submitting: boolean) => void;
  children?: ReactNode;
}) {
  const formId = useId();
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        const result = await submit(value);
        if ("userError" in result) {
          setError(authErrorMessage(result.userError));
        }
      } catch {
        setError("Something went wrong. Please try again.");
      }
    },
  });
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isPending = pending || isSubmitting;

  return (
    <form
      method="post"
      onSubmit={(event) => {
        event.preventDefault();
        if (pending || form.state.isSubmitting) return;

        // Password managers can fill inputs without firing React change events.
        const data = new FormData(event.currentTarget);
        for (const { name } of fields) {
          const value = data.get(name);
          if (typeof value === "string" && value !== form.getFieldValue(name)) {
            form.setFieldValue(name, value);
          }
        }
        onSubmittingChange?.(true);
        void form
          .handleSubmit()
          .catch(() => setError("Something went wrong. Please try again."))
          .finally(() => onSubmittingChange?.(false));
      }}
    >
      <FieldGroup>
        {fields.map(
          ({ name, label, type, autoComplete, description, placeholder }) => {
            const Icon = inputIcons[type];
            const inputId = `${formId}-${name}`;
            const descriptionId = `${inputId}-description`;

            return (
              <form.Field key={name} name={name}>
                {(field) => (
                  <Field data-disabled={isPending}>
                    <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
                    <InputGroup isDisabled={isPending}>
                      <InputGroupInput
                        id={inputId}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        type={type}
                        placeholder={placeholder}
                        autoComplete={autoComplete}
                        autoCapitalize="none"
                        spellCheck={false}
                        aria-describedby={
                          description ? descriptionId : undefined
                        }
                        required
                        disabled={isPending}
                      />
                      <InputGroupAddon aria-hidden="true">
                        <Icon />
                      </InputGroupAddon>
                    </InputGroup>
                    {description && (
                      <FieldDescription id={descriptionId}>
                        {description}
                      </FieldDescription>
                    )}
                  </Field>
                )}
              </form.Field>
            );
          },
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {children}
        <Button
          type="submit"
          isDisabled={isPending}
          className="w-full"
          size="lg"
          variant={variant}
        >
          {isPending ? "Please wait…" : label}
        </Button>
      </FieldGroup>
    </form>
  );
}
