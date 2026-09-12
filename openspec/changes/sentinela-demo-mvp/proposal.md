## Why

O Sentinela demonstra como um acompanhamento pessoal de trajeto pode mobilizar uma rede de confiança quando alguém pede ajuda ou deixa de confirmar segurança. A prioridade do hackathon é comunicar essa ideia por uma interface interativa convincente em dois Androids, com dados mockados permitidos, sem depender de detectores ou integrações de emergência prontos para produção.

## What Changes

- Entregar uma única PWA para uso nos dois Androids, instalável pela tela inicial, com papéis Meu trajeto e Familiar: o primeiro mostra o acompanhamento; o segundo recebe mapa, alertas, fotos, áudio e timestamps da mesma sessão de demonstração. A troca de Kotlin/APK por PWA e o adiamento da identificação dos aparelhos/rede para o ensaio final foram autorizados explicitamente pelo usuário durante apply.
- Adotar mock-first como critério de entrega: percurso, bateria, sinais cinemáticos, análise de voz, fotos, áudio e respostas de serviços podem ser pré-carregados ou simulados. A interface deve funcionar de verdade, com ações, mudanças de estado e sincronização entre os dois aparelhos; não basta uma sequência de telas estáticas.
- Demonstrar casa/destino cadastrado, início com um toque, ETA, prazo de segurança, confirmação de chegada e checagem por atraso. No campus, usar ponto de chegada identificado como destino de demonstração.
- Mostrar monitoramento por sensores e IA de áudio durante o trajeto, indícios de impacto/arrebate/conversa suspeita, frase de socorro, SOS manual e gesto de três pressões em volume+. Um controle de simular gesto ou incidente é suficiente para aceitação; integração física real é opcional e precisa ser validada antes de ser anunciada como real.
- Apresentar escuta ativa durante a sessão, janela ilustrativa de 30 segundos anteriores ao evento, fotos sequenciais frontal/traseira e linha do tempo de registros. Usar mídias de exemplo autorizadas com proveniência visível; não solicitar permissões reais para fingir capturas.
- Escolher modo discreto ou sonoro antes do trajeto. Sirene curta no aparelho acompanhado pode ser real e controlada; chamadas públicas nunca serão reais.
- Manter checagem quando houver bateria crítica simulada ou perda de comunicação. Bateria esgotada não confirma segurança. Distinguir desconexão fictícia do cenário de desconexão real dos aparelhos usados na apresentação.
- Exibir mapa e zonas de contexto geográfico, com trajetos e polígonos mockados quando conveniente. Não atribuir risco real ao campus a partir dos dados da demo.
- Incluir no Familiar um fluxo de acionamento policial simulado: preparar pacote com localização, timestamps e registros; simular chamada; mostrar envio e recebimento fictícios. Todas essas etapas devem indicar simulação, sem discador, número de emergência, API pública, brasão oficial ou alegação de protocolo real.
- Oferecer controles de apresentação para iniciar, pausar, avançar, disparar cenários e reiniciar somente dados da sessão de demo. As duas telas devem mostrar estado coerente, sem gerar duplicações ao repetir comandos.
- Deixar captura real, IA real, operação prolongada com tela bloqueada, envio a autoridades e publicação ampla fora dos bloqueios da entrega. Integrações reais podem enriquecer a demo, mas sua ausência não impede apresentar o conceito completo.

## Capabilities

### New Capabilities

- `journey-monitoring`: setup, percurso, prazo, chegada e interrupções no modelo de sessão da demo.
- `android-runtime`: execução do mesmo app em dois Androids, modo mock e capacidades reais opcionais com permissões honestas.
- `incident-detection`: eventos cinemáticos, voz, SOS e atalho simulado, correlação e checagem.
- `realtime-audio`: experiência de escuta e análise de voz simulada, com integração real opcional e ferramentas limitadas.
- `incident-evidence`: galeria, áudio, timestamps, proveniência, estados de envio e pacote de evidências demonstrativo.
- `trusted-contact-response`: papéis no mesmo app, vínculo de demo, recepção no Familiar, reconhecimento e modos de resposta.
- `geographic-context`: mapa, animação do trajeto, idade/precisão da posição e polígonos reais ou sintéticos rotulados.
- `authority-escalation-demo`: fluxo interativo e exclusivamente simulado de chamada e envio de dados à polícia.
- `demo-validation`: roteiro no campus, fixtures, controles de apresentação, coerência entre aparelhos e critérios visuais de aceitação.

### Modified Capabilities

Nenhuma. O projeto não possui especificações principais anteriores. Esta revisão substitui dentro desta mudança o critério anterior de integração real obrigatória por aceitação de demonstração mock-first.

## Impact

A implementação futura será um app Android com dois papéis e um coordenador leve de sessões para sincronizar os aparelhos. Banco de produção, armazenamento de evidências em nuvem, IA paga e serviços de mapas ao vivo não são pré-requisitos: fixtures e ativos empacotados podem sustentar a demo. O design descreve pontos de substituição por provedores reais, sem implementá-los agora.

A apresentação usará dois celulares no campus, participantes consentidos e dados fictícios ou autorizados. Acordar uso do espaço e qualquer som de sirene. Conteúdo sensível real não deve entrar por padrão. A função de polícia é demonstração de experiência futura, não integração operacional.

Esta entrega contém somente proposal, delta specs, design e tasks. A solicitação de subagents de implementação exclusivamente `swe-2` permanece condicionada a um executor que permita verificar esse modelo; nenhum agente de modelo não confirmado deve ser lançado como alternativa.
