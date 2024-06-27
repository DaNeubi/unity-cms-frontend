/* eslint-disable */

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
    BACKEND_SERVER: string | undefined;
    WS_SERVER: string | undefined;
    WS_PORT: string | undefined;
    WSS_PORT: string | undefined;
    WS_KEY: string | undefined;
    WS_ID: string | undefined;
    WS_SECRET: string | undefined;
    ACAO: string | undefined;
    SENTRY_DSN: string | undefined;
    BUILD_VERSION: string | undefined;
  }
}
