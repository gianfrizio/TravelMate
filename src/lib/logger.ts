// Piccolo logger wrapper per debug in sviluppo
// In produzione, non fa nulla
const isDev = process.env.NODE_ENV !== 'production';

const debug = (...args: any[]) => {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.debug(...args);
  }
};

const info = (...args: any[]) => {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.info(...args);
  }
};

const warn = (...args: any[]) => {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
};

const error = (...args: any[]) => {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
};

export default {
  debug,
  info,
  warn,
  error,
};
