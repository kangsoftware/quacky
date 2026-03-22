'use client';

import { useEffect, useRef } from 'react';
import 'swagger-ui-dist/swagger-ui.css';
import styles from './swagger.module.css';

type SwaggerProps = {
    specUrl: string;
    specObject?: Record<string, unknown>;
}

export default function SwaggerViewer({
    specUrl, specObject
}: SwaggerProps) {
    const uiRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let swaggerInstance: { destroy?: () => void } | undefined;

        const init = async () => {
            const mod = await import('swagger-ui-dist/swagger-ui-es-bundle');
            const SwaggerUIBundle = (mod as unknown as { default?: (...args: unknown[]) => { destroy?: () => void } }).default
                ?? (mod as unknown as (...args: unknown[]) => { destroy?: () => void });

            if (!uiRef.current) {
                return;
            }

            swaggerInstance = SwaggerUIBundle({
                domNode: uiRef.current,
                url: specUrl,
                spec: specObject,
                deepLinking: true,
                displayRequestDuration: true,
                docExpansion: 'list',
                defaultModelsExpandDepth: -1,
                filter: true,
            });
        };

        init();

        return () => {
            if (swaggerInstance?.destroy) {
                swaggerInstance.destroy();
            }
        };
    }, [specObject, specUrl]);

    return (
        <div className={styles.container}>
            <section className={styles.header}>
                <h1>Quacky API Docs</h1>
                <p className={styles.lead}>
                    View the APIs for Quacky
                </p>
            </section>

            <div className={styles.viewer}>
                <div ref={uiRef} />
            </div>
        </div>
    )

}
