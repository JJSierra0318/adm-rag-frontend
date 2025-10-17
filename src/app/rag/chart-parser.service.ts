import { Injectable } from '@angular/core';

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  title: string;
  labels: string[];
  data: number[];
}

@Injectable({ providedIn: 'root' })
export class ChartParserService {

  parseResponse(response: string): ChartData | null {
    // Múltiples patrones para mayor compatibilidad
    const patterns = [
      // "Agrocadena de X: Y participantes"
      /Agrocadena de ([\w\s]+?):\s*(\d+(?:\.\d+)?)\s*participantes?/gi,
      // "X: Y" formato simple
      /([\w\s]+?):\s*(\d+(?:\.\d+)?)/g,
      // "X tiene Y" o "X - Y"
      /([\w\s]+?)(?:\s+tiene\s+|\s*-\s*)(\d+(?:\.\d+)?)/gi
    ];
    
    for (const pattern of patterns) {
      const matches = [...response.matchAll(pattern)];
      
      if (matches.length >= 2) {
        const labels = matches.map(m => 
          m[1].trim()
            .replace(/^Agrocadena de\s+/i, '')
            .replace(/\*\*/g, '')
        );
        const data = matches.map(m => parseFloat(m[2]));
        
        return {
          type: data.length <= 4 ? 'doughnut' : 'bar',
          title: 'Datos Detectados',
          labels,
          data
        };
      }
    }
    
    return null;
  }
  
  private determineChartType(labels: string[], data: number[]): 'bar' | 'line' | 'pie' | 'doughnut' {
    // Si hay pocos elementos, usar pie/doughnut
    if (data.length <= 4) return 'doughnut';
    
    // Si los labels sugieren tiempo/secuencia, usar línea
    const timeWords = /\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4}|q[1-4]|trimestre|mes|año|year|month)\b/i;
    if (labels.some(label => timeWords.test(label))) return 'line';
    
    // Por defecto, usar barras
    return 'bar';
  }
}