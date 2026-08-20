import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// Plugin ultra-agressivo para garantir compatibilidade 100% com Android WebView file:/// sem type="module" e com caminhos estritamente relativos
const iifeHtmlTransformPlugin = () => {
  return {
    name: 'iife-html-transform-plugin',
    enforce: 'post' as const,
    apply: 'build' as const,
    transformIndexHtml(html: string) {
      return html
        // 1. Remove completamente tags <link rel="modulepreload"> (bloqueadas no protocolo file://)
        .replace(/<link\s+rel=["']modulepreload["'][^>]*>\s*/gi, '')
        // 2. Remove qualquer atributo type="module" ou type='module' de todas as tags <script> e injeta defer
        .replace(/(<script\b[^>]*?)\s+type=["']module["']/gi, '$1 defer')
        // 3. Remove atributos crossorigin de scripts e links (evita bloqueios de CORS no WebView Android em file://)
        .replace(/(<script\b[^>]*?)\s+crossorigin(?:=["'][^"']*["'])?/gi, '$1')
        .replace(/(<link\b[^>]*?)\s+crossorigin(?:=["'][^"']*["'])?/gi, '$1')
        // 4. Converte agressivamente qualquer caminho absoluto src="/..." para relativo "./..."
        .replace(/src=["']\/(?!\/)([^"']+)["']/gi, 'src="./$1"')
        // 5. Converte agressivamente qualquer caminho absoluto href="/..." para relativo "./..."
        .replace(/href=["']\/(?!\/)([^"']+)["']/gi, 'href="./$1"')
        // 6. Limpeza de atributos defer duplicados ou espaçamentos residuais
        .replace(/<script\s+defer\s+defer/gi, '<script defer')
        .replace(/<script\s+defer\s+src=/gi, '<script defer src=');
    },
  };
};

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), iifeHtmlTransformPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          format: 'iife' as const,
          inlineDynamicImports: true,
          entryFileNames: 'assets/[name].js',
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

