declare module 'swagger-ui-dist/swagger-ui-es-bundle' {
  type SwaggerUIConfig = {
    domNode?: Element | null;
    url?: string;
    spec?: Record<string, unknown>;
    deepLinking?: boolean;
    displayRequestDuration?: boolean;
    docExpansion?: 'list' | 'full' | 'none';
    defaultModelsExpandDepth?: number;
    filter?: boolean;
    [key: string]: unknown;
  };

  type SwaggerUIInstance = {
    destroy?: () => void;
  };

  const SwaggerUIBundle: (config: SwaggerUIConfig) => SwaggerUIInstance;

  export default SwaggerUIBundle;
}
