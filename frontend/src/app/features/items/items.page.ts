import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-items-page',
  standalone: true,
  templateUrl: './items.page.html',
  styleUrl: './items.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsPage {}
