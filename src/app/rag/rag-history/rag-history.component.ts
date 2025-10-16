import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RagService } from '../rag.service';
import { marked } from 'marked';

@Component({
  selector: 'app-rag-history',
  imports: [],
  templateUrl: './rag-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RagHistoryComponent {
  ragService = inject(RagService);
  entries = Object.entries(this.ragService.getHistoryResponses()).map(
    ([key, value]) => [key, marked.parse(value)]
  );
}
