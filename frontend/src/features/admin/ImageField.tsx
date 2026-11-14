import { useMutation } from '@tanstack/react-query';
import { ImageUp, LoaderCircle } from 'lucide-react';
import { useId, useRef } from 'react';

import { adminApi } from '@/api/admin';
import { ApiError, apiUrl } from '@/api/client';
import { TextField, type TextFieldProps } from '@/components/ui';
import { buttonClasses } from '@/components/ui/buttonClasses';

interface ImageFieldProps extends TextFieldProps {
  /** Current value, for the preview. */
  value: string;
  /** Called with the uploaded file's URL. */
  onUploaded: (url: string) => void;
}

/** A URL input with an upload button: choosing a file uploads it and fills the URL in. */
export function ImageField({ value, onUploaded, hint, ...field }: ImageFieldProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const fileInputId = useId();
  const upload = useMutation({
    mutationFn: adminApi.uploadImage,
    onSuccess: (result) => {
      onUploaded(result.url);
    },
  });
  const failure =
    upload.error instanceof ApiError
      ? upload.error.message
      : upload.isError
        ? 'The upload failed.'
        : undefined;

  return (
    <div className={field.wrapperClassName}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <TextField
          {...field}
          wrapperClassName="flex-1"
          hint={hint}
          error={field.error ?? failure}
        />
        <label
          htmlFor={fileInputId}
          className={buttonClasses({
            variant: 'secondary',
            className: 'h-[3.125rem] cursor-pointer',
          })}
        >
          {upload.isPending ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <ImageUp aria-hidden="true" className="size-4" />
          )}
          {upload.isPending ? 'Uploading' : 'Upload image'}
        </label>
        <input
          ref={fileInput}
          id={fileInputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              upload.mutate(file);
            }
            event.target.value = '';
          }}
        />
      </div>
      {value ? (
        <img
          src={apiUrl(value)}
          alt="Current cover"
          className="mt-3 h-32 w-auto rounded-xl border border-ink-700 object-cover"
        />
      ) : null}
    </div>
  );
}
