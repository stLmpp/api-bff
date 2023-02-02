import { getReasonPhrase } from 'http-status-codes';

import {
  type ErrorResponseErrorObject,
  type ErrorResponseInterface,
} from './error-response.schema.js';

/**
 * @public
 */
export class ErrorResponse implements ErrorResponseInterface {
  constructor({
    status,
    errors,
    error,
    code,
    message,
  }: ErrorResponseInterface) {
    this.status = status;
    this.statusText = getReasonPhrase(status);
    if (errors != null) {
      this.errors = errors;
    }
    if (error != null) {
      this.error = error;
    }
    this.code = code;
    this.message = message;
  }
  status: number;
  statusText: string;
  errors?: ErrorResponseErrorObject[];
  error?: string;
  code: string;
  message: string;
}
