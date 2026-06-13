export function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(value));
}

export function toDateInputValue(
  value: string,
): string {
  return value.slice(0, 10);
}
