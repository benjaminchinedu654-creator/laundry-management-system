export interface ApiSuccess<T> {
  status: 'success';
  message: string;
  data: T;
}

export interface ApiError {
  status: 'error';
  message: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

// Thrown by api.ts on any non-2xx response
export class ApiException extends Error {
  statusCode: number;
  fieldErrors: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number,
    fieldErrors: Record<string, string[]> = {}
  ) {
    super(message);
    this.name = 'ApiException';
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}
