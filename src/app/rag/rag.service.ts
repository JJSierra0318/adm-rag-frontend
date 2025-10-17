import { HttpClient } from "@angular/common/http";
import { effect, inject, Injectable, signal } from "@angular/core";
import { delay, map, tap } from "rxjs";
import { ChartParserService, ChartData } from './chart-parser.service';

const loadFromLocalStorage = () => {
  const responsesFromLocalStorage = localStorage.getItem('query') ?? '{}'
  const response = JSON.parse(responsesFromLocalStorage)
  return response
}

@Injectable({ providedIn: 'root' })
export class RagService {

  private http = inject(HttpClient);

  response = signal<string>('');
  responseLoading = signal(false);
  chartData = signal<ChartData | null>(null);
  
  private chartParser = inject(ChartParserService);

  responseHistory = signal<Record<string, string>>(loadFromLocalStorage());

  saveResponsesToLocalStorage = effect(() => {
    const historyString = JSON.stringify(this.responseHistory())
    localStorage.setItem('query', historyString)
  })

  getResponse(query: string) {
    return this.http.post<any>(`/api/consulta/`, {pregunta: query}).pipe(
      delay(2000),
      map((res) => res.respuesta),
      tap((res) => {
        this.responseHistory.update(history => ({ ...history, [query.toLowerCase()]: res }));
        const parsedChart = this.chartParser.parseResponse(res);
        this.chartData.set(parsedChart);
      })
    )
  }

  getHistoryResponses() {
    return this.responseHistory();
  }

  /* getHistoryGifs(query: string): Gif[] {
    return this.searchHistory()[query] ?? []
  } */
}