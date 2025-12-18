export function toWarekiYear(westYear: number, eraName: string, startYear: number): string {
  const year = westYear - startYear + 1;
  if (year === 1) {
    return `${eraName}元年`;
  }
  return `${eraName}${year}年`;
}
