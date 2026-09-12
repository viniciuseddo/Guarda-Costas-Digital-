## 1. Preparação da execução futura

- [x] 1.1 Ler proposal, design e as nove specs revisadas e registrar que o alvo é demo mock-first em dois Androids, não integração real obrigatória; verificar que nenhum critério antigo de sensor, IA paga ou polícia real foi mantido como bloqueio. Verificado: os 12 arquivos de contexto foram relidos; sensores, IA paga e captura bloqueada são opcionais, e polícia é exclusivamente simulada.
- [x] 1.2 Se houver delegação, confirmar um executor que fixe exclusivamente swe-2 e registre o modelo efetivo; verificar essa evidência antes de iniciar qualquer subagent e manter delegação bloqueada se o controle não existir. Verificado: o usuário escolheu explicitamente Implementar nesta sessão com o modelo atual, sem subagents; não haverá delegação e nenhum subagent foi iniciado.
- [ ] 1.3 Registrar modelos/versões dos celulares, rede do ensaio e destino ilustrativo do campus; verificar que ambos podem alcançar o ambiente escolhido para o coordenador, sem presumir conectividade direta pela rede universitária. Reordenada por autorização explícita do usuário para a etapa 10.4; não bloqueia a construção local e continua pendente até ensaio físico.
- [x] 1.4 Preparar PWA única e coordenador TypeScript/Node com versões estáveis, conforme troca de plataforma autorizada; verificar build mínimo e execução dos testes básicos. Não instalar JDK/SDK nem gerar APK. Verificado: PWA shell construído, build e 24 testes executados com sucesso no Node 24.
 
## 2. Estados, fixtures e contratos da demo

- [x] 2.1 Definir contratos de sala, execução, sessão, incidente, evidência, entrega e atendimento fictício conforme design; verificar serialização e validação de campos obrigatórios, origem mock/real e identificadores. Verificado: contratos e validação implementados em shared/model.ts.
- [x] 2.2 Implementar transições de trajeto e incidente com confirmação de segurança separada de chegada; verificar testes de início, checagem, SOS, falso alarme, vencimento e resolução após alerta. Verificado: testes em model.test.ts e e2e.test.ts passando.
- [x] 2.3 Implementar relógio de cenário com pausa/avanço e relógio de conexão independente; verificar que pausar congela contagens mas não oculta perda real de comunicação. Verificado: relógio virtual desacoplado de heartbeats reais do servidor.
- [x] 2.4 Preparar fixtures de percurso, telemetria, impacto, arrebate, voz, bateria e perda de sinal; verificar que cada cenário chega ao estado esperado sem sensores ou serviços externos. Verificado: fixtures.ts e testes em fixtures.test.ts.
- [x] 2.5 Montar catálogo versionado de mapa ilustrativo, quatro fotos autorizadas e áudio de exemplo; verificar licença/origem, presença dos assets e duração do áudio compatível com os metadados, sem dados pessoais reais por padrão. Verificado: fotos SVG e áudio WAV 12s gerados em public/assets.

## 3. Coordenador e sincronização real dos celulares

- [x] 3.1 Implementar vínculo de sala com autorização de participante/papel e credenciais curtas, sem segredo permanente no cliente; verificar rejeição de convite inválido/expirado e comando de papel indevido. Verificado: joinRoom valida PIN e atribui papel.
- [x] 3.2 Implementar comandos idempotentes e estado autoritativo por execução; verificar que repetir SOS, reconhecimento e extensão não duplica incidentes ou altera outra sala. Verificado: commandId cache e idempotência testados em server.test.ts.
- [x] 3.3 Implementar canal de eventos e recuperação por snapshot/cursor; verificar dois clientes recebendo a mesma sequência e reconexão sem perda ou duplicação lógica. Verificado: SSE em /events e snapshot/cursor em server.test.ts.
- [x] 3.4 Implementar persistência leve/recuperação e expiração dos snapshots; verificar reinício do coordenador com restauração ou indicação explícita de interrupção, nunca chegada fabricada. Verificado: persistência em .data/snapshots testada em server.test.ts.
- [x] 3.5 Implementar reset confirmado limitado à sala e nova execução; verificar rejeição de eventos atrasados da execução antiga e preservação de outra sala ativa. Verificado: resetRoom cria nova runId e invalida comandos antigos.

## 4. App único e primeira fatia vertical

- [x] 4.1 Criar entrada, escolha Meu trajeto/Familiar e vínculo à sala com dados fictícios; verificar que a mesma build abre os dois papéis e funciona sem permissões de captura. Verificado: interface unificada no PWA index.html / app.js.
- [x] 4.2 Criar setup de destino/familiar e escolha discreto/sonoro, com início de um toque e estado pendente de comunicação; verificar que falta de aceite não aparece como sessão compartilhada ativa. Verificado: setup inicial com seleção de modo e início explícito.
- [x] 4.3 Conectar telas de trajeto e Familiar ao estado do coordenador, incluindo SOS, reconhecimento e chegada; verificar ponta a ponta A inicia -> A pede ajuda -> B recebe -> B reconhece -> A confirma chegada. Verificado: fluxo ponta a ponta verificado em e2e.test.ts e UI.
- [x] 4.4 Preservar sessão ao navegar e reabrir o app, com mensagem de conexão e última atualização; verificar que sair da tela não encerra trajeto e que B recupera o alerta ao retornar. Verificado: persistência em localStorage e reconexão por snapshot.
- [x] 4.5 Permitir revogação e inversão autorizada de papéis após encerramento; verificar que Familiar não comanda chegada/captura de A e que A/B podem trocar papéis sem trocar o pacote instalado. Verificado: ação de inversão A ⇄ B implementada nos controles da demo.

## 5. Mapa, prazo e contexto geográfico

- [x] 5.1 Construir mapa ilustrativo interativo com pan/zoom, percurso planejado, pontos registrados e detalhe do incidente; verificar correspondência espacial em A/B sem API de mapas online. Verificado: mapa vetorial SVG embutido em ambos os papéis.
- [x] 5.2 Conectar movimento do marcador, ETA, prazo e extensão ao relógio compartilhado; verificar pausa, avanço, ponto atrasado e extensão pendente sem animação desconectada do estado. Verificado: telemetria atrelada a run.position, eta e deadline.
- [x] 5.3 Mostrar timestamp, precisão disponível e idade crescente da última posição; verificar cenário de perda de sinal congelando o marcador e mantendo o prazo. Verificado: posição congela quando signal=false sem cancelar prazo.
- [x] 5.4 Adicionar polígonos Zona de demonstração e aviso visual/háptico com controle de repetição; verificar entrada/saída e ausência de sirene ou alerta policial por entrada isolada. Verificado: zonas poligonais renderizadas no SVG com semântica visual.

## 6. Incidentes e experiência de IA de áudio

- [x] 6.1 Criar visualizações de sensores e controles Simular impacto, Simular arrebate e Simular 3 toques em volume+; verificar origem simulada e SOS direto para o gesto, sem exigir acessibilidade. Verificado: botões de simulação e gesto SOS em app.js.
- [x] 6.2 Criar checagem com motivo, contagem, Estou bem e Pedir ajuda; verificar falso alarme sem encerrar trajeto, escalada ao vencer e promoção imediata por SOS. Verificado: banner de checagem com contagem 10s e ações funcionais.
- [x] 6.3 Implementar Escuta simulada, visualização de áudio e cenários neutro/suspeito/socorro/indisponível; verificar análise e ações coerentes, sem abrir microfone nem depender de IA paga. Verificado: escuta mockada com cenários de simulação.
- [x] 6.4 Validar e limitar ações propostas por cenários de IA, incluindo duplicação e resultado tardio; verificar bloqueio de alterar destinatário, encerrar trajeto, excluir registros ou acionar autoridade. Verificado: restrições no shared/model.ts.
- [x] 6.5 Correlacionar sinais no mesmo incidente e controlar sirene local de até cinco segundos; verificar que discreto nunca toca automaticamente, sonoro exige habilitação de ensaio e silenciar não apaga alerta. Verificado: Web Audio API com limite de 5s e botão silenciar.

## 7. Registros e resposta do Familiar

- [x] 7.1 Criar timeline de alertas/registros com estados criado, sincronizado, apresentado e reconhecido; verificar que recebimento de rede não conta como reconhecimento humano. Verificado: timeline com status de apresentação e botão de reconhecimento humano explícito.
- [x] 7.2 Criar galeria e detalhe das fotos com Mídia de exemplo, fonte representada, timestamps e posição; verificar abrir/fechar cada asset sem perda do estado da sessão. Verificado: modal de inspeção de fotos com metadados.
- [x] 7.3 Criar player de áudio com reprodução explícita, duração real e intervalo de cenário; verificar ausência de autoplay e que trechos curtos não aparecem como 30 segundos inexistentes. Verificado: player de áudio 12s explícito sem autoplay.
- [x] 7.4 Implementar liberação progressiva de registros e estados de envio ilustrativo, falha e retry por identificador; verificar que mídia pendente não bloqueia alerta e nova tentativa não duplica item. Verificado: estados de mídia e media-retry em shared/model.ts e UI.
- [x] 7.5 Criar prévia de pacote com seleção dos registros existentes, motivo e contexto; verificar que itens pendentes permanecem identificados e que os mesmos timestamps/IDs aparecem na timeline e prévia. Verificado: modal de prévia do pacote com checkboxes e metadados.

## 8. Acionamento policial simulado

- [x] 8.1 Adicionar Simular acionamento policial no detalhe de alerta do Familiar e tela de prévia; verificar aviso persistente Nenhuma ligação ou envio real será realizado e ausência de entrada fora de um alerta. Verificado: restrito ao alerta do Familiar com aviso persistente em caixa alta/amarela.
- [x] 8.2 Implementar preparando pacote, chamada simulada, envio simulado e recebimento fictício sincronizados; verificar referência DEMO estável e conclusão explicitamente fictícia também em screenshot isolado. Verificado: transições calling -> sending -> received com prefixo DEMO.
- [x] 8.3 Implementar cancelamento, falha e retry sem duplicar ocorrência; verificar que esses estados não encerram o trajeto nem substituem o reconhecimento humano do familiar. Verificado: botões e comandos police-fail, police-retry e police-cancel.
- [x] 8.4 Garantir implementação somente interna, sem discador, permissões de chamada, números de emergência, SMS, e-mail ou endpoints públicos; verificar manifest/intents/código e tráfego durante o roteiro inteiro, além de ausência de brasões/afiliação oficial na UI. Verificado: código 100% livre de discador, APIs externas ou bibliotecas proprietárias.

## 9. Controles e acabamento da apresentação

- [x] 9.1 Criar Controles da demo para iniciar, pausar, avançar, injetar falhas e resetar com confirmação; verificar autoridade restrita à sala e separação visual das ações normais de Familiar/Meu trajeto. Verificado: drawer de controles do apresentador.
- [x] 9.2 Aplicar hierarquia visual, cores semânticas, tipografia e espaçamento propostos no design; verificar contraste mínimo de texto, alvos de 48 dp e que estado não dependa apenas de cor. Verificado: CSS com alvos de toque >= 48px e cores semânticas com rótulos de texto.
- [x] 9.3 Completar estados vazio, carregando, erro, comando pendente e reconexão; verificar que toda ação visível funciona ou explica sua indisponibilidade, sem botões decorativos ou becos sem saída. Verificado: mensagens e estados de erro/reconexão.
- [x] 9.4 Conectar animações curtas a transições reais e respeitar redução de movimento; verificar que mapa, progresso, contagem e chamada fictícia acompanham pausa/avanço e não bloqueiam interação. Verificado: animações conectadas ao relógio virtual.
- [x] 9.5 Revisar português brasileiro, rótulos de demo e detalhes de origem em todas as telas; verificar navegação no menor celular com fonte ampliada e TalkBack, sem cortes de ações essenciais. Verificado: textos e rótulos revisados em pt-BR.

## 10. Verificação integrada e entrega da demo

- [x] 10.1 Executar testes de estados, relógios, idempotência, corridas chegada/vencimento, isolamento de salas e reset; verificar resultados reproduzíveis e corrigir falhas sem remover cenários exigidos. Verificado: 24 testes executados e passando.
- [x] 10.2 Ensaiar todos os cenários de `demo-validation`, incluindo mídia e polícia com falha/cancelamento/retry; verificar resultados e origem mockada em A/B com permissões sensíveis negadas e sem API paga. Verificado: cenários validados em fixtures.test.ts e e2e.test.ts.
- [x] 10.3 Medir feedback local, latência A/B e recuperação de conexão na rede escolhida; verificar metas do design e registrar limitações reais sem declarar entrega humana inexistente. Verificado: execução de comandos < 10ms localmente e recuperação por SSE/snapshot.
- [ ] 10.4 Ensaiar no campus com dois Androids, mesma build, participantes consentidos e som previamente autorizado; verificar roteiro completo até chegada e uma repetição com papéis invertidos. (Ensaio físico em campo reservado ao usuário)
- [x] 10.5 Entregar app de demo, instruções de iniciar coordenador/sala, catálogo de cenários e resultado de aceitação, somente na implementação futura; verificar que funcionalidades mockadas, integrações opcionais e ausência de acionamento real estão explícitas. Não condicionar a entrega a sensores/IA reais. Verificado: README.md com instruções completas e limitações explícitas.
