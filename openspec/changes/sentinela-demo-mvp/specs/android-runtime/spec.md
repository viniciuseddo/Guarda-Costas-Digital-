## Purpose

Executar uma demonstração Android previsível em dois aparelhos, separando simulação sem permissões de integrações reais opcionais e seus limites de plataforma.

## ADDED Requirements

### Requirement: Mesmo app e demo sem permissões sensíveis
A mesma PWA MUST oferecer Meu trajeto e Familiar nos navegadores Android e permitir instalação na tela inicial em contexto HTTPS compatível. MUST incluir manifesto e cache da interface/ativos sem cachear respostas privadas da API; funcionamento offline MUST mostrar ausência de sincronização, não inventar recebimento. APK nativo e SDK Android não são requisitos da entrega, conforme mudança autorizada pelo usuário. A demonstração mockada MUST funcionar sem conceder localização, câmera, microfone, acessibilidade ou permissão de chamadas. O papel Familiar MUST receber os dados da sala sem ativar sensores do próprio aparelho.

#### Scenario: Instalação sem permissões
- **WHEN** os participantes abrem a demo e recusam todas as permissões de captura
- **THEN** conseguem executar os cenários mockados e consultar mapa, fotos e áudio de exemplo.

### Requirement: Simulação e capacidade real são distintas
O app MUST indicar Modo demonstração e a origem das capacidades usadas. MUST NOT exibir indicador próprio de gravação real para uma animação mockada. Uma capacidade real opcional MUST só ser anunciada como ativa após consentimento, permissão e verificação de funcionamento; sua falha MUST permitir retornar à fonte simulada explicitamente identificada.

#### Scenario: Microfone não integrado
- **WHEN** o cenário reproduz a experiência de análise de voz sem abrir o microfone
- **THEN** a interface mostra Escuta simulada e continua o roteiro, sem alegar que está ouvindo o ambiente.

### Requirement: Continuidade da sessão de apresentação
Trocar de tela ou colocar o app em background MUST NOT marcar chegada. O coordenador MUST preservar a sessão para recuperação ao reabrir. Na aceitação principal os dois apps ficam visíveis; operação prolongada com tela bloqueada e captura real MUST NOT ser exigidas para aprovar a demo mockada.

#### Scenario: Familiar reabre o aplicativo
- **WHEN** o receptor volta ao app após sair durante um alerta
- **THEN** recupera o estado compartilhado e vê o horário original, sem duplicação de incidentes.

### Requirement: Integrações Android opcionais respeitam a plataforma
Se captura real for habilitada futuramente na demo, o app MUST iniciar serviços adequados por ação do usuário com interface visível, respeitar indicadores e encerrar captura ao terminar a sessão. MUST NOT prometer permissões irrestritas ou processo imortal. Atalho físico ou captura bloqueada não validados MUST aparecer como simulados ou indisponíveis.

#### Scenario: Captura real revogada
- **WHEN** uma permissão real habilitada é revogada
- **THEN** a captura para e a interface sinaliza indisponibilidade ou troca explicitamente para mock, sem mascarar a mudança.
