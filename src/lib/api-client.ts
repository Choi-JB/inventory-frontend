/**
 * @description: API 에러 클래스
 * @param {number} status - 에러 상태 코드
 * @param {string} code - 에러 코드
 * @param {string} message - 에러 메시지
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
