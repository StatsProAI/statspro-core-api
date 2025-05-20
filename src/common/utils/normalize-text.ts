export function normalizeText(text: string): string {
    return text
    .normalize("NFD") // separa acentos das letras
    .replace(/[\u0300-\u036f]/g, "") // remove os acentos
    .replace(/\s+/g, "") // remove espaços
    .toLowerCase(); // transforma em minúsculas
}