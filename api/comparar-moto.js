/**
 * Endpoint: POST /api/comparar-moto
 * Body: { marca, modelo, ano, tipoUso, cilindrada? }
 *
 * Usa o Gemini 2.5 Flash com "Grounding com Google Search" (gratuito até
 * 500 requisições/dia) para pesquisar na web motos da mesma categoria/ano
 * e montar um comparativo, além de estimativas do manual do fabricante.
 *
 * A chave da API NUNCA fica no app — só aqui no servidor, como variável
 * de ambiente (GEMINI_API_KEY), configurada no painel da Vercel.
 */

export default async function handler(req, res) {
  // CORS básico, para o app React Native poder chamar este endpoint
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Use POST." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ erro: "GEMINI_API_KEY não configurada no servidor." });
  }

  const { marca, modelo, ano, tipoUso, cilindrada } = req.body ?? {};

  if (!marca || !modelo || !ano) {
    return res.status(400).json({ erro: "Informe ao menos marca, modelo e ano." });
  }

  const prompt = `
Você é um assistente especializado em motocicletas no mercado brasileiro.

Pesquise na web informações atuais e confiáveis sobre a moto:
- Marca: ${marca}
- Modelo: ${modelo}
- Ano: ${ano}
${cilindrada ? `- Cilindrada aproximada: ${cilindrada}` : ""}
- Uso declarado pelo dono: ${tipoUso}

Responda em português do Brasil, em texto simples organizado EXATAMENTE nestas
seções, cada uma iniciada pela tag entre colchetes (sem markdown, sem asteriscos):

[RESUMO]
Um parágrafo curto resumindo a posição dessa moto no mercado (categoria, público-alvo).

[COMPARATIVO]
Liste de 2 a 4 motos concorrentes diretas (mesma cilindrada/categoria e ano
aproximado), uma por linha, no formato:
Nome da moto — principal diferença ou vantagem/desvantagem em relação à moto do usuário.

[MANUTENCAO]
Com base no manual do fabricante ou fontes confiáveis, informe (quando encontrar):
- Intervalo de troca de óleo recomendado (km)
- Intervalo de revisão geral (km)
- Ponto de atenção conhecido desse modelo (problema recorrente, se houver)

[FONTES]
Liste as URLs das fontes que você usou, uma por linha. Se não tiver certeza
da fonte exata, não invente URL.

Se não encontrar informação suficiente sobre o modelo exato, diga isso
claramente na seção [RESUMO] em vez de inventar dados.
`.trim();

  try {
    const resposta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
        }),
      }
    );

    if (!resposta.ok) {
      const erroTexto = await resposta.text();
      console.error("Erro Gemini:", erroTexto);
      return res.status(502).json({ erro: "Falha ao consultar o Gemini.", detalhe: erroTexto });
    }

    const dados = await resposta.json();
    const texto = dados?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") ?? "";

    if (!texto) {
      return res.status(502).json({ erro: "Resposta vazia do Gemini." });
    }

    return res.status(200).json({ texto });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: "Erro interno ao processar a comparação." });
  }
}
