import { HttpClient } from "@angular/common/http";
import { effect, inject, Injectable, signal } from "@angular/core";
import { catchError, delay, map, tap, throwError } from "rxjs";
import { ChartData } from './chart/chart.component';

const loadFromLocalStorage = () => {
  const responsesFromLocalStorage = localStorage.getItem('query') ?? '{}'
  const response = JSON.parse(responsesFromLocalStorage)
  return response
}

const mapModelName = (model: string) => {
  switch (model) {
    case 'gemini':
      return 'gemini-2.5-flash';
    case 'gpt':
      return 'openai/gpt-oss-120b';
    case 'llama':
      return 'meta-llama/llama-4-maverick-17b-128e-instruct';
    case 'kimi':
      return 'moonshotai/kimi-k2-instruct';
    default:
      return 'gemini-2.5-flash';
  }
}

export interface ApiResponse {
  texto: string;
  grafico_data?: any;
  modelo?: string;
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

getResponse(query: string, model: string = 'gemini') {
  return this.http.post<ApiResponse>('http://localhost:8000/consulta/', { pregunta: query, llm_name: mapModelName(model) }).pipe(
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
    map((res) => res.texto),
    catchError(error => {
          console.log(error.error.message);
          return throwError(() => new Error('Error al obtener la respuesta del servidor'));
        })
  );
}

getMultipleResponses(query: string) {
  return this.http.post<ApiResponse[]>('http://localhost:8000/comparar/', { pregunta: query }).pipe(
    delay(1000),
    tap((res) => {
      for (let entry of res) {
        this.responseHistory.update(history => ({ ...history, [query.toLowerCase() + ' - ' + entry.modelo]: entry.texto }));
      }
    }),
    // map((res) => res.texto),
    catchError(error => {
          console.log(error.error.message);
          return throwError(() => new Error('Error al obtener la respuesta del servidor'));
        })
  );
}

  getHistoryResponses() {
    return this.responseHistory();
  }
}