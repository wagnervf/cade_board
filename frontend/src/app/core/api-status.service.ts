import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiStatusService {
  private readonly pendingRequests = signal(0);
  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = computed(() => this.pendingRequests() > 0);

  startRequest(): void {
    this.pendingRequests.update((value) => value + 1);
  }

  finishRequest(): void {
    this.pendingRequests.update((value) => Math.max(0, value - 1));
  }

  setError(message: string): void {
    this.errorMessage.set(message);
  }

  clearError(): void {
    this.errorMessage.set(null);
  }
}
