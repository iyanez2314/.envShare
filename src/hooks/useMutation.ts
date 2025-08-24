import { useCallback, useState } from "react";

export function useMutation<TVariables, TData, TError = Error>(opts: {
  fn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (ctx: { data: TData }) => void | Promise<void>;
}) {
  const [submittedAt, setSubmittedAt] = useState<number | undefined>();
  const [variables, setVariables] = useState<TVariables | undefined>();
  const [error, setError] = useState<TError | undefined>();
  const [data, setData] = useState<TData | undefined>();
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | undefined> => {
      setStatus("pending");
      setSubmittedAt(Date.now());
      setVariables(variables);
      //
      try {
        const data = await opts.fn(variables);
        console.log("Mutation successful:", { data });
        await opts.onSuccess?.({ data });
        setStatus("success");
        setError(undefined);
        setData(data);
        return data;
      } catch (err: any) {
        setStatus("error");
        setError(err);
      }
    },
    [opts.fn],
  );

  return {
    status,
    variables,
    submittedAt,
    mutate,
    error,
    data,
  };
}
