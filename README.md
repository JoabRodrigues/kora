# Kora

Player IPTV web em React, Vite e TypeScript, com suporte a portais no formato Xtream Codes.

## Requisitos

- Node.js 20+
- npm

## Rodar localmente

```bash
npm install
npm run dev
```

## Build de producao

```bash
npm run build
npm run preview
```

## Funcionalidades atuais

- onboarding para criar o primeiro perfil
- perfis salvos com nome, URL, usuario e senha
- teste de conexao antes de salvar
- conexao automatica quando ja existe perfil salvo
- modos `Ao vivo`, `Filmes` e `Series`
- categorias, busca e navegacao lateral compacta
- favoritos, recentes e `Continuar assistindo`
- episodios por serie
- EPG/programacao para canais ao vivo
- player HLS com `hls.js` e fallback quando possivel
- persistencia local em `IndexedDB`, com fallback e migracao de `localStorage`

## Persistencia local

Os dados do usuario ficam salvos no navegador em banco local `IndexedDB`.

Hoje o app persiste:

- credenciais do perfil ativo
- perfis salvos
- favoritos
- recentes
- progresso de `Continuar assistindo`

Observacao:

- isso melhora persistencia local, mas nao equivale a criptografia
- as credenciais ainda ficam armazenadas no dispositivo do usuario

## Arquitetura

A feature principal foi organizada por camadas em `src/features/iptv`:

```text
src/features/iptv/
  application/
    hooks/
  domain/
    services/
    constants.ts
    types.ts
    utils.ts
  infrastructure/
    api.ts
    storage.ts
  presentation/
    assets/
    components/
```

### Responsabilidades

- `domain/`: regras puras, contratos, tipos, constantes e funcoes sem dependencias de UI
- `application/`: hooks de orquestracao e fluxo da feature
- `infrastructure/`: acesso a API Xtream e persistencia local
- `presentation/`: componentes React e assets visuais

## Fluxo de perfis

- sem perfis salvos, o app abre direto na tela de criacao do primeiro perfil
- `Testar conexao` apenas valida as credenciais
- `Salvar perfil` grava o perfil e conecta automaticamente
- com perfil salvo, o app tenta reconectar automaticamente ao abrir

## Limitacoes atuais

- depende de provedores compatíveis com fluxo Xtream
- alguns provedores bloqueiam navegador por CORS, token, user-agent ou protecao anti-hotlink
- credenciais ainda sao mantidas localmente no browser
- o bundle ainda esta grande por causa do player e da base atual

## Proximos passos sugeridos

- criptografar dados locais com senha mestra
- criar backend/proxy para provedores com bloqueio de browser
- adicionar `index.ts` por camada para padronizar imports
- otimizar bundle e dividir chunks
