export function twilioExtractPhoneNumber(from: string): string {
  const cleaned = from.replace(/^whatsapp:/, ''); // remove 'whatsapp:'
  if (cleaned.length === 13) {
    return cleaned.slice(0, 5) + '9' + cleaned.slice(5);
  } else {
    return cleaned;
  }
}
