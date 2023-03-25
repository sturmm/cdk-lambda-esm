import pino from 'pino';

export default pino({ level: 'info', formatters: {
    level: (label) => ({ level: label }),
    bindings: () => ({ }),
  } 
});
