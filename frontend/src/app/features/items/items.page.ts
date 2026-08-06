import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, switchMap } from 'rxjs';

import {
  CatalogItem,
  CatalogItemType,
  ItemPayload,
  ItemResponsible,
  ItemsApi,
  OperationalStatus,
  ResponsibilityRole,
} from './items.api';
import { Responsible, ResponsiblesApi } from '../responsibles/responsibles.api';
import { PaginatedResponse } from '../../shared/pagination';

type ItemControlName = 'acronym' | 'description' | 'name' | 'type';
type LinkControlName = 'responsibleId' | 'role';

type SelectOption<T extends string> = {
  label: string;
  value: T;
};

@Component({
  selector: 'app-items-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './items.page.html',
  styleUrl: './items.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsPage implements OnInit {
  private readonly api = inject(ItemsApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly responsiblesApi = inject(ResponsiblesApi);

  readonly itemTypes: Array<SelectOption<CatalogItemType>> = [
    { label: 'Sistema', value: 'SISTEMA' },
    { label: 'Projeto', value: 'PROJETO' },
    { label: 'Servico de infraestrutura', value: 'SERVICO_INFRAESTRUTURA' },
  ];

  readonly roles: Array<SelectOption<ResponsibilityRole>> = [
    { label: 'Tecnico', value: 'TECNICO' },
    { label: 'Gerencial', value: 'GERENCIAL' },
  ];

  readonly statuses: Array<SelectOption<OperationalStatus>> = [
    { label: 'OK', value: 'OK' },
    { label: 'Instavel', value: 'INSTAVEL' },
    { label: 'Parado', value: 'PARADO' },
  ];

  readonly pageSize = 10;
  readonly search = signal('');
  readonly typeFilter = signal<CatalogItemType | ''>('');
  readonly statusFilter = signal<OperationalStatus | ''>('');
  readonly response = signal<PaginatedResponse<CatalogItem> | null>(null);
  readonly responsibleOptions = signal<Responsible[]>([]);
  readonly responsibleSearch = signal('');
  readonly isLoading = signal(false);
  readonly isLoadingResponsibles = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly feedbackMessage = signal<string | null>(null);
  readonly editingItem = signal<CatalogItem | null>(null);

  readonly currentPage = computed(() => this.response()?.page ?? 1);
  readonly totalPages = computed(() => this.response()?.totalPages ?? 0);
  readonly canGoBack = computed(() => this.currentPage() > 1);
  readonly canGoForward = computed(() => this.currentPage() < this.totalPages());
  readonly technicalResponsibles = computed(
    () => this.editingItem()?.technicalResponsibles ?? [],
  );
  readonly managerialResponsibles = computed(
    () => this.editingItem()?.managerialResponsibles ?? [],
  );

  readonly itemForm = this.formBuilder.group({
    acronym: ['', [Validators.required, Validators.maxLength(30)]],
    description: ['', [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(160)]],
    type: ['SISTEMA' as CatalogItemType, [Validators.required]],
  });

  readonly linkForm = this.formBuilder.group({
    responsibleId: ['', [Validators.required]],
    role: ['TECNICO' as ResponsibilityRole, [Validators.required]],
  });

  ngOnInit(): void {
    this.loadItems(1);
    this.loadResponsibles();
  }

  searchItems(): void {
    this.loadItems(1);
  }

  clearFilters(): void {
    this.search.set('');
    this.typeFilter.set('');
    this.statusFilter.set('');
    this.loadItems(1);
  }

  previousPage(): void {
    if (this.canGoBack()) {
      this.loadItems(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.canGoForward()) {
      this.loadItems(this.currentPage() + 1);
    }
  }

  startCreate(): void {
    this.editingItem.set(null);
    this.clearMessages();
    this.itemForm.reset({
      acronym: '',
      description: '',
      name: '',
      type: 'SISTEMA',
    });
    this.linkForm.reset({
      responsibleId: '',
      role: 'TECNICO',
    });
  }

  editItem(item: CatalogItem): void {
    this.editingItem.set(item);
    this.clearMessages();
    this.itemForm.reset({
      acronym: item.acronym,
      description: item.description,
      name: item.name,
      type: item.type,
    });
    this.linkForm.reset({
      responsibleId: '',
      role: 'TECNICO',
    });
  }

  submitItem(): void {
    this.itemForm.markAllAsTouched();
    this.clearMessages();

    if (this.itemForm.invalid || this.isSaving()) {
      return;
    }

    const payload = this.getItemPayload();
    const editing = this.editingItem();
    const request = editing ? this.api.update(editing.id, payload) : this.api.create(payload);

    this.isSaving.set(true);
    request
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (item) => {
          this.feedbackMessage.set(editing ? 'Item atualizado.' : 'Item criado.');
          this.editItem(item);
          this.loadItems(this.currentPage());
        },
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  toggleActive(item: CatalogItem): void {
    const action = item.active ? 'inativar' : 'ativar';
    const confirmed = window.confirm(`Confirmar ${action} ${item.acronym}?`);

    if (!confirmed || this.isSaving()) {
      return;
    }

    this.clearMessages();
    this.isSaving.set(true);
    this.api
      .setActive(item.id, !item.active)
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updatedItem) => {
          this.feedbackMessage.set(item.active ? 'Item inativado.' : 'Item ativado.');
          this.updateLoadedItem(updatedItem);
        },
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  searchResponsibles(): void {
    this.loadResponsibles();
  }

  addResponsibility(): void {
    this.linkForm.markAllAsTouched();
    this.clearMessages();

    const item = this.editingItem();
    if (!item || this.linkForm.invalid || this.isSaving()) {
      return;
    }

    const value = this.linkForm.getRawValue();
    const responsibleId = value.responsibleId ?? '';
    const role = value.role ?? 'TECNICO';

    if (this.hasDuplicateResponsibility(item, responsibleId, role)) {
      this.errorMessage.set('Este responsavel ja possui este papel no item.');
      return;
    }

    this.isSaving.set(true);
    this.api
      .addResponsibility(item.id, responsibleId, role)
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updatedItem) => {
          this.feedbackMessage.set('Responsavel vinculado.');
          this.linkForm.reset({
            responsibleId: '',
            role,
          });
          this.updateLoadedItem(updatedItem);
        },
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  removeResponsibility(relationship: ItemResponsible): void {
    const item = this.editingItem();
    if (!item || this.isSaving()) {
      return;
    }

    const confirmed = window.confirm(`Remover ${relationship.name} deste item?`);
    if (!confirmed) {
      return;
    }

    this.clearMessages();
    this.isSaving.set(true);
    this.api
      .removeResponsibility(item.id, relationship.relationshipId)
      .pipe(
        switchMap(() => this.api.detail(item.id)),
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updatedItem) => {
          this.feedbackMessage.set('Vinculo removido.');
          this.updateLoadedItem(updatedItem);
        },
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  isItemInvalid(controlName: ItemControlName): boolean {
    const control = this.itemForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  isLinkInvalid(controlName: LinkControlName): boolean {
    const control = this.linkForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  typeLabel(type: CatalogItemType): string {
    return this.itemTypes.find((option) => option.value === type)?.label ?? type;
  }

  statusLabel(status: OperationalStatus): string {
    return this.statuses.find((option) => option.value === status)?.label ?? status;
  }

  roleLabel(role: ResponsibilityRole): string {
    return this.roles.find((option) => option.value === role)?.label ?? role;
  }

  private loadItems(page: number): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);
    this.api
      .list({
        includeInactive: true,
        page,
        pageSize: this.pageSize,
        search: this.search(),
        status: this.statusFilter(),
        type: this.typeFilter(),
      })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.response.set(response),
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  private loadResponsibles(): void {
    this.isLoadingResponsibles.set(true);
    this.responsiblesApi
      .list({
        page: 1,
        pageSize: 20,
        search: this.responsibleSearch(),
      })
      .pipe(
        finalize(() => this.isLoadingResponsibles.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.responsibleOptions.set(
            response.data.filter((responsible) => responsible.active),
          );
        },
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  private getItemPayload(): ItemPayload {
    const value = this.itemForm.getRawValue();

    return {
      acronym: value.acronym?.trim() ?? '',
      description: value.description?.trim() ?? '',
      name: value.name?.trim() ?? '',
      type: value.type ?? 'SISTEMA',
    };
  }

  private hasDuplicateResponsibility(
    item: CatalogItem,
    responsibleId: string,
    role: ResponsibilityRole,
  ): boolean {
    const relationships =
      role === 'TECNICO' ? item.technicalResponsibles : item.managerialResponsibles;

    return relationships.some((relationship) => relationship.id === responsibleId);
  }

  private updateLoadedItem(item: CatalogItem): void {
    this.editingItem.update((current) => (current?.id === item.id ? item : current));
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
    this.feedbackMessage.set(null);
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
