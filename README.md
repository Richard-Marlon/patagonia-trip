# Patagônia — Diário de Expedição

Roteiro de viagem pela Patagônia em formato de site: um diário de expedição por Chile e Argentina, de Punta Arenas a Ushuaia e volta, com horários, custos por etapa, links de mapa e uma trilha de carimbos para marcar o que já foi cumprido.

## O que tem aqui

- [index.html](index.html) — a página do roteiro (HTML + CSS + JS), com as fotos em [img/](img/) (Wikimedia Commons, licenças livres — créditos no rodapé da página).
- [netlify/functions/](netlify/functions/) — backend serverless (Netlify Functions) que guarda a marcação das 12 etapas num lugar só (Netlify Blobs), compartilhada entre qualquer pessoa que abrir o site, em qualquer aparelho.
- [netlify.toml](netlify.toml) e [package.json](package.json) — configuração do Netlify e a dependência `@netlify/blobs`.

Abrir o `index.html` direto no navegador (sem servidor) ainda funciona para ler o roteiro, mas a marcação de etapas só funciona de verdade rodando com o Netlify (local via `netlify dev`, ou já publicado).

## Etapas cobertas (10 a 21 de janeiro de 2027)

1. Punta Arenas → Puerto Natales
2. Torres del Paine — dia inteiro
3. Torres del Paine → El Calafate
4. Perito Moreno + Glaciarium
5. Nibepo Aike → El Chaltén
6. Laguna de los Tres
7. Dia reserva — Lago del Desierto
8. El Chaltén → Punta Arenas
9. Punta Arenas → Ushuaia (ônibus)
10. Ushuaia — Fim do Mundo
11. Ushuaia → Punta Arenas (ônibus)
12. Punta Arenas — último dia e voo

## Marcação de etapas compartilhada

Qualquer pessoa que abrir o site vê as mesmas marcações, em qualquer aparelho — o estado fica salvo no servidor (Netlify Blobs), não no navegador de cada um. O `localStorage` do navegador é usado só como cópia de reserva, para o site continuar legível se a API cair.

- **Visitante sem senha:** só visualiza. Os carimbos aparecem desabilitados e o site mostra "Somente leitura".
- **Editor (senha `EDITOR_PASSWORD`, opcional):** pode marcar etapas como concluídas, mas não pode desmarcar.
- **Admin / Richard (senha `ADMIN_PASSWORD`):** marca, desmarca e pode usar o botão "Zerar marcações" (com confirmação dupla).

Para entrar, use o link "Entrar para editar" no rodapé do site.

## Configurar no Netlify

O site precisa de três variáveis de ambiente, configuradas no próprio Netlify (nunca no código):

1. No painel do site no Netlify: **Site configuration → Environment variables → Add a variable**, e crie:
   - `ADMIN_PASSWORD` — a senha do Richard.
   - `EDITOR_PASSWORD` — a senha da Jessika (opcional; sem ela, só o login de admin funciona).
   - `SESSION_SECRET` — uma chave aleatória de pelo menos 32 bytes, usada para assinar o token de login. Para gerar uma, rode num terminal:
     ```
     node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
     ```
     ou, com OpenSSL:
     ```
     openssl rand -base64 32
     ```
2. Marque as três variáveis para o contexto de produção (e de deploy previews, se for usar).
3. Publique o site de um jeito que instale as *Functions* e as dependências do `package.json`:
   - **Opção recomendada:** conectar o repositório Git ao Netlify (New site → Import an existing project) — o Netlify roda `npm install` e publica `netlify/functions/` automaticamente a cada push.
   - **Ou via CLI:** `netlify deploy --prod` a partir da pasta do projeto (com `netlify-cli` instalado e logado).
   - **Não funciona:** arrastar a pasta para o Netlify Drop — esse método não instala dependências nem publica Functions.
4. Depois do primeiro deploy, confira em **Functions** no painel do site que `etapas` e `login` aparecem como publicadas.

### Testando localmente

Com o [Netlify CLI](https://docs.netlify.com/cli/get-started/) instalado:

1. Crie um arquivo `.env` na raiz do projeto (ele já está no `.gitignore`, nunca é commitado) com senhas de teste:
   ```
   ADMIN_PASSWORD=sua-senha-de-teste
   EDITOR_PASSWORD=outra-senha-de-teste
   SESSION_SECRET=qualquer-texto-longo-aleatorio-para-teste
   ```
2. Rode `netlify dev` na raiz do projeto — ele sobe o site e as Functions juntos (normalmente em `http://localhost:8888`).
3. Teste os três perfis: sem login (só leitura), com a senha de editor (marca, não desmarca) e com a senha de admin (marca, desmarca e zera). As senhas de teste do `.env` local **não** são usadas em produção — lá valem só as variáveis configuradas no painel do Netlify.

## Créditos

Fotos: Wikimedia Commons — autor, licença e link de cada uma no rodapé da página.
