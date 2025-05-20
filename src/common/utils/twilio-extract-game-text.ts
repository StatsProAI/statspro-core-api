export function extractGameText(text: string) {
  const regex = /\*(\d+)\.\*\s([^\*]+?)\s-\s(\d{2}\/\d{2})(?:\s\d{2}:\d{2})?/g;
  const matches = Array.from(text.matchAll(regex)); // <-- aqui, usando Array.from

  const games = matches.map((match) => ({
    numero: Number(match[1]),
    titulo: match[2].trim(),
    dataHora: match[3],
  }));
  return games;
}
