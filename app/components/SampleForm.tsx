"use client";

import { memo, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Button } from "@/app/components/Button";
import { apiFetch } from "@/lib/api";

const FIELD_LABELS = {
  name: "名前",
  email: "メールアドレス",
} as const;

const sampleFormSchema = z.object({
  name: z.string().min(1, `${FIELD_LABELS.name}は必須です`),
  email: z
    .string()
    .min(1, `${FIELD_LABELS.email}は必須です`)
    .email("メールアドレスの形式が正しくありません"),
});

type SampleFormValues = z.infer<typeof sampleFormSchema>;

type SampleFormApiRequest = SampleFormValues;
type SampleFormApiResponse = { message: string };

const API_PATH = "/api/sample" as const;

async function submitSampleForm(data: SampleFormApiRequest): Promise<SampleFormApiResponse> {
  return apiFetch<SampleFormApiResponse>(API_PATH, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

type SampleFormProps = {
  onSuccess?: (response: SampleFormApiResponse) => void;
};

const SampleForm = memo(function SampleForm({ onSuccess }: SampleFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SampleFormValues>({
    resolver: zodResolver(sampleFormSchema),
  });

  const onSubmit = useCallback(
    async (data: SampleFormValues) => {
      try {
        const response = await submitSampleForm(data);
        toast.success(response.message ?? "送信しました");
        reset();
        onSuccess?.(response);
      } catch (error) {
        const message = error instanceof Error ? error.message : "送信に失敗しました";
        toast.error(message);
      }
    },
    [reset, onSuccess]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 w-full max-w-md">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          {FIELD_LABELS.name}
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register("name")}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="text-xs text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          {FIELD_LABELS.email}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-xs text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      <Button submit loading={isSubmitting} className="mt-2">
        {isSubmitting ? "送信中..." : "送信"}
      </Button>
    </form>
  );
});

export { SampleForm };
export type { SampleFormProps, SampleFormApiResponse };
