import { HttpClient } from "@angular/common/http";
import { effect, inject, Injectable, signal } from "@angular/core";
import { catchError, map, Observable, throwError } from "rxjs";
import { ChartData } from './chart/chart.component';

export interface RagResponse {
  texto: string;
  grafico_data: ChartData | null;
  modelo?: string; 
}

export interface ApiResponse {
  texto: string;
  grafico_data?: any;
  modelo?: string;
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
};

@Injectable({ providedIn: 'root' })
export class RagService {
  private http = inject(HttpClient);


  responseHistory = signal<Record<string, string>>({});

  saveResponsesToLocalStorage = effect(() => {
    const historyString = JSON.stringify(this.responseHistory())
    localStorage.setItem('query', historyString)
  });

  getResponse(query: string, model: string = 'gemini'): Observable<RagResponse> {
    const llm_name = mapModelName(model);
    return this.http.post<ApiResponse>('http://localhost:8000/consulta/', { pregunta: query, llm_name }).pipe(
      map(res => this.transformApiResponse(res, query, model)), // Usamos el método helper
      catchError(this.handleError)
    );
  }


  getMultipleResponses(query: string): Observable<RagResponse[]> {
    return this.http.post<ApiResponse[]>('http://localhost:8000/comparar/', { pregunta: query }).pipe(
      map(responses => responses.map(res => this.transformApiResponse(res, query, res.modelo!))),
      catchError(this.handleError)
    );
  }

  private transformApiResponse(res: ApiResponse, query: string, model: string): RagResponse {
    this.responseHistory.update(history => ({ ...history, [query.toLowerCase() + ' - ' + model]: res.texto }));

    let chartData: ChartData | null = null;
    if (res.grafico_data) {
      chartData = {
        type: res.grafico_data.type,
        data: {
          labels: res.grafico_data.labels,
          datasets: res.grafico_data.datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
          plugins: { legend: { display: res.grafico_data.datasets.length > 1 } }
        }
      };
    }

    return {
      texto: res.texto,
      grafico_data: chartData,
      modelo: model
    };
  }

  private handleError(error: any) {
    console.error("Error en RagService:", error);
    return throwError(() => new Error(error.error?.detail || 'Error al obtener la respuesta del servidor'));
  }

  getHistoryResponses() {
    return this.responseHistory();
  }
}