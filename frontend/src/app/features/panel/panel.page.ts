import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-panel-page',
  standalone: true,
  templateUrl: './panel.page.html',
  styleUrl: './panel.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelPage {}
