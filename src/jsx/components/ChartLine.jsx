import React, { useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

// https://www.highcharts.com/
import Highcharts from 'highcharts';
import highchartsAccessibility from 'highcharts/modules/accessibility';
import highchartsExporting from 'highcharts/modules/exporting';
import highchartsExportData from 'highcharts/modules/export-data';

// https://www.npmjs.com/package/react-is-visible
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';

import roundNr from '../helpers/RoundNr.js';

highchartsAccessibility(Highcharts);
highchartsExporting(Highcharts);
highchartsExportData(Highcharts);

Highcharts.setOptions({
  lang: {
    decimalPoint: '.',
    downloadCSV: 'Download CSV data',
    thousandsSep: ','
  }
});
Highcharts.SVGRenderer.prototype.symbols.download = (x, y, w, h) => {
  const path = [
    // Arrow stem
    'M', x + w * 0.5, y,
    'L', x + w * 0.5, y + h * 0.7,
    // Arrow head
    'M', x + w * 0.3, y + h * 0.5,
    'L', x + w * 0.5, y + h * 0.7,
    'L', x + w * 0.7, y + h * 0.5,
    // Box
    'M', x, y + h * 0.9,
    'L', x, y + h,
    'L', x + w, y + h,
    'L', x + w, y + h * 0.9
  ];
  return path;
};

function LineChart({
  allow_decimals, data, idx, line_width, show_first_label, source, subtitle, suffix, title
}) {
  const chartRef = useRef();
  const isVisible = useIsVisible(chartRef, { once: true });

  const dummy_data = {
    data: [{ name: '2019', y: null }, { name: '2020', y: null }, { name: '2021', y: null }, { name: '2022', y: null }],
    labels: ['2019', '2020', '2021', '2022'],
    name: 'Dummy data',
    showInLegend: false,
    xAxis: 1
  };
  data[2] = dummy_data;

  const chartHeight = 700;
  const createChart = useCallback(() => {
    Highcharts.chart(`chartIdx${idx}`, {
      caption: {
        align: 'left',
        margin: 15,
        style: {
          color: 'rgba(0, 0, 0, 0.8)',
          fontFamily: 'Roboto',
          fontSize: '14px'
        },
        text: `<em>Source:</em> ${source} <br /><em>Note:</em> <span>Annual growth refers to the last four quarters. Figures for Q3 2022 are preliminary. Q4 2022 is a <a href="https://unctadstat.unctad.org/en/Nowcasts.html">nowcast</a>.</span>`,
        verticalAlign: 'bottom',
        useHTML: true,
        x: 0
      },
      chart: {
        events: {
          load() {
            // eslint-disable-next-line react/no-this-in-sfc
            this.renderer.image('https://unctad.org/sites/default/files/2022-11/unctad_logo.svg', 20, 15, 80, 100).add();
            // setTimeout(() => {
            //   // eslint-disable-next-line react/no-this-in-sfc
            //   this.series.forEach((series) => {
            //     if (series.name !== 'Dummy data') {
            //       series.points[series.points.length - 1].update({
            //         dataLabels: {
            //           enabled: true,
            //           y: series.points[series.points.length - 1].options.dataLabels.y
            //         }
            //       });
            //       series.points[0].update({
            //         dataLabels: {
            //           enabled: true,
            //           y: series.points[0].options.dataLabels.y
            //         }
            //       });
            //     }
            //   });
            // }, 2800);
          }
        },
        marginLeft: 70,
        height: chartHeight,
        resetZoomButton: {
          theme: {
            fill: '#fff',
            r: 0,
            states: {
              hover: {
                fill: '#0077b8',
                stroke: 'transparent',
                style: {
                  color: '#fff',
                  fontFamily: 'Roboto',
                }
              }
            },
            stroke: '#7c7067',
            style: {
              fontFamily: 'Roboto',
              fontSize: '13px',
              fontWeight: 400
            }
          }
        },
        style: {
          color: 'rgba(0, 0, 0, 0.8)',
          fontFamily: 'Roboto',
          fontWeight: 400
        },
        type: 'line',
        zoomType: 'x'
      },
      colors: ['#72bf44', '#009edb'],
      credits: {
        enabled: false
      },
      exporting: {
        enabled: true,
        buttons: {
          contextButton: {
            menuItems: ['viewFullscreen', 'separator', 'downloadPNG', 'downloadPDF', 'separator', 'downloadCSV'],
            symbol: 'download',
            symbolFill: '#000'
          }
        }
      },
      legend: {
        align: 'right',
        enabled: (data.length > 1),
        itemDistance: 20,
        itemStyle: {
          color: '#000',
          cursor: 'default',
          fontFamily: 'Roboto',
          fontSize: '14px',
          fontWeight: 400
        },
        layout: 'horizontal',
        verticalAlign: 'top'
      },
      plotOptions: {
        line: {
          animation: {
            duration: 3000,
          },
          cursor: 'pointer',
          dataLabels: {
            allowOverlap: true,
            enabled: false,
            formatter() {
              // eslint-disable-next-line react/no-this-in-sfc
              return `<span style="color: ${this.color}">${roundNr(this.y, 0).toLocaleString('en-US')}${suffix}</div>`;
            },
            style: {
              color: 'rgba(0, 0, 0, 0.8)',
              fontFamily: 'Roboto',
              fontSize: '18px',
              fontWeight: 400,
              textOutline: '2px solid #fff'
            }
          },
          events: {
            legendItemClick() {
              return false;
            },
            mouseOver() {
              return false;
            }
          },
          selected: true,
          lineWidth: line_width,
          marker: {
            enabled: false,
            radius: 0,
            states: {
              hover: {
                animation: false,
                enabled: false,
                radius: 8
              }
            },
            symbol: 'circle'
          },
          states: {
            hover: {
              halo: {
                size: 0
              },
              enabled: false,
              lineWidth: line_width,
            }
          }
        }
      },
      responsive: {
        rules: [{
          chartOptions: {
            title: {
              margin: 40
            }
          },
          condition: {
            maxWidth: 630
          }
        }, {
          chartOptions: {
            chart: {
              height: 700
            },
            legend: {
              layout: 'horizontal'
            },
            title: {
              margin: 40,
              style: {
                fontSize: '26px',
                lineHeight: '30px'
              }
            },
            yAxis: [{
              title: {
                text: null
              }
            }, {
              title: {
                text: null
              }
            }]
          },
          condition: {
            maxWidth: 500
          }
        }, {
          chartOptions: {
            chart: {
              height: 800
            }
          },
          condition: {
            maxWidth: 400
          }
        }]
      },
      series: data,
      subtitle: {
        align: 'left',
        enabled: true,
        style: {
          color: 'rgba(0, 0, 0, 0.8)',
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '18px'
        },
        text: subtitle,
        widthAdjust: -100,
        x: 100
      },
      title: {
        align: 'left',
        margin: 40,
        style: {
          color: '#000',
          fontSize: '30px',
          fontWeight: 700,
          lineHeight: '34px'
        },
        text: title,
        widthAdjust: -160,
        x: 100
      },
      tooltip: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderRadius: 0,
        borderWidth: 1,
        crosshairs: true,
        formatter() {
          // eslint-disable-next-line react/no-this-in-sfc
          const values = this.points.filter(point => point.series.name !== '').map(point => [point.series.name.split(' (')[0], point.y, point.color]);
          const rows = [];
          rows.push(values.map(point => `<div><span class="tooltip_label" style="color: ${point[2]}">${(point[0]) ? `${point[0]}: ` : ''}</span><span class="tooltip_value">${roundNr(point[1], 1).toFixed(1).toLocaleString('en-US')}${suffix}</span></div>`).join(''));
          // eslint-disable-next-line react/no-this-in-sfc
          return `<div class="tooltip_container"><h3 class="tooltip_header">${this.x}</h3>${rows}</div>`;
        },
        shadow: false,
        shared: true,
        useHTML: true
      },
      xAxis: [{
        allowDecimals: false,
        crosshair: {
          color: '#ccc',
          width: 1
        },
        categories: data[0].labels,
        labels: {
          allowOverlap: false,
          enabled: true,
          style: {
            color: 'rgba(0, 0, 0, 0.8)',
            fontFamily: 'Roboto',
            fontSize: '14px',
            fontWeight: 400
          },
          formatter: (val) => (val.value).split(' ')[0],
          rotation: 0,
          reserveSpace: true,
          useHTML: false,
          y: 25
        },
        lineColor: '#ccc',
        lineWidth: 1,
        opposite: false,
        tickInterval: 1,
        tickLength: 5,
        tickWidth: 1,
        plotBands: [{
          color: '#eee',
          from: 13.5,
          to: 14.5,
          label: {
            align: 'left',
            rotation: 90,
            style: {
              color: 'rgba(0, 0, 0, 0.8)',
              fontFamily: 'Roboto',
              fontSize: '14px',
              fontWeight: 400
            },
            text: 'Preliminary data',
            verticalAlign: 'middle',
            x: 15,
            y: 80
          }
        }, {
          color: '#eee',
          from: 14.5,
          to: 15.5,
          label: {
            align: 'left',
            rotation: 90,
            style: {
              color: 'rgba(0, 0, 0, 0.8)',
              fontFamily: 'Roboto',
              fontSize: '14px',
              fontWeight: 400
            },
            text: 'Nowcasts data',
            verticalAlign: 'middle',
            x: 15,
            y: 80
          }
        }],
        plotLines: [{
          color: 'rgba(124, 112, 103, 0.2)',
          value: -0.5,
          width: 1
        }, {
          color: 'rgba(124, 112, 103, 0.2)',
          value: 3.5,
          width: 1
        }, {
          color: 'rgba(124, 112, 103, 0.2)',
          value: 7.5,
          width: 1
        }, {
          color: 'rgba(124, 112, 103, 0.2)',
          value: 11.5,
          width: 1
        }, {
          color: 'rgba(124, 112, 103, 0.2)',
          value: 15.5,
          width: 1
        }, {
          color: 'rgba(124, 112, 103, 0.2)',
          value: 19.5,
          width: 1
        }],
        title: {
          text: null
        },
        type: 'category'
      }, {
        categories: ['2019', '2020', '2021', '2022'],
        labels: {
          allowOverlap: false,
          enabled: true,
          style: {
            color: 'rgba(0, 0, 0, 0.8)',
            fontFamily: 'Roboto',
            fontSize: '14px',
            fontWeight: 600
          },
          rotation: 0,
          reserveSpace: true,
          y: 5,
          useHTML: false
        },
        lineColor: '#ccc',
        lineWidth: 0,
        type: 'category'
      }],
      yAxis: {
        allowDecimals: allow_decimals,
        gridLineColor: 'rgba(124, 112, 103, 0.2)',
        gridLineDashStyle: 'shortdot',
        gridLineWidth: 1,
        labels: {
          format: '{text}%',
          reserveSpace: true,
          style: {
            color: '#000',
            fontFamily: 'Roboto',
            fontSize: '16px',
            fontWeight: 400
          }
        },
        lineColor: 'transparent',
        lineWidth: 0,
        max: 30,
        min: -20,
        plotLines: [{
          color: 'rgba(124, 112, 103, 0.6)',
          value: 0,
          width: 1
        }],
        opposite: false,
        showFirstLabel: show_first_label,
        showLastLabel: true,
        title: {
          text: null
        },
        type: 'linear'
      }
    });
    chartRef.current.querySelector(`#chartIdx${idx}`).style.opacity = 1;
  }, [allow_decimals, data, idx, line_width, show_first_label, source, subtitle, suffix, title]);

  useEffect(() => {
    if (isVisible === true) {
      setTimeout(() => {
        createChart();
      }, 300);
    }
  }, [createChart, isVisible]);

  return (
    <div className="chart_container">
      <div ref={chartRef}>
        {(isVisible) && (<div className="chart" id={`chartIdx${idx}`} />)}
      </div>
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

LineChart.propTypes = {
  allow_decimals: PropTypes.bool,
  data: PropTypes.instanceOf(Array).isRequired,
  idx: PropTypes.string.isRequired,
  line_width: PropTypes.number,
  show_first_label: PropTypes.bool,
  source: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  suffix: PropTypes.string,
  title: PropTypes.string.isRequired,
};

LineChart.defaultProps = {
  allow_decimals: true,
  line_width: 5,
  show_first_label: true,
  subtitle: false,
  suffix: '',
};

export default LineChart;
