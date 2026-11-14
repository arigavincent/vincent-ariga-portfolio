import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FieldValues } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';

import { Button, Skeleton } from '@/components/ui';

import { adminKeys } from './adminKeys';
import { PageHeader } from './PageHeader';
import type { ResourceConfig } from './resourceConfig';
import { ResourceForm } from './ResourceForm';

interface ResourceEditPageProps<T extends { id: number }, V extends FieldValues, Input> {
  config: ResourceConfig<T, V, Input>;
}

/** Creates a new item (at .../new) or edits an existing one (at .../:id) of one content type. */
export function ResourceEditPage<T extends { id: number }, V extends FieldValues, Input>({
  config,
}: ResourceEditPageProps<T, V, Input>) {
  const { id: idParam } = useParams();
  const id = idParam === undefined ? null : Number(idParam);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const listPath = `/admin/${config.path}`;

  const existing = useQuery({
    queryKey: adminKeys.item(config.path, id ?? 0),
    queryFn: () => config.api.get(id ?? 0),
    enabled: id !== null,
  });

  const save = useMutation({
    mutationFn: (values: V) => {
      const input = config.toInput(values);
      return id === null ? config.api.create(input) : config.api.update(id, input);
    },
    onSuccess: async (saved) => {
      // The public site reads the same content, so its cached copies are refreshed too.
      await queryClient.invalidateQueries();
      await navigate(listPath, { state: { notice: `Saved "${config.describe(saved)}".` } });
    },
  });

  const cancel = (
    <Button to={listPath} variant="ghost">
      Cancel
    </Button>
  );

  if (id === null) {
    return (
      <>
        <PageHeader title={`New ${config.singular}`} />
        <ResourceForm
          schema={config.schema}
          fields={config.fields}
          values={config.defaults}
          submitLabel={`Create ${config.singular}`}
          pending={save.isPending}
          failure={save.error}
          onSubmit={(values) => {
            save.mutate(values);
          }}
          secondaryAction={cancel}
        />
      </>
    );
  }

  if (existing.isPending) {
    return (
      <div role="status" aria-label={`Loading ${config.singular}`}>
        <Skeleton className="h-96 rounded-card" />
      </div>
    );
  }
  if (existing.isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-4">
        <p className="text-muted">
          That {config.singular} could not be loaded. It may have been deleted.
        </p>
        <Button to={listPath} variant="secondary">
          Back to {config.title.toLowerCase()}
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={`Edit ${config.describe(existing.data)}`} />
      <ResourceForm
        key={existing.data.id}
        schema={config.schema}
        fields={config.fields}
        values={config.toValues(existing.data)}
        submitLabel="Save changes"
        pending={save.isPending}
        failure={save.error}
        onSubmit={(values) => {
          save.mutate(values);
        }}
        secondaryAction={cancel}
      />
    </>
  );
}
