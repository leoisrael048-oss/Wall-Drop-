# Regras Permanentes do Projeto Wall Drop

Siga rigorosamente estas regras em TODAS as implementações futuras:

## Regras Técnicas Obrigatórias (Android WebView - file://)
1. **Caminhos Relativos**: NUNCA use caminhos absolutos (iniciando com `/`) em nenhum HTML, CSS, JS ou referência de asset/arquivo. Use sempre caminhos relativos (iniciando com `./`).
2. **Bundle IIFE (Sem type="module")**: NUNCA gere ou permita que o build use `<script type="module">`. O `vite.config.ts` DEVE manter `build.rollupOptions.output` com `format: 'iife'`, `inlineDynamicImports: true` e `entryFileNames: 'assets/[name].js'`.
3. **Base Relativa**: Mantenha sempre `base: './'` no `vite.config.ts`.
4. **Proteção do Service Worker**: Qualquer registro de Service Worker DEVE continuar protegido com a checagem `window.location.protocol !== 'file:'`.
5. **Critério de Validação Mental**: Antes de concluir qualquer tarefa, certifique-se de que funcionará quando carregado via `file:///android_asset/www/index.html` em um WebView Android.

## Regras de Processo e Conteúdo
6. **Código Completo**: Apresente sempre o código completo e final dos arquivos alterados, sem omissões, trechos resumidos ou comentários "TODO".
7. **Checklist de Validação WebView**: Ao final de cada implementação, apresente o checklist confirmando que as regras técnicas 1 a 5 permanecem respeitadas.
8. **Lista de Arquivos Alterados**: Liste sempre `ARQUIVOS ALTERADOS:` com o caminho completo de cada um.
9. **Conteúdo 100% Original**: Não use nomes de pessoas reais, marcas registradas ou conteúdo protegido por direitos autorais.
