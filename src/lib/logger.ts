// Small logger wrapper: only prints logs in non-production environments
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
