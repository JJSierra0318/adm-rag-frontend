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
  response = signal<string | string[][] | null>(null);
  loading = signal(false);
  error = signal<null | string>(null);
  ragService = inject(RagService);
  selectedModel = signal<string>('gemini');

  models = new Map<string, string>([
    ['gemini-2.5-flash', 'gemini'],
    ['openai/gpt-oss-120b', 'gpt'],
    ['meta-llama/llama-4-maverick-17b-128e-instruct', 'llama'],
    ['moonshotai/kimi-k2-instruct', 'kimi'],
  ]);

  onSubmit(input: HTMLInputElement) {
    console.log(this.selectedModel());
    

    this.loading.set(true);
    if (!input.value.trim()) {
      this.loading.set(false);
      this.error.set("Error! Please don't submit an empty query");
      setTimeout(() => {
        this.error.set(null);
      }, 2000);
      return;
    }

    if (this.selectedModel() == 'compare') {
      this.ragService.getMultipleResponses(input.value).subscribe({
        next: async res => {
          const html = [];
          for (let respuesta of res) {
            html.push([respuesta.modelo!, await marked.parse(respuesta.texto)]);
          }
          this.response.set(html);
          this.loading.set(false);
          this.query.set(input.value);
        },
      })
    } else {
      this.ragService.getResponse(input.value, this.selectedModel()).subscribe({
        next: async res => {

          const html = await marked.parse(res);
          this.response.set(html);

          this.loading.set(false);
          this.query.set(input.value);
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
}
