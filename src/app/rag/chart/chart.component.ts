import { Component, ElementRef, Input, OnChanges, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables, ChartData as ChartJsData, ChartType } from 'chart.js';

Chart.register(...registerables);

export interface ChartData {
  type: ChartType;
  data: ChartJsData;
  options?: ChartConfiguration['options'];
}

@Component({
  selector: 'app-chart',
  standalone: true, 
  template: `
    <div class="card bg-base-100 shadow-xl mb-4" *ngIf="chartData">
      <div class="card-body">
        <div style="position: relative; height: 350px; width: 100%;">
          <canvas #chartCanvas></canvas>
        </div>
      </div>
    </div>
  `,
  imports: [CommonModule]
})
export class ChartComponent implements OnChanges, AfterViewInit {
  @Input() chartData: ChartData | null = null;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | null = null;

  ngOnChanges() {
    if (this.chartData && this.chartCanvas?.nativeElement) {
      this.createOrUpdateChart();
    }
  }

  ngAfterViewInit() {
    if (this.chartData) {
      this.createOrUpdateChart();
    }
  }

  private createOrUpdateChart() {
    if (!this.chartData || !this.chartCanvas?.nativeElement) return;
    
    if (this.chart) {
      this.chart.destroy();
    }

    const config: ChartConfiguration = {
      type: this.chartData.type,
      data: this.chartData.data,
      options: this.chartData.options,
    };

    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }
}