let smooth = false;

const actions = [
  {
    name: 'Fill: false (default)',
    handler: (chart) => {
      chart.data.datasets.forEach(dataset => {
        dataset.fill = false;
      });
      chart.update();
    }
  },
  {
    name: 'Fill: origin',
    handler: (chart) => {
      chart.data.datasets.forEach(dataset => {
        dataset.fill = 'origin';
      });
      chart.update();
    }
  },
  {
    name: 'Fill: start',
    handler: (chart) => {
      chart.data.datasets.forEach(dataset => {
        dataset.fill = 'start';
      });
      chart.update();
    }
  },
  {
    name: 'Fill: end',
    handler: (chart) => {
      chart.data.datasets.forEach(dataset => {
        dataset.fill = 'end';
      });
      chart.update();
    }
  },
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data = generateData();
      });
      chart.update();
    }
  },
  {
    name: 'Smooth',
    handler(chart) {
      smooth = !smooth;
      chart.options.elements.line.tension = smooth ? 0.4 : 0;
      chart.update();
    }
  }
];