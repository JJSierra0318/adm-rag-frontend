import { Component, ElementRef, Input, OnChanges, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ChartData } from '../chart-parser.service';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  template: `
    <div class="card bg-base-100 shadow-xl mb-4" *ngIf="chartData">
      <div class="card-body">
        <h3 class="card-title">{{chartData.title}}</h3>
        <canvas #chartCanvas></canvas>
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
    console.log('=== CHART COMPONENT ngOnChanges ===');
    console.log('chartData:', this.chartData);
    if (this.chartData && this.chartCanvas) {
      this.createChart();
    }
  }

  ngAfterViewInit() {
    console.log('=== CHART COMPONENT ngAfterViewInit ===');
    console.log('chartData:', this.chartData);
    if (this.chartData) {
      this.createChart();
    }
  }

  private createChart() {
    console.log('=== CREATING CHART ===');
    console.log('chartData:', this.chartData);
    
    if (this.chart) {
      this.chart.destroy();
    }

    if (!this.chartData) {
      console.log('No chart data available');
      return;
    }

    const config: ChartConfiguration = {
      type: this.chartData.type,
      data: {
        labels: this.chartData.labels,
        datasets: [{
          label: 'Datos',
          data: this.chartData.data,
          backgroundColor: [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
            '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
          ],
          borderColor: '#1F2937',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: this.chartData.type === 'pie' || this.chartData.type === 'doughnut'
          }
        }
      }
    };

    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }
}