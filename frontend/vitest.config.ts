import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/__tests__/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: [
                'src/state/callMachine.ts',
                'src/hooks/useCallOrchestrator.ts'
            ],
            exclude: [
                'node_modules/',
                'src/__tests__/',
                'src/components/**' // Skip UI components
            ],
            // File-level targets
            thresholds: {
                'src/state/callMachine.ts': {
                    statements: 90,
                    branches: 90,
                    functions: 90,
                    lines: 90
                },
                'src/hooks/useCallOrchestrator.ts': {
                    statements: 70,
                    branches: 70,
                    functions: 70,
                    lines: 70
                }
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
});
