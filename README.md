# Renovated Connect

📄 PROMPT SÊNIOR ÔMEGA — ESPECIFICAÇÃO COMPLETA para app web

 

📱 APLICATIVO — IGREJA PRESBITERIANA RENOVADA

 

✅ Versão Final — Sem duplicações, clara, direta, fiel ao que você detalhou

 

 

 

🎯 OBJETIVO

 

Criar aplicativo móvel/web para a Igreja Presbiteriana Renovada. Estrutura limpa, sem duplicidade, cada elemento em seu lugar. Identidade visual unificada, com variação de tema por ministério. Tudo 100% identificado — sem anonimato em nenhum ponto.

 

 

 

📐 PARTE 1 — TELA INICIAL (Home) — EXATAMENTE COMO DEFINIDO

 

🖼️ CABEÇALHO

 

- Logo da igreja + cruz em destaque no topo

- Saudação com nome do usuário logado

- Sem barra de navegação superior extra — limpo e direto

 

📢 AVISOS — ESPAÇO DESTAQUE LOGO ABAIXO

 

- Área visível logo no topo, abaixo do nome

- Título: "Avisos da Igreja"

- Texto do aviso em destaque, fundo com cor de destaque ( #FFB703  — dourado)

- Pode ser clicável para ver detalhes

- Sempre visível na tela inicial

 

🔘 6 BOTÕES PRINCIPAIS — ORDEM FIXA

 

Todos com ícone + rótulo, mesmo tamanho, espaçados igualmente

 

Nº Botão Ícone Ação ao clicar 

1 📅 Agenda Calendário Abre agenda completa de cultos e eventos 

2 🙏 Oração Mãos orando Abre pedidos de oração (SEM ANÔNIMO) 

3 📖 Estudo Livro Abre estudos bíblicos e materiais 

4 🏛️ Ministérios Edifício Abre lista de ministérios (Louvor, Jovens, Irmãs) 

5 👤 Meu Perfil Usuário Abre dados pessoais, foto, edição 

6 📩 Acesso Pastoral Bíblia / Mensagem Abre canal privado — críticas, dúvidas, assuntos sensíveis 

 

📋 AGENDA SEMANAL — ABAIXO DOS BOTÕES

 

- Título: "Agenda Semanal"

- Lista simples com dias e horários dos cultos fixos:

- Quinta-feira — horário

- Sábado — horário

- Domingo — horário

- Formato limpo: Dia — Horário

- Sem informações extras que poluem

 

🧭 BARRA INFERIOR — NAVEGAÇÃO FIXA (SEMPRE VISÍVEL)

 

4 botões, fixos embaixo de TODAS as telas:

 

Botão Ícone Para onde vai 

Quinta 📅 Culto de Quinta 

Sábado 🎵 Culto de Sábado (inclui louvores do dia) 

Domingo ⛪ Culto de Domingo (inclui louvores do dia) 

Mais ⋯ Menu expandido → Livro Caixa, Administração, Sair 

 

✅ Regra clara: A barra inferior é só para navegar entre os cultos e o "Mais". Não duplica os 6 botões de cima. Cada área tem sua função.

 

 

 

🏗️ PARTE 2 — ESTRUTURA GERAL DO SISTEMA

 

🔹 HIERARQUIA DE CARGOS — PERMISSÕES GLOBAIS

 

Cargo O que pode Observação 

Fundador ✅ TOTAL — tudo, sem restrição Pode revogar, transferir, editar qualquer um 

Admin Aprovar cadastros, gerenciar usuários, configurações Pode ser revogado pelo Fundador 

Pastor Acesso ao Canal Pastoral, responder mensagens, orientação , livro caixa, avisos da igreja, agenda de cultos.

Presbítero mesma coisa do pastor

Auxiliar de Caixa Acesso EXCLUSIVO ao Livro Caixa — lançamentos, relatórios Não acessa outras áreas administrativas 

Membro Acesso limitado, vê agenda da igreja, avisos, estudo publico, oração, acesso Pastoral para perguntar, e se tentar acessar os canais de ministérios receberá uma mensagem tipo "A paz do senhor, caso queira descobrir o que tem, que tal participar? Procure um líder.



 

🔹 LÍDERES DE MINISTÉRIOS — FUNÇÕES ESPECÍFICAS

 

Líder Ministério que gerencia Tema próprio 

Líder de Louvor 🎵 Ministério de Louvor 

Líder de Jovens 🔥 Ministério de Jovens  

Líder de Irmãs 💜 Ministério das Irmãs 

 

🔹 SISTEMA DE APROVAÇÃO DINÂMICA

 

No momento da aprovação do cadastro (Admin/Fundador):

✅ Define cargo + ministério + função da pessoa

✅ Pode ser editado a qualquer momento — nunca é fixo

✅ Fundador pode revogar cargo de Admin e transferir acesso a qualquer momento

 

 

 

📱 PARTE 3 — DETALHE DAS TELAS

 

📅 AGENDA

 

- Lista de cultos: Quinta, Sábado, Domingo

- Cada culto tem: data, horário, pregador, dirigente, tema

- Louvores do dia — dentro de cada culto, lista separada de músicas

- Separado por Sábado e Domingo — não misturar

 

🙏 ORAÇÃO

 

- SEM ANÔNIMO — nome do autor SEMPRE visível

- Categorias: Saúde, Família, Emprego, Financeiro, Espiritual, Outros

- Botão "Estou orando por isso"

- Expira em 7 dias automaticamente

 

📖 ESTUDO

 

- Lista de estudos bíblicos

- Busca por livro, tema, palavra-chave, curiosidades, referências e mural de cada assunto.

- Apenas liderança pode criar

- Autor sempre visível

 

🏛️ MINISTÉRIOS

 

- Lista dos 3 ministérios: Louvor, Jovens, Irmãs

- Cada um abre com tema/cores próprias

- Cada ministério tem botões exclusivos conforme sua função

- Acesso restrito: só membros e liderança veem o conteúdo interno

 

📩 ACESSO PASTORAL

 

- Canal privado — NÃO PÚBLICO

- Críticas, dúvidas, assuntos sensíveis → AQUI

- Apenas autor , Pastor , Presbítero veem

- Sem anonimato — identificação obrigatória

- Histórico da conversa preservado

💰 LIVRO CAIXA (dentro de "Mais")

- Acesso: Auxiliar de Caixa, Pastor, Fundador, Presbítero

- Lançamentos: Entradas / Saídas

Dízimo ofertas e doações é somente entrada

- Categorias: Dízimo, Oferta, Doações, Gastos(Informa manualmente o tipo : Luz, agua, internt e etc. Repasse Sede é somente saída.

- Saldo em tempo real

- Relatórios por período

- Histórico com responsável por cada lançamento

👤 MEU PERFIL

- Foto de perfil

- Nome, e-mail, WhatsApp, endereço

- Cargo, ministério, mural, caixa de mensagens, bio, versiculo que gosta

- Trocar senha

- Sair

🎨 PARTE 4 — IDENTIDADE VISUAL

🎨 TEMA GERAL (Igreja)

Elemento Cor Código 

Fundo Azul Marinho  #041E42  

Texto principal Branco  #FFFFFF  

Destaque / Botões Dourado  #FFB703  

Texto secundário Branco translúcido  rgba(255,255,255,0.6)  

 

🎨 TEMAS POR MINISTÉRIO

Ministério de Louvor Cinza Escuro  Dourado Branco

Ministerio dos Jovens Vermelho Escuro  Laranja/Preto

Ministério das Irmãs  /Rosa Claro/Roxo claro/branco

✅ A cor muda AUTOMATICAMENTE conforme o ministério acessado

⚠️ REGRAS DE OURO — NUNCA ESQUECER

- ❌ Nenhum anonimato em NENHUMA tela — tudo identificado

- ✅ Críticas e assuntos sensíveis → Canal Pastoral, nunca no fórum público

- ✅ Aprovação dinâmica — cargo e ministério definidos na aprovação

- ✅ Fundador = poder total — ninguém o remove, ele pode revogar qualquer um

- ✅ Sem duplicidade — 6 botões na tela inicial + 4 na barra inferior = funções distintas

- ✅ Louvores do dia — dentro de cada culto, separado por Sábado e Domingo

🎯 PRONTO. Sem duplicidade, sem confusão, cada elemento no seu lugar.

- Cada ministério com tema próprio

- Livro Caixa dentro de "Mais"

- Sem anonimato, sem confusão de funções

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://iprsalerno.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/37cced4a-7539-439e-bd47-7abc83d46dc0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
