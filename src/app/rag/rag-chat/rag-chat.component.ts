import { Component, inject, signal } from '@angular/core';
import { RagService, RagResponse } from '../rag.service';
import { marked } from 'marked';
import { ChartComponent } from '../chart/chart.component';
import { TitleCasePipe, CommonModule } from '@angular/common'; // CommonModule para @if y @for

@Component({
  selector: 'app-rag-chat',
  imports: [ChartComponent, TitleCasePipe, CommonModule],
  templateUrl: './rag-chat.component.html',
  styleUrls: ['./rag-chat.component.css']
})
export default class RagChatComponent {
  query = signal('');

  response = signal<RagResponse | RagResponse[] | null>(null);

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
  protected readonly Array = Array;

  onSubmit(input: HTMLInputElement) {
    this.loading.set(true);
    this.error.set(null);
    this.response.set(null);
    const userQuery = input.value.trim();

    if (!userQuery) {
      this.loading.set(false);
      this.error.set("Error! Please don't submit an empty query");
      setTimeout(() => { this.error.set(null); }, 2000);
      return;
    }
    
    this.query.set(userQuery);

    if (this.selectedModel() === 'compare') {
      this.ragService.getMultipleResponses(userQuery).subscribe({
       next: async (responses: RagResponse[]) => {
      
      let maxValue = 0;

      for (const res of responses) {
        res.texto = await marked.parse(res.texto);
        if (res.grafico_data?.data?.datasets) {
          for (const dataset of res.grafico_data.data.datasets) {
            const dataArray = (dataset.data as number[]).filter(d => typeof d === 'number');
            if (dataArray.length > 0) {
              const maxInData = Math.max(...dataArray);
              if (maxInData > maxValue) {
                maxValue = maxInData;
              }
            }
          }
        }
      }

      const suggestedMax = maxValue * 1.1; 
      for (const res of responses) {
        if (res.grafico_data) {
          res.grafico_data.options = res.grafico_data.options || { responsive: true, maintainAspectRatio: false };
          res.grafico_data.options.scales = res.grafico_data.options.scales || {};
          if (!res.grafico_data.options.scales['y']) {
            res.grafico_data.options.scales['y'] = {};
          }
          const yAxisOptions = res.grafico_data.options.scales['y'] as any;

          yAxisOptions.max = suggestedMax;
          yAxisOptions.beginAtZero = true;
          yAxisOptions.ticks = { stepSize: Math.max(1, Math.ceil(suggestedMax / 10)) }; // Usamos suggestedMax
        }
      }
      
      this.response.set(responses); 
      this.loading.set(false);
      input.value = '';
    },
        error: err => {
          this.loading.set(false);
          this.error.set(err.message);
        }
      });
    } else {
      this.ragService.getResponse(userQuery, this.selectedModel()).subscribe({
        next: async (res: RagResponse) => {
          res.texto = await marked.parse(res.texto);
          this.response.set(res);
          this.loading.set(false);
          input.value = '';
        },
        error: err => {
          this.loading.set(false);
          this.error.set(err.message);
        }
      });
    }
  }
}