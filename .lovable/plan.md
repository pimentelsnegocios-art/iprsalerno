# Livro Caixa externo com login único seguro

## Objetivo
Substituir o Livro Caixa e as contribuições internas por acessos ao aplicativo externo, preservando todas as demais áreas e permissões.

## Implementação
1. Criar no App da Igreja um emissor autenticado de código único, aleatório, de uso único e validade curta.
2. O botão **Livro Caixa** continuará visível somente para Fundador, Admin, Pastor, Presbítero e Auxiliar de Caixa. Ao clicar, mostrará “Abrindo Livro Caixa...” e abrirá uma nova aba para:
   - `https://livro-caixaiprb.lovable.app/painel?sso=true&code=...`
3. O botão **Minhas Contribuições** continuará no Meu Perfil para usuários logados e abrirá:
   - `https://livro-caixaiprb.lovable.app/minhas-contribuicoes?sso=true&code=...`
4. O aplicativo externo deverá trocar esse código no servidor, validar validade/uso/destino e criar sua própria sessão. Nenhum token, senha ou e-mail será colocado na URL.
5. Depois de validar o fluxo completo entre os dois aplicativos, remover as rotas internas `/caixa`, `/contribuicoes` e `/contribuicoes/conferencia`, além dos arquivos usados exclusivamente por elas.
6. Preservar cargos, permissões e todos os demais módulos sem mudanças.

## Segurança
- Código de curta duração, uso único, associado ao usuário e ao destino permitido.
- Abertura com isolamento da aba de origem (`noopener,noreferrer`).
- Sem sessão, o destino abre a entrada normal do Livro Caixa.
- Falhas exibem uma mensagem clara e não deixam o usuário preso em carregamento.

## Dependência externa
A conclusão exige acesso ao projeto do Livro Caixa ou que ele implemente o endpoint de troca do código. A remoção das telas internas será feita somente após esse recebimento estar funcional, evitando interromper o financeiro.

## Validação
- Testar os dois destinos com sessão válida, código expirado, código reutilizado e usuário desconectado.
- Confirmar que cargos não autorizados não veem o botão Livro Caixa.
- Confirmar que nenhuma URL ou registro expõe token, senha ou e-mail.
- Confirmar que todas as demais áreas continuam funcionando.
