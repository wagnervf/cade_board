import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';

import {
  Responsible,
  ResponsiblePayload,
  ResponsiblesApi,
} from './responsibles.api';
import { atLeastOneContactValidator } from './responsibles.form';
import { PaginatedResponse } from '../../shared/pagination';

@Component({
  selector: 'app-responsibles-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './responsibles.page.html',
  styleUrl: './responsibles.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponsiblesPage implements OnInit {
  private readonly api = inject(ResponsiblesApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  readonly pageSize = 10;
  readonly search = signal('');
  readonly response = signal<PaginatedResponse<Responsible> | null>(null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly feedbackMessage = signal<string | null>(null);
  readonly editingResponsible = signal<Responsible | null>(null);

  readonly currentPage = computed(() => this.response()?.page ?? 1);
  readonly totalPages = computed(() => this.response()?.totalPages ?? 0);
  readonly canGoBack = computed(() => this.currentPage() > 1);
  readonly canGoForward = computed(() => this.currentPage() < this.totalPages());

  readonly form = this.formBuilder.group(
    {
      name: ['', [Validators.required, Validators.maxLength(160)]],
      phone: ['', [Validators.maxLength(40)]],
      email: ['', [Validators.email, Validators.maxLength(254)]],
      contactChannel: ['', [Validators.maxLength(120)]],
    },
    { validators: atLeastOneContactValidator },
  );

  ngOnInit(): void {
    this.loadResponsibles(1);
  }

  searchResponsibles(): void {
    this.loadResponsibles(1);
  }

  clearSearch(): void {
    this.search.set('');
    this.loadResponsibles(1);
  }

  previousPage(): void {
    if (this.canGoBack()) {
      this.loadResponsibles(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.canGoForward()) {
      this.loadResponsibles(this.currentPage() + 1);
    }
  }

  editResponsible(responsible: Responsible): void {
    this.editingResponsible.set(responsible);
    this.feedbackMessage.set(null);
    this.form.reset({
      contactChannel: responsible.contactChannel ?? '',
      email: responsible.email ?? '',
      name: responsible.name,
      phone: responsible.phone ?? '',
    });
  }

  cancelEdit(): void {
    this.editingResponsible.set(null);
    this.form.reset({
      contactChannel: '',
      email: '',
      name: '',
      phone: '',
    });
  }

  submitForm(): void {
    this.form.markAllAsTouched();
    this.errorMessage.set(null);
    this.feedbackMessage.set(null);

    if (this.form.invalid || this.isSaving()) {
      return;
    }

    const payload = this.getPayload();
    const editing = this.editingResponsible();
    const request = editing
      ? this.api.update(editing.id, payload)
      : this.api.create(payload);

    this.isSaving.set(true);
    request
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.feedbackMessage.set(editing ? 'Responsavel atualizado.' : 'Responsavel criado.');
          this.cancelEdit();
          this.loadResponsibles(this.currentPage());
        },
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  toggleActive(responsible: Responsible): void {
    const action = responsible.active ? 'inativar' : 'ativar';
    const confirmed = window.confirm(`Confirmar ${action} ${responsible.name}?`);

    if (!confirmed || this.isSaving()) {
      return;
    }

    this.errorMessage.set(null);
    this.feedbackMessage.set(null);
    this.isSaving.set(true);
    this.api
      .setActive(responsible.id, !responsible.active)
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.feedbackMessage.set(
            responsible.active ? 'Responsavel inativado.' : 'Responsavel ativado.',
          );
          this.loadResponsibles(this.currentPage());
        },
        error: (error: unknown) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  hasContactError(): boolean {
    return (
      this.form.hasError('contactRequired') &&
      (this.form.dirty || this.form.touched)
    );
  }

  private loadResponsibles(page: number): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);
    this.api
      .list({
        page,
        pageSize: this.pageSize,
        search: this.search(),
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

  private getPayload(): ResponsiblePayload {
    const value = this.form.getRawValue();

    return {
      contactChannel: this.normalizeOptional(value.contactChannel),
      email: this.normalizeOptional(value.email),
      name: value.name?.trim() ?? '',
      phone: this.normalizeOptional(value.phone),
    };
  }

  private normalizeOptional(value: string | null): string | null {
    const normalized = value?.trim() ?? '';
    return normalized === '' ? null : normalized;
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
