export function storageError(e: unknown) {
  const message = e instanceof Error ? e.message : "Save failed";
  return Response.json({ error: message }, { status: 500 });
}