export function differenceInMinutes(date: Date) {
  const now: Date = new Date();
  const differenceInMs = now.getTime() - date.getTime();
  return differenceInMs / (1000 * 60);
}
