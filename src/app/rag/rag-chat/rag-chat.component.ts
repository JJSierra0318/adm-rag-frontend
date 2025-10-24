import { Component, inject, signal } from '@angular/core';
import { RagService } from '../rag.service';
import { marked } from 'marked';
import { ChartComponent } from '../chart/chart.component';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-rag-chat',
  imports: [ChartComponent, TitleCasePipe],
  templateUrl: './rag-chat.component.html',
})
export default class RagChatComponent {
  query = signal('');
  response = signal<string | null>(null);
  loading = signal(false);
  error = signal<null | string>(null);
  ragService = inject(RagService);
  selectedModel = signal<string>('gemini');

  models = ['gemini', 'gpt', 'llama', 'moonshotai'];

  onSubmit(input: HTMLInputElement) {

    this.loading.set(true);
    if (!input.value.trim()) {
      this.loading.set(false);
      this.error.set("Error! Please don't submit an empty query");
      setTimeout(() => {
        this.error.set(null);
      }, 2000);
      return;
    }

    this.ragService.getResponse(input.value, this.selectedModel()).subscribe({
      next: async res => {

        const html = await marked.parse(res);

        this.loading.set(false);
        this.query.set(input.value);
        this.response.set(html);

        input.value = '';
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.message);
        console.error('Error fetching response:', err);
      }
    })
  }
}
