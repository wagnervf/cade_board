import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-responsibles-page',
  standalone: true,
  templateUrl: './responsibles.page.html',
  styleUrl: './responsibles.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponsiblesPage {}
