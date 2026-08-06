import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Subject, catchError, debounceTime, finalize, from, switchMap } from 'rxjs';

import {
  CatalogItem,
  CatalogItemType,
  ItemResponsible,
  ItemStatusPayload,
  ItemsApi,
  OperationalStatus,
} from '../items/items.api';
import { PaginatedResponse } from '../../shared/pagination';

type SelectOption<T extends string> = {
  label: string;
  value: T;
};

type PanelQuery = {
  page: number;
  pageSize: number;
  search?: string;
  status?: OperationalStatus | '';
  type?: CatalogItemType | '';
};

type StatusDraft = {
  expectedReturnAt: string;
  status: OperationalStatus;
  statusNote: string;
};

@Component({
  selector: 'app-panel-page',
  standalone: true,
  templateUrl: './panel.page.html',
  styleUrl: './panel.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelPage implements OnInit {
  private readonly api = inject(ItemsApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchRequests = new Subject<void>();

  readonly itemTypes: Array<SelectOption<CatalogItemType>> = [
    { label: 'Sistema', value: 'SISTEMA' },
    { label: 'Projeto', value: 'PROJETO' },
    { label: 'Servico de infraestrutura', value: 'SERVICO_INFRAESTRUTURA' },
  ];

  readonly statuses: Array<SelectOption<OperationalStatus>> = [
    { label: 'OK', value: 'OK' },
    { label: 'Instavel', value: 'INSTAVEL' },
    { label: 'Parado', value: 'PARADO' },
  ];

  readonly pageSize = 12;
  readonly search = signal('');
  readonly typeFilter = signal<CatalogItemType | ''>('');
  readonly statusFilter = signal<OperationalStatus | ''>('');
  readonly page = signal(1);
  readonly response = signal<PaginatedResponse<CatalogItem> | null>(null);
  readonly isLoading = signal(false);
  readonly activeStatusItemId = signal<string | null>(null);
  readonly savingStatusItemId = signal<string | null>(null);
  readonly statusDraft = signal<StatusDraft>({
    expectedReturnAt: '',
    status: 'OK',
    statusNote: '',
  });
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly copiedMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.applyInitialQueryParams();

    this.searchRequests
      .pipe(
        debounceTime(250),
        switchMap(() => this.updateUrlAndFetch()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => this.response.set(response));

    this.searchRequests.next();
  }

  updateSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
    this.searchRequests.next();
  }

  updateTypeFilter(value: string): void {
    this.typeFilter.set(this.isCatalogItemType(value) ? value : '');
    this.page.set(1);
    this.searchRequests.next();
  }

  updateStatusFilter(value: string): void {
    this.statusFilter.set(this.isOperationalStatus(value) ? value : '');
    this.page.set(1);
    this.searchRequests.next();
  }

  clearFilters(): void {
    this.search.set('');
    this.typeFilter.set('');
    this.statusFilter.set('');
    this.page.set(1);
    this.searchRequests.next();
  }

  previousPage(): void {
    const response = this.response();
    if (response && response.page > 1) {
      this.page.set(response.page - 1);
      this.searchRequests.next();
    }
  }

  nextPage(): void {
    const response = this.response();
    if (response && response.page < response.totalPages) {
      this.page.set(response.page + 1);
      this.searchRequests.next();
    }
  }

  openStatusForm(item: CatalogItem): void {
    this.clearMessages();
    this.activeStatusItemId.set(item.id);
    this.statusDraft.set({
      expectedReturnAt: this.toDateTimeLocalValue(item.expectedReturnAt),
      status: item.status,
      statusNote: item.statusNote ?? '',
    });
  }

  cancelStatusForm(): void {
    this.activeStatusItemId.set(null);
    this.statusDraft.set({
      expectedReturnAt: '',
      status: 'OK',
      statusNote: '',
    });
  }

  updateDraftStatus(status: string): void {
    if (!this.isOperationalStatus(status)) {
      return;
    }

    this.statusDraft.update((draft) => ({
      ...draft,
      expectedReturnAt: status === 'OK' ? '' : draft.expectedReturnAt,
      status,
    }));
  }

  updateDraftNote(statusNote: string): void {
    this.statusDraft.update((draft) => ({
      ...draft,
      statusNote,
    }));
  }

  updateDraftExpectedReturn(expectedReturnAt: string): void {
    this.statusDraft.update((draft) => ({
      ...draft,
      expectedReturnAt,
    }));
  }

  saveStatus(item: CatalogItem): void {
    if (this.savingStatusItemId() === item.id) {
      return;
    }

    const draft = this.statusDraft();
    const confirmed = window.confirm(`Confirmar alteracao de status de ${item.acronym}?`);
    if (!confirmed) {
      return;
    }

    if (draft.status === 'OK' && item.expectedReturnAt) {
      const clearForecast = window.confirm(
        'Ao voltar para OK, a previsao de retorno atual sera removida. Confirmar?',
      );

      if (!clearForecast) {
        return;
      }
    }

    this.clearMessages();
    this.savingStatusItemId.set(item.id);
    this.api
      .updateStatus(item.id, this.getStatusPayload(draft))
      .pipe(
        finalize(() => this.savingStatusItemId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updatedItem) => {
          this.updateLoadedItem(updatedItem);
          this.activeStatusItemId.set(null);
          this.successMessage.set(`Status de ${updatedItem.acronym} atualizado.`);
        },
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  copyContact(label: string, value: string | null): void {
    if (!value) {
      return;
    }

    const done = () => {
      this.copiedMessage.set(`${label} copiado.`);
      window.setTimeout(() => this.copiedMessage.set(null), 2200);
    };

    if (window.navigator.clipboard) {
      void window.navigator.clipboard.writeText(value).then(done);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    done();
  }

  typeLabel(type: CatalogItemType): string {
    return this.itemTypes.find((option) => option.value === type)?.label ?? type;
  }

  statusLabel(status: OperationalStatus): string {
    return this.statuses.find((option) => option.value === status)?.label ?? status;
  }

  statusIcon(status: OperationalStatus): string {
    const icons: Record<OperationalStatus, string> = {
      INSTAVEL: '!',
      OK: 'OK',
      PARADO: 'X',
    };

    return icons[status];
  }

  formatDate(value: string | null): string {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  contactSummary(responsible: ItemResponsible): string {
    const contacts = [
      responsible.phone,
      responsible.email,
      responsible.contactChannel,
    ].filter(Boolean);

    return contacts.length > 0 ? contacts.join(' | ') : 'Sem contato informado';
  }

  isStatusSaving(item: CatalogItem): boolean {
    return this.savingStatusItemId() === item.id;
  }

  private updateUrlAndFetch() {
    const query = this.getQuery();
    const queryParams = {
      page: query.page > 1 ? query.page : null,
      search: query.search || null,
      status: query.status || null,
      type: query.type || null,
    };

    this.errorMessage.set(null);

    return from(
      this.router.navigate([], {
        queryParams,
        relativeTo: this.route,
        replaceUrl: true,
      }),
    ).pipe(
      switchMap(() => {
        this.isLoading.set(true);
        return this.api.list(query).pipe(finalize(() => this.isLoading.set(false)));
      }),
      catchError((error: unknown) => {
        this.errorMessage.set(this.getErrorMessage(error));
        this.isLoading.set(false);
        return EMPTY;
      }),
    );
  }

  private getQuery(): PanelQuery {
    return {
      page: this.page(),
      pageSize: this.pageSize,
      search: this.search(),
      status: this.statusFilter(),
      type: this.typeFilter(),
    };
  }

  private getStatusPayload(draft: StatusDraft): ItemStatusPayload {
    return {
      expectedReturnAt:
        draft.status === 'OK' ? null : this.toIsoDateOrNull(draft.expectedReturnAt),
      status: draft.status,
      statusNote: this.normalizeOptional(draft.statusNote),
    };
  }

  private updateLoadedItem(item: CatalogItem): void {
    this.response.update((response) => {
      if (!response) {
        return response;
      }

      return {
        ...response,
        data: response.data.map((loadedItem) =>
          loadedItem.id === item.id ? item : loadedItem,
        ),
      };
    });
  }

  private clearMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.copiedMessage.set(null);
  }

  private applyInitialQueryParams(): void {
    const params = this.route.snapshot.queryParamMap;
    const page = Number(params.get('page') ?? 1);
    const status = params.get('status') ?? '';
    const type = params.get('type') ?? '';

    this.search.set(params.get('search') ?? '');
    this.page.set(Number.isInteger(page) && page > 0 ? page : 1);
    this.statusFilter.set(this.isOperationalStatus(status) ? status : '');
    this.typeFilter.set(this.isCatalogItemType(type) ? type : '');
  }

  private isCatalogItemType(value: string | null): value is CatalogItemType {
    return this.itemTypes.some((option) => option.value === value);
  }

  private isOperationalStatus(value: string | null): value is OperationalStatus {
    return this.statuses.some((option) => option.value === value);
  }

  private normalizeOptional(value: string): string | null {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  private toDateTimeLocalValue(value: string | null): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    const offsetMs = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
  }

  private toIsoDateOrNull(value: string): string | null {
    if (!value) {
      return null;
    }

    return new Date(value).toISOString();
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message =
        typeof error.error === 'object' && error.error !== null && 'message' in error.error
          ? error.error.message
          : null;

      if (Array.isArray(message)) {
        return message.join(' ');
      }

      if (typeof message === 'string' && message.trim() !== '') {
        return message;
      }
    }

    return 'Nao foi possivel concluir a operacao.';
  }
}
