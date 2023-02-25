declare namespace NodeJS {
  /** Merge declaration with `process` in order to override the global-scoped env. */
  export interface ProcessEnv {
    /**
     * Built-in environment variable.
     * @see Docs https://github.com/chihab/ngx-env#ng_app_env.
     */
    readonly NG_APP_ENV: string;

    // Add your environment variables below
    NG_APP_API_KEY: string;
    NG_APP_SEASON: string;
    NG_APP_SEASON_START: string;
    NG_APP_SEASON_END: string;
  }
}
