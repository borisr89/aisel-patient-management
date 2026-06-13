'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Controller,
  useForm,
} from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  loginSchema,
  type LoginFormValues,
} from '@/schemas/auth.schema';

export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(
    values: LoginFormValues,
  ): Promise<void> {
    console.log(values);
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
            >
              <FieldLabel htmlFor="login-email">
                Email
              </FieldLabel>

              <Input
                {...field}
                id="login-email"
                type="email"
                autoComplete="email"
                aria-invalid={
                  fieldState.invalid
                }
              />

              {fieldState.invalid && (
                <FieldError
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
            >
              <FieldLabel htmlFor="login-password">
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
              />

              {fieldState.invalid && (
                <FieldError
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        className="w-full"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting
          ? 'Signing in...'
          : 'Sign in'}
      </Button>
    </form>
  );
}
