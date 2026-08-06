import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ExceptionPayload = {
  error?: string;
  message?: string | string[];
  statusCode?: number;
};

function toErrorIdentifier(status: number, payload?: ExceptionPayload): string {
  if (payload?.error) {
    return payload.error
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }

  if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
    return 'internal_server_error';
  }

  return `http_${status}`;
}

function toMessage(status: number, payload?: ExceptionPayload): string {
  if (Array.isArray(payload?.message)) {
    return 'Dados invalidos.';
  }

  if (payload?.message) {
    return payload.message;
  }

  if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
    return 'Erro interno do servidor.';
  }

  return 'Erro na requisicao.';
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    const payload =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as ExceptionPayload)
        : undefined;

    const body: Record<string, unknown> = {
      statusCode: status,
      error: toErrorIdentifier(status, payload),
      message: toMessage(status, payload),
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (Array.isArray(payload?.message)) {
      body.details = payload.message;
    }

    response.status(status).json(body);
  }
}
