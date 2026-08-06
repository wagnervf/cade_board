import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';

import { ApiStatusService } from './api-status.service';

function getErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const apiMessage =
      typeof error.error === 'object' && error.error !== null && 'message' in error.error
        ? String(error.error.message)
        : '';

    return apiMessage || 'Nao foi possivel concluir a requisicao.';
  }

  return 'Nao foi possivel concluir a requisicao.';
}

export const apiStatusInterceptor: HttpInterceptorFn = (request, next) => {
  const status = inject(ApiStatusService);

  status.startRequest();

  return next(request).pipe(
    catchError((error: unknown) => {
      status.setError(getErrorMessage(error));
      return throwError(() => error);
    }),
    finalize(() => status.finishRequest()),
  );
};
