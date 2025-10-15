import { Component, inject, signal } from '@angular/core';
import { RagService } from '../rag.service';
import { marked } from 'marked';

@Component({
  selector: 'app-rag-chat',
  imports: [],
  templateUrl: './rag-chat.component.html',
})
export default class RagChatComponent {
  query = signal('');
  response = signal<string | null>(null);
  loading = signal(false);
  hasError = signal(false);
  ragService = inject(RagService);

  onSubmit(input: HTMLInputElement) {
    this.loading.set(true);
    if (!input.value.trim()) {
      this.loading.set(false);
      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false);
      }, 2000);
      return;
    }

    this.ragService.getResponse(input.value).subscribe(async res => {

      const html = await marked.parse(res);

      this.loading.set(false);
      this.query.set(input.value);  
      this.response.set(html);

      input.value = '';
      console.log(this.response());
    })
  }
}
