import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { apiUrl } from '../../core/api-url';
import { PaginatedResponse } from '../../shared/pagination';

export type Responsible = {
  active: boolean;
  contactChannel: string | null;
  createdAt: string;
  email: string | null;
  id: string;
  name: string;
  phone: string | null;
  updatedAt: string;
};

export type ResponsiblePayload = {
  contactChannel?: string | null;
  email?: string | null;
  name: string;
  phone?: string | null;
};

export type ResponsibleListQuery = {
  page: number;
  pageSize: number;
  search?: string;
};

@Injectable({ providedIn: 'root' })
export class ResponsiblesApi {
  private readonly http = inject(HttpClient);

  list(query: ResponsibleListQuery): Observable<PaginatedResponse<Responsible>> {
    let params = new HttpParams()
      .set('page', String(query.page))
      .set('pageSize', String(query.pageSize));

    const search = query.search?.trim();
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<Responsible>>(apiUrl('/responsibles'), {
      params,
    });
  }

  create(payload: ResponsiblePayload): Observable<Responsible> {
    return this.http.post<Responsible>(apiUrl('/responsibles'), payload);
  }

  update(id: string, payload: ResponsiblePayload): Observable<Responsible> {
    return this.http.put<Responsible>(apiUrl(`/responsibles/${id}`), payload);
  }

  setActive(id: string, active: boolean): Observable<Responsible> {
    return this.http.patch<Responsible>(apiUrl(`/responsibles/${id}/active`), {
      active,
    });
  }
}
