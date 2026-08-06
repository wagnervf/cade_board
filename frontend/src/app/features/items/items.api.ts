import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { apiUrl } from '../../core/api-url';
import { PaginatedResponse } from '../../shared/pagination';

export type CatalogItemType = 'SISTEMA' | 'PROJETO' | 'SERVICO_INFRAESTRUTURA';
export type OperationalStatus = 'OK' | 'INSTAVEL' | 'PARADO';
export type ResponsibilityRole = 'TECNICO' | 'GERENCIAL';

export type ItemResponsible = {
  active: boolean;
  contactChannel: string | null;
  email: string | null;
  id: string;
  name: string;
  phone: string | null;
  relationshipId: string;
};

export type CatalogItem = {
  active: boolean;
  acronym: string;
  createdAt: string;
  description: string;
  expectedReturnAt: string | null;
  id: string;
  managerialResponsibles: ItemResponsible[];
  name: string;
  returnOverdue: boolean;
  status: OperationalStatus;
  statusNote: string | null;
  statusUpdatedAt: string;
  technicalResponsibles: ItemResponsible[];
  type: CatalogItemType;
  updatedAt: string;
};

export type ItemPayload = {
  acronym: string;
  description: string;
  name: string;
  type: CatalogItemType;
};

export type ItemListQuery = {
  includeInactive?: boolean;
  page: number;
  pageSize: number;
  search?: string;
  status?: OperationalStatus | '';
  type?: CatalogItemType | '';
};

@Injectable({ providedIn: 'root' })
export class ItemsApi {
  private readonly http = inject(HttpClient);

  list(query: ItemListQuery): Observable<PaginatedResponse<CatalogItem>> {
    let params = new HttpParams()
      .set('page', String(query.page))
      .set('pageSize', String(query.pageSize));

    const search = query.search?.trim();
    if (search) {
      params = params.set('search', search);
    }

    if (query.type) {
      params = params.set('type', query.type);
    }

    if (query.status) {
      params = params.set('status', query.status);
    }

    if (query.includeInactive) {
      params = params.set('includeInactive', 'true');
    }

    return this.http.get<PaginatedResponse<CatalogItem>>(apiUrl('/items'), {
      params,
    });
  }

  detail(id: string): Observable<CatalogItem> {
    return this.http.get<CatalogItem>(apiUrl(`/items/${id}`));
  }

  create(payload: ItemPayload): Observable<CatalogItem> {
    return this.http.post<CatalogItem>(apiUrl('/items'), payload);
  }

  update(id: string, payload: ItemPayload): Observable<CatalogItem> {
    return this.http.put<CatalogItem>(apiUrl(`/items/${id}`), payload);
  }

  setActive(id: string, active: boolean): Observable<CatalogItem> {
    return this.http.patch<CatalogItem>(apiUrl(`/items/${id}/active`), {
      active,
    });
  }

  addResponsibility(
    itemId: string,
    responsibleId: string,
    role: ResponsibilityRole,
  ): Observable<CatalogItem> {
    return this.http.post<CatalogItem>(apiUrl(`/items/${itemId}/responsibilities`), {
      responsibleId,
      role,
    });
  }

  removeResponsibility(itemId: string, relationshipId: string): Observable<void> {
    return this.http.delete<void>(
      apiUrl(`/items/${itemId}/responsibilities/${relationshipId}`),
    );
  }
}
