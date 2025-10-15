import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-rag-dashboard',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './rag-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RagDashboardComponent { }
