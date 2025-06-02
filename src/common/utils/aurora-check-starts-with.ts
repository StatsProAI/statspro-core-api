export const AURORA_ERRORS = ['opa', 'não sei', 'Créditos insuficientes', 'Erro ao processar análise'];

export function auroraCheckStartsWith(text: string, wordsArray: string[]): boolean {
  const lowerText: string = text.toLowerCase();
  const lowerWordsArray: string[] = wordsArray.map((word) =>
    word.toLowerCase(),
  );

  return lowerWordsArray.some((word) => lowerText.startsWith(word));
}
