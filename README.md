# Kora

Base inicial de player IPTV web em React + Vite + TypeScript.

## Rodar

```bash
npm install
npm run dev
```

## O que ja vem pronto

- login com `URL`, `usuario` e `senha`
- leitura da API `player_api.php` no estilo Xtream Codes
- carregamento de categorias e canais ao vivo
- player HLS no navegador com fallback para stream `.ts`
- busca de canais e filtro por categoria

## Observacoes

- muitos provedores IPTV bloqueiam browser por CORS, token, user-agent ou protecao anti-hotlink
- esta base cobre o caso mais comum de portal Xtream simples, sem backend intermediario
