# Servidor de Comparativo — Moto App

Função serverless única (`api/comparar-moto.js`) que recebe os dados da sua
moto, chama o Gemini 2.5 Flash com busca no Google (grátis até 500
requisições/dia) e devolve um comparativo com motos similares + dados do
manual do fabricante.

A chave da API do Gemini fica **só aqui**, nunca dentro do app — por isso
esse servidor existe.

## Passo a passo (uns 5 minutos, tudo grátis)

### 1. Pegue sua chave gratuita do Gemini
1. Acesse https://aistudio.google.com/apikey
2. Faça login com sua conta Google
3. Clique em "Create API key"
4. Copie a chave gerada (algo como `AIzaSy...`)

### 2. Crie uma conta na Vercel (grátis)
1. Acesse https://vercel.com/signup
2. Pode entrar com sua conta do GitHub, Google, etc.

### 3. Suba esta pasta pro ar

**Opção mais simples — pelo site, sem instalar nada:**
1. Crie um repositório novo no GitHub e suba esta pasta `Moto-servidor` nele
   (pode usar o próprio site do GitHub, "Add file → Upload files")
2. No painel da Vercel, clique em "Add New → Project"
3. Selecione esse repositório
4. Antes de clicar em "Deploy", abra "Environment Variables" e adicione:
   - Nome: `GEMINI_API_KEY`
   - Valor: a chave que você copiou no passo 1
5. Clique em "Deploy"

Ao terminar, a Vercel te dá uma URL tipo:
```
https://moto-servidor-comparativo.vercel.app
```

Seu endpoint final é essa URL + `/api/comparar-moto`, por exemplo:
```
https://moto-servidor-comparativo.vercel.app/api/comparar-moto
```

### 4. Configure essa URL no app
Abra `src/config/api.ts` no projeto do app e cole a URL ali (instruções
detalhadas nesse arquivo).

## Testando o servidor sozinho (opcional)

Depois de publicado, você pode testar direto no navegador com uma ferramenta
como o site https://reqbin.com, ou pelo terminal:

```bash
curl -X POST https://SEU-PROJETO.vercel.app/api/comparar-moto \
  -H "Content-Type: application/json" \
  -d '{"marca":"Honda","modelo":"CB 500F","ano":2023,"tipoUso":"urbano"}'
```

Se voltar um JSON com `"texto": "..."`, está funcionando.

## Limites e custo

- Gemini 2.5 Flash com busca: **grátis até 500 requisições por dia** (mais que
  suficiente para uso pessoal). Acima disso, cobra por uso — mas você só
  chegaria nesse limite com uso muito intenso.
- Vercel: o plano gratuito ("Hobby") cobre tranquilamente esse tipo de uso
  pessoal, sem custo.
