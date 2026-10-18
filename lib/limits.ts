export const LIMITS = {
  topicMin: 8,
  topicMax: 200,
  messageMax: 600,
  questionMax: 300,
  interestMax: 60,
  /** One round = one student turn plus one opponent reply. */
  rounds: 3,
  maxCoachQuestions: 10,
  aiCallsPerMinute: 12,
  aiCallsPerDay: 200,
  requestBodyMaxBytes: 16 * 1024,
  historyPageSize: 50,
} as const;

export const TURN_SECONDS = [60, 120] as const;
