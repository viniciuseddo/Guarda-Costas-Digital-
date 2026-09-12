## Context

Ver `proposal.md` para motivação e as nove delta specs para comportamento. O projeto ainda não contém aplicação. Este documento substitui o desenho anterior de integração real obrigatória: a orientação mais recente do usuário permite mocks e prioriza uma interface funcional que apresente bem a ideia.

Estão confirmados: dois Androids, mesmo app com Meu trajeto e Familiar, apresentação em campus universitário, escuta conceitual somente durante o trajeto, checagem mantida diante de bateria crítica, escolha prévia entre discreto/sonoro e demonstração de chamada/envio de contexto à polícia. A polícia é sempre simulada. Sensores, IA, localização e mídia podem ser simulados. Nada neste documento afirma implementação ou teste já executado.

## Goals / Non-Goals

**Goals:**

- Fazer o público acompanhar uma história completa: iniciar trajeto, perceber indício, preservar contexto, avisar familiar, demonstrar acionamento e resolver.
- Entregar interações reais entre dois celulares, mesmo quando o conteúdo é fictício.
- Conseguir repetir, pausar e avançar cenários sem depender de eventos físicos difíceis de reproduzir.
- Separar fonte de dados, estado compartilhado e interface para permitir integrações reais depois.
- Dar à outra IA uma sequência de tarefas que priorize o roteiro e o acabamento, não infraestrutura de produção.

**Non-Goals:**

- Desenvolver o app durante a produção destes artefatos.
- Chamar serviços públicos, enviar evidências reais à polícia ou produzir protocolo oficial.
- Treinar modelos, certificar detecção, implementar prontidão 24 horas ou publicar amplamente.
- Exigir microfone, câmera, sensor, GPS ou API paga reais para aprovar a demo.
- Construir painel web separado, banco de produção ou cadeia de custódia pericial.

## Decisions

### 1. Fronteira entre o que funciona e o que é mock

| Componente | Obrigatório na demo | Pode ser mockado |
|---|---|---|
| App | Mesmo pacote nos dois Androids, navegação e ações utilizáveis | Identidades, casa e preferências pré-preenchidas |
| Sessão | Comandos e estado sincronizados entre A e B | Percurso, relógio acelerado, ETA e bateria |
| Incidente | Abrir, checar, escalar, reconhecer e resolver | Medições cinemáticas e interpretação de áudio |
| Registros | Abrir foto, reproduzir áudio, mostrar metadados e retry | Conteúdo de mídia e envio ilustrativo |
| Mapa | Explorar percurso, posição e incidente coerentes | Base, pontos e polígonos ilustrativos |
| Polícia | Fluxo clicável completo, sempre identificado | Chamada, envio e recebimento, todos obrigatoriamente fictícios |
| Som | Controle de habilitar/silenciar e respeito ao modo | Sirene pode tocar localmente em ensaio autorizado |

Não usar duas apresentações independentes que apenas parecem sincronizadas. O dado pode ser fixture, mas a ação de A deve produzir o estado em B. Essa diferença é o principal critério técnico desta entrega.

### 2. App único com coordenador leve

Atualização autorizada pelo usuário durante apply: PWA instalável na tela inicial dos dois Androids, em vez de Kotlin/APK. Usar interface web responsiva e coordenador TypeScript/Node; ambos os papéis pertencem à mesma PWA, sem painel separado. Manifesto e service worker disponibilizam a interface/ativos offline, mas a sessão compartilhada exige coordenador acessível e HTTPS no ensaio físico. A identificação dos aparelhos e validação da rede foi adiada explicitamente para o ensaio final; permanece pendente, não dispensada.

O coordenador mantém salas de demo e transporta comandos/snapshots/eventos por canal autenticado, com REST para entrada e WebSocket ou mecanismo equivalente para atualizações. O detalhe do framework não altera as specs. Persistência local simples de snapshots por sala é suficiente; banco de produção e filas distribuídas não são requisitos. Reinício do coordenador deve recuperar a última execução salva ou informar execução interrompida, nunca fabricar continuidade.

```text
MESMO APP: ANDROID A         COORDENADOR DE DEMO          MESMO APP: ANDROID B
Meu trajeto                 Sala + execução             Familiar
Mapa e prazo                Relógio do cenário          Mapa e último sinal
Escuta/sensores simulados -> Eventos versionados ------> Alerta e timeline
SOS / checagem              Snapshot compartilhado      Fotos / áudio / tempos
Confirmar chegada <-------- Reconhecimento ------------ Confirmar recebimento
                            Atendimento fictício <------ Simular polícia
```

A rede pode ser Wi-Fi, hotspot ou dados móveis com servidor acessível. A escolha concreta será registrada no ensaio. Não presumir que a rede do campus permite comunicação direta entre clientes. Mapas, fotos e áudio vêm empacotados nos dois aparelhos e são selecionados por identificador; isso elimina upload pesado para apresentar a ideia. A UI identifica o envio de arquivo como simulado, enquanto a mudança de disponibilidade é realmente sincronizada.

Alternativa de um app totalmente local em cada telefone foi rejeitada por não garantir a mesma sessão. Alternativa de infraestrutura completa com PostgreSQL, objeto remoto e IA streaming foi retirada da entrega obrigatória porque desviaria esforço da interface. Integrações reais permanecem adaptadores opcionais, sem bloquear a aceitação.

### 3. Modelo compartilhado, autoridade e relógios

Modelo mínimo de cenário:

| Registro | Campos conceituais |
|---|---|
| Sala | identificador, participantes, papéis, autorização do operador |
| Execução | identificador novo a cada reset, seed/roteiro, versão, relógio, pausado |
| Sessão | titular/familiar fictícios, destino, ETA, prazo, modo, estado |
| Telemetria | posição, precisão, bateria, horário do cenário, origem, sequência |
| Incidente | origem, motivo, horário, checagem, estado, identificador estável |
| Evidência | asset, tipo, fonte, duração, tempos, posição referenciada, estado de envio |
| Entrega | criado, sincronizado, apresentado, reconhecido, autor/horário |
| Acionamento fictício | incidente, pacote selecionado, referência DEMO, etapa, tentativas |

Coordenador é autoridade de transições. Cada comando inclui sala, execução, identidade/papel, identificador idempotente e versão esperada quando altera estado. Reenvio do mesmo comando retorna o resultado anterior. Cliente não pode publicar arbitrariamente uma chegada do outro papel ou assumir que o simples nome Familiar concede permissão.

Usar relógio virtual de cenário para ETA, atraso, contagem, animação da rota e chamada fictícia. Pausa congela essas atividades em ambos os clientes. Saúde da conexão usa tempo real independente: relógio pausado não pode esconder um telefone desconectado. Mostrar horário do cenário em dados mockados; horário real de recepção pode aparecer separado. Clientes recuperam snapshot e eventos desde cursor ao reconectar.

Uma execução por sala e uma sessão principal mantêm o roteiro simples. Reset exige confirmação, cria outra execução, invalida comandos e referências anteriores e não afeta outras salas. Não usar limpeza global. Uma chegada concorrente com expiração segue a ordem persistida no coordenador; alerta emitido antes da chegada é preservado e depois resolvido.

```text
Sessão:    PRONTA -> ATIVA -> CHEGADA_CONFIRMADA
                      +----> ENCERRADA_PELA_PESSOA

Incidente: INDICIO -> CHECAGEM -> ALERTA -> RESOLVIDO
                        +-----> FALSO_ALARME
           SOS ---------------> ALERTA

Entrega:   SINCRONIZADO -> APRESENTADO -> RECONHECIDO

Polícia:   PREVIA -> CHAMADA_SIMULADA -> ENVIO_SIMULADO
                                         +-> RECEBIMENTO_FICTICIO
                                         +-> FALHA_SIMULADA -> RETRY
```

Bateria crítica e perda de sinal são condições da sessão, não confirmação de chegada. Reconhecimento do Familiar e recebimento fictício da polícia não encerram o trajeto. Controles de operador podem avançar o roteiro, mas aparecem separados das ações que o Familiar teria no produto real.

### 4. Roteiro, fixtures e limites iniciais

Premissas de apresentação, ajustáveis e versionadas por execução:

| Parâmetro | Referência de demo |
|---|---|
| Percurso principal | 90 segundos de relógio de cenário, com avanço manual disponível |
| Checagem de suspeita | 10 segundos do cenário |
| Tolerância após prazo | 10 segundos do cenário |
| Atualizações de posição | a cada 2 segundos do cenário |
| Saúde do canal real | heartbeat a cada 5 segundos, desatualizado após 15 segundos |
| Bateria crítica fictícia | 5%, exibida como valor simulado |
| Gesto conceitual | 3 pressões de volume+ em até 2 segundos; botão de simulação obrigatório |
| Áudio | um asset de até 30 segundos de pré-evento e outro posterior opcional; duração real no player |
| Fotos | 4 exemplos liberados em sequência; pelo menos caminho e fachada |
| Envio de mídia ilustrativo | etapas curtas de pendente/enviando/disponível, com falha manual |
| Sirene local de ensaio | máximo de 5 segundos e botão de silenciar; habilitação explícita antes |
| Chamada/envio fictícios | transições de 2 a 4 segundos do cenário, avançáveis pelo operador |
| Meta de sincronização | mudança visível em B até 2 segundos após aceite na rede do ensaio |
| Meta de feedback local | retorno visual de toque em até 200 ms, mesmo com comando pendente |

Estas metas não são resultados medidos. Guardar métricas de aceite, apresentação e reconexão sem dados sensíveis. Aumentar duração para apresentação mais longa não pode alterar a semântica de checagem.

Catálogo de fixtures: chegada normal; falso alarme; possível impacto; possível arrebate; voz suspeita; frase “Sentinela, preciso de ajuda”; SOS manual; gesto simulado; bateria crítica; sinal perdido; IA indisponível; mídia falhou/retry; policial cancelado/falhou/retry. Cada fixture define eventos e referências de assets, não uma sequência de telas sem estado. O operador pode interromper uma fixture com SOS ou confirmação explícita, e o estado seguinte deve respeitar a ação.

### 5. Fluxos e hierarquia das telas

Cena física de referência: dois participantes mostram os celulares no campus sob luz diurna, um representando a pessoa que caminha e outro o familiar que precisa entender rapidamente o que aconteceu. Priorizar tema claro de alto contraste e mapa legível, não um dashboard escuro de filme policial.

Direção visual proposta: identidade contida, calma durante acompanhamento e urgência localizada no estado de alerta. Usar uma família sans do sistema; tipografia de dados com números tabulares quando disponíveis; títulos curtos; espaçamento consistente. Referências funcionais: mapa e painel inferior de apps de mobilidade, timeline de mensageiros e controles nativos Android. Não imitar afiliação a Google, polícia ou universidade.

Paleta candidata para futura validação de contraste: primária verde mineral no entorno de OKLCH(0.50, 0.119, 160); fundo OKLCH(1, 0, 0); superfície secundária OKLCH(0.96, 0.01, 160); texto principal OKLCH(0.22, 0.01, 160); texto secundário OKLCH(0.43, 0.01, 160); ação secundária azul profundo OKLCH(0.34, 0.10, 245). Reservar âmbar/vermelho para atenção/alerta, sempre acompanhados de texto e ícone. Esses valores são propostas, não contraste já verificado; ajustar luminosidade antes de finalizar componentes. Não usar cores de alerta como decoração constante.

| Tela | Informação dominante | Ação principal | Estados secundários |
|---|---|---|---|
| Entrada | marca, aviso de demo e escolha de papel | Entrar na demonstração | entrar em sala, erro de vínculo |
| Meu trajeto pronto | destino e familiar | Iniciar trajeto | escolher discreto/sonoro, habilitar som de ensaio |
| Trajeto ativo | mapa, progresso e prazo | Confirmar chegada / Pedir ajuda | escuta simulada, sensores, estado de conexão |
| Checagem | motivo e contagem | Estou bem / Pedir ajuda | registros sendo preparados |
| Alerta em A | ajuda solicitada e entrega | Silenciar, se houver som | confirmação do familiar, chegada |
| Familiar ativo | pessoa acompanhada e mapa | Abrir acompanhamento | última atualização, origem dos dados |
| Familiar em alerta | motivo e última posição | Confirmar recebimento | timeline, registros, simular acionamento |
| Registro | foto ou áudio | Abrir / Reproduzir | timestamps, origem e posição referenciada |
| Polícia simulada | aviso e pacote | Iniciar chamada simulada | selecionar dados, cancelar, tentar novamente |
| Resolução | chegada e resumo | Repetir demo | histórico e retorno ao início |
| Controles de apresentação | roteiro e execução | Avançar etapa | pausar, disparar cenário, reset confirmado |

```text
MEU TRAJETO                         FAMILIAR
Sentinela    Demonstração           Alex • trajeto de demonstração
Destino: Portaria do campus        Alerta: possível impacto
[ mapa com trajeto e posição ]     [ mapa + última posição conhecida ]
Chegada em 01:20                    Recebido às 14:32:08
Escuta simulada • acompanhando      [ Confirmar recebimento ]
[ Estou bem ] [ Pedir ajuda ]       Fotos • Áudio • Linha do tempo
                                   [ Simular acionamento policial ]
```

Toda ação visível deve funcionar ou explicar sua indisponibilidade. Não adicionar botões decorativos de chamadas reais. Mostrar confirmação de toque, comando pendente, erro recuperável e retry. Timestamps mais técnicos ficam no detalhe; motivo, posição e próxima ação dominam a primeira leitura.

Transições curtas de 150 a 250 ms comunicam mudança de estado. Marcador só se move se houver novo ponto do cenário. Timeline revela cada registro quando disponível. Não usar animação de progresso sem relação com o estado, sirene piscante incessante ou texto bloqueado esperando animação. Respeitar redução de movimento, TalkBack e fonte ampliada; alvos de 48 dp, contraste de texto normal de pelo menos 4,5:1 e foco/navegação previsíveis. Etiqueta Demonstração é discreta mas legível; telas policiais repetem explicitamente Simulação para continuarem honestas em screenshots isolados.

### 6. Evidências e mapas sem dependências frágeis

Empacotar um pequeno conjunto de fotos autorizadas do campus ou imagens licenciadas genéricas e trechos de áudio gravados com consentimento. Registrar origem/licença; não inserir rosto identificável de terceiro ou endereço residencial real por padrão. Assets iguais nos dois aparelhos usam o mesmo identificador e versão do catálogo. O coordenador transmite referência e estado, não precisa hospedar grandes arquivos.

Detalhe de evidência mostra Mídia de exemplo, câmera representada, timestamp do cenário, duração real e posição referenciada. Um erro de envio ilustrativo não remove o alerta. Retry reaproveita identificador. Para a simulação policial, selecionar os registros existentes e congelar uma prévia; registro pendente continua pendente. Não inventar foto nova apenas para preencher um pacote.

Mapa de demonstração pode ser uma base vetorial/simplificada empacotada e interativa com pan/zoom, rota e marcadores. Se usar esquema fictício, nomear ponto como Portaria (demo), com coordenadas não disponíveis em vez de coordenadas inventadas. Se usar planta/cartografia real do campus, confirmar licença/atribuição. Rota mockada sobre mapa real mantém rótulo Trajeto simulado. Polígonos representam Zona de demonstração, nunca ocorrência real presumida no campus. Um provedor real de mapas é melhoria opcional.

### 7. Acionamento policial exclusivamente encenado

Ação de B: Simular acionamento policial. Primeiro mostrar prévia com pessoa fictícia, motivo, última localização, idade, horários, fotos e áudio selecionados. Aviso persistente: “Simulação. Nenhuma ligação ou envio real será realizado.”

A UI imita o fluxo de uma central fictícia, não o discador Android e não uma instituição real: chamada simulada em andamento, envio simulado do pacote, recebido na simulação. Referência inicial no formato DEMO-<execução>-<incidente>; isso é referência local fictícia, não protocolo de atendimento. Cancelamento, falha e nova tentativa são estados reais da demo. Atualizar timeline compartilhada sem resolver o incidente ou alegar despacho de viatura.

Não adicionar permissão CALL_PHONE, intents de discagem, números de emergência, SMS, e-mail ou endpoints públicos. O único transporte desse fluxo é o coordenador interno. Nenhuma integração real de autoridade é disponibilizada como configuração escondida. O familiar escolhe iniciar a simulação; nem áudio ambiente nem ferramenta de IA podem iniciar chamada pública. Verificar ausência de efeitos externos inspecionando código, permissões e tráfego na implementação futura.

### 8. Autorização e separação de papéis

Usar acesso à sala por convite de uso único e validade curta ou credenciais de demonstração provisionadas, sem segredo permanente embutido no app. Depois do vínculo, tokens curtos identificam sala, execução e papel. Segredos de provisionamento permanecem no coordenador. Limitar tentativas de convite e comandos. O nome fictício mostrado na UI não é autorização.

Titular inicia/encerra seu trajeto e confirma segurança. Familiar consulta, reconhece e opera atendimento fictício. Operador de apresentação pode injetar cenário, pausar e resetar apenas sua sala; esses controles são identificados como Controles da demo, não poderes normais do familiar. Revogação bloqueia consultas e mostra falta de destinatário; não marca chegada.

Por padrão não há dados pessoais reais persistidos. Snapshots da demo têm expiração curta, inicialmente 24 horas; reset invalida sua execução para consulta corrente e uma limpeza remove dados de teste expirados. Assets licenciados empacotados não são dados privados de uma sessão. Caches de sessão seguem expiração e autorização; logs guardam IDs de execução e latências, não mídia, tokens, endereço ou transcrição real. Usar canal cifrado e acesso restrito, mesmo no campus.

### 9. Evolução real opcional, fora do caminho de entrega

Definir fronteiras substituíveis para localização, sensores, análise de áudio, evidências e transporte. Fonte mock retorna eventos com a mesma estrutura e campo de proveniência. A origem não pode ser reclassificada como real por um toggle visual sem mudar o provedor efetivo.

Se for oportuno depois de completar os roteiros, adicionar GPS ou foto real consentidos; depois sensores/voz. No Android, iniciar Foreground Service e recursos while-in-use a partir de ação com interface visível e respeitar indicadores. Captura pelo fone, volume+ bloqueado e continuidade com tela apagada precisam de ensaio específico; não são exigências da versão mock-first. Captura real para ao encerrar. Chaves de IA nunca entram no pacote. Falha real permite voltar ao mock com mensagem explícita, não fingir continuidade.

A arquitetura atual é de demo, não serviço de emergência de produção: não prometer alta disponibilidade do coordenador, recuperação infalível, inferência clínica, bateria confiável por fabricante ou envio público. Evolução para produto real exige proposta própria com persistência robusta, regras de publicação, privacidade, métricas de detector e canais de resposta efetivos.

### 10. Sequência de construção e demonstração

Construir primeiro: estados e fixtures, app de dois papéis, coordenador e fatia vertical início -> SOS -> Familiar -> reconhecimento -> chegada. Depois mapa, áudio, fotos e checagem. Em seguida atendimento fictício, falhas/retries, controles e acabamento. Só depois considerar fontes reais opcionais.

Roteiro principal no campus: entrar nos dois celulares; vincular sala; mostrar familiar; iniciar; avançar rota; mostrar escuta simulada; disparar conversa suspeita ou impacto; deixar contagem vencer; receber alerta em B; abrir foto de caminho/fachada e áudio; reconhecer; simular polícia e envio do pacote; confirmar chegada em A. Roteiros curtos adicionais: falso alarme, bateria/sinal, SOS de volume simulado, falha/retry de mídia e polícia, modo sonoro autorizado.

O percurso pode ser percorrido fisicamente ou animado, conforme o espaço e o tempo de apresentação. Planejar área sem trânsito perigoso e evitar filmar terceiros. Não encenar ameaça pública sem alinhamento com responsáveis; sirene de teste deve ser curta e previamente acordada. Validar conectividade entre dispositivos e coordenador antes do público. Se B perder conexão, mostrar estado real de conexão e recuperar, não continuar fingindo recebimento ao vivo.

## Risks / Trade-offs

- [Dados mockados parecerem reais] -> Etiqueta persistente de demo, origem por dado e aviso forte em atendimento fictício.
- [Telas bonitas sem comportamento] -> Critério de aceite exige comandos compartilhados, player/galeria, contagens e retries funcionais.
- [Rede do campus isolada] -> Ensaiar ambiente acessível pelos dois Androids e levar configuração de rede alternativa; assets locais reduzem tráfego.
- [Descompasso entre aparelhos] -> Coordenador autoritativo, execução/versionamento, idempotência, snapshot e cursor de reconexão.
- [Reset mistura sessões] -> Nova execução por reset confirmado, escopo por sala e rejeição de comandos antigos.
- [Chamadas acidentais] -> Não implementar discador, números de emergência ou endpoints públicos; teste explícito de ausência de efeitos externos.
- [Promessa de detecção inexistente] -> Mostrar análise simulada sem métricas inventadas; fontes reais são opcionais e rotuladas.
- [Sirene atrapalha campus] -> Habilitação explícita, duração curta, silenciar e consentimento do ensaio.
- [Escopo cresce e bloqueia entrega] -> Concluir todos os roteiros mockados antes de qualquer integração real opcional.
- [Executor não permite fixar swe-2] -> Não disparar subagents com outro modelo; solicitar um launcher configurável e verificar modelo efetivo antes de delegar.

## Migration Plan

Não há código nem dados legados a migrar. Esta revisão é de artefatos de planejamento; as exigências anteriores de captura real, detector treinado e backend de produção não permanecem como bloqueios ocultos.

Na execução futura, instalar a mesma build nos dois celulares, provisionar somente identidades fictícias/sala de teste, carregar fixtures e iniciar coordenador isolado. Reverter a demo significa parar novas execuções e informar interrupção das atuais, sem alegar chegada segura. Reset é operação limitada à sala, não exclusão global. Nada nesta seção autoriza executar instalação, serviços ou desenvolvimento durante a entrega das specs.

## Open Questions

Parâmetros que podem ser definidos pela outra IA e pelo operador sem mudar os contratos:

- Modelos e versões dos dois Androids, para escolher SDK e verificar layout/build.
- Nome do campus, destino ilustrativo e assets autorizados disponíveis; usar mapa genérico rotulado até receber esses dados.
- Rede e ambiente do coordenador acessíveis pelos dois celulares.
- Launcher disponível para subagents com modelo swe-2 verificável. A ferramenta desta sessão não oferece seleção de modelo; não foi disparado nenhum subagent.

## References

Referências para evolução real opcional, não dependências da demo:

- Tipos de serviço Android: https://developer.android.com/develop/background-work/services/fgs/service-types
- Restrições de início: https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start
- Sensores: https://developer.android.com/develop/sensors-and-location/sensors/sensors_overview
- Privacidade: https://developer.android.com/training/permissions/explaining-access
- Teclas: https://developer.android.com/reference/android/accessibilityservice/AccessibilityServiceInfo
- Áudio: https://developer.android.com/reference/android/media/AudioRouting
- IA com ferramentas: https://developers.openai.com/api/docs/guides/realtime-mcp
