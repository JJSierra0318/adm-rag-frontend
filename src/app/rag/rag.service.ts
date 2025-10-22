import { HttpClient } from "@angular/common/http";
import { effect, inject, Injectable, signal } from "@angular/core";
import { delay, map, tap } from "rxjs";
import { ChartData } from './chart/chart.component';

const loadFromLocalStorage = () => {
  const responsesFromLocalStorage = localStorage.getItem('query') ?? '{}'
  const response = JSON.parse(responsesFromLocalStorage)
  return response
}

export interface ApiResponse {
  texto: string;
  grafico_data?: any;
}

@Injectable({ providedIn: 'root' })
export class RagService {

  private http = inject(HttpClient);

  response = signal<string>('');
  responseLoading = signal(false);
  chartData = signal<ChartData | null>(null);

  responseHistory = signal<Record<string, string>>(loadFromLocalStorage());

  saveResponsesToLocalStorage = effect(() => {
    const historyString = JSON.stringify(this.responseHistory())
    localStorage.setItem('query', historyString)
  })

getResponse(query: string) {
  return this.http.post<ApiResponse>('http://localhost:8000/consulta/', { pregunta: query }).pipe(
    delay(1000),
    tap((res) => {
      this.responseHistory.update(history => ({ ...history, [query.toLowerCase()]: res.texto }));
      
      if (res.grafico_data) {
        const newChartData: ChartData = {
          type: res.grafico_data.type,
          data: {
            labels: res.grafico_data.labels,
            datasets: res.grafico_data.datasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false, 
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1 }
              }
            },
            plugins: {
              legend: {
                display: res.grafico_data.datasets.length > 1 
              }
            }
          }
        };
        this.chartData.set(newChartData);
      } else {
        this.chartData.set(null);
      }
    }),
    map((res) => res.texto)
  );
}

  getHistoryResponses() {
    return this.responseHistory();
  }

  /* getHistoryGifs(query: string): Gif[] {
    return this.searchHistory()[query] ?? []
  } */
}