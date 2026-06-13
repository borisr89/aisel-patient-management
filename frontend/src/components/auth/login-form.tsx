'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Controller,
  type FieldErrors,
  useForm,
} from 'react-hook-form';

import { useAuth } from '@/components/auth/auth-provider';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/api-client';
import {
  loginSchema,
  type LoginFormValues,
} from '@/schemas/auth.schema';

export function LoginForm() {
  const router = useRouter();

  const {
    login,
    session,
    isHydrated,
  } = useAuth();

  const [error, setError] =
    useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (isHydrated && session) {
      router.replace('/patients');
    }
  }, [isHydrated, router, session]);

  async function handleValidSubmit(
    values: LoginFormValues,
  ): Promise<void> {
    setError(null);

    try {
      await login({
        email: values.email.trim(),
        password: values.password,
      });

      router.replace('/patients');
    } catch (loginError: unknown) {
      setError(getErrorMessage(loginError));
    }
  }

  function handleInvalidSubmit(
    _errors: FieldErrors<LoginFormValues>,
  ): void {
    setError(
      'Please correct the highlighted fields.',
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          Patient Management
        </CardTitle>

        <CardDescription>
          Sign in with one of the provided
          assessment accounts.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert
            variant="destructive"
            role="alert"
          >
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form
          id="login-form"
          onSubmit={form.handleSubmit(
            handleValidSubmit,
            handleInvalidSubmit,
          )}
          noValidate
        >
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({
                field,
                fieldState,
              }) => (
                <Field
                  data-invalid={
                    fieldState.invalid
                  }
                >
                  <FieldLabel
                    htmlFor="login-email"
                  >
                    Email
                  </FieldLabel>

                  <Input
                    {...field}
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@aisel.local"
                    aria-invalid={
                      fieldState.invalid
                    }
                    disabled={
                      form.formState
                        .isSubmitting
                    }
                  />

                  {fieldState.invalid && (
                    <FieldError
                      errors={[
                        fieldState.error,
                      ]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({
                field,
                fieldState,
              }) => (
                <Field
                  data-invalid={
                    fieldState.invalid
                  }
                >
                  <FieldLabel
                    htmlFor="login-password"
                  >
                    Password
                  </FieldLabel>

                  <Input
                    {...field}
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={
                      fieldState.invalid
                    }
                    disabled={
                      form.formState
                        .isSubmitting
                    }
                  />

                  {fieldState.invalid && (
                    <FieldError
                      errors={[
                        fieldState.error,
                      ]}
                    />
                  )}
                </Field>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={
                form.formState.isSubmitting
              }
            >
              {form.formState
                .isSubmitting && (
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}

              {form.formState.isSubmitting
                ? 'Signing in...'
                : 'Sign in'}
            </Button>
          </FieldGroup>
        </form>

        <div className="rounded-md bg-muted p-3 text-sm">
          <p className="font-medium">
            Demo accounts
          </p>

          <p>
            Admin: admin@aisel.local /
            Admin123!
          </p>

          <p>
            User: user@aisel.local /
            User123!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}