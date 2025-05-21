
export class QuestionHistoryDto {
  type: string;
  question: string;
  answer: string;
  created_at: Date;
}

export class QuestionHistoryRequestDto {
  userId: string;
  limit: number;
}