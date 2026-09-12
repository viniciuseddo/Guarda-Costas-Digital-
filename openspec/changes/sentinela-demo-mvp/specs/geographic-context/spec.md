## Purpose

Apresentar contexto espacial do trajeto e do incidente de modo claro e visualmente convincente, aceitando mapa e posições de demonstração sem atribuir risco real ao campus.

## ADDED Requirements

### Requirement: Mapa interativo de percurso
A demo MUST mostrar origem, destino e posição em um mapa que permita explorar o percurso e abrir o ponto do incidente. Posições e base cartográfica podem ser fixtures ou esquema ilustrativo, mas MUST manter correspondência espacial entre os dois aparelhos e rótulo de origem. O percurso registrado MUST ser distinguido do trajeto planejado.

#### Scenario: Percurso mockado avança
- **WHEN** o relógio do cenário avança para o próximo ponto
- **THEN** A e B mostram a mesma posição lógica, com atualização de ETA e acesso ao detalhe espacial.

### Requirement: Fonte indisponível não quebra apresentação
A demo MUST disponibilizar base e rota de exemplo sem depender de uma API de mapas paga ou online. Mapa ilustrativo MUST ser identificado como tal e MUST NOT apresentar coordenadas fictícias como GPS real. Uso opcional de mapa real MUST respeitar licença e atribuição.

#### Scenario: Serviço externo indisponível
- **WHEN** a fonte online não responde
- **THEN** o mapa de demonstração continua utilizável e mostra que a base é ilustrativa, sem tela vazia bloqueante.

### Requirement: Idade e precisão da localização
Toda posição MUST mostrar timestamp e precisão disponível ou indicar valor não disponível. Dados antigos MUST ser identificados como última posição conhecida. Proximidade do destino MUST apenas sugerir chegada, nunca confirmá-la automaticamente.

#### Scenario: Último ponto após perda de sinal
- **WHEN** o cenário interrompe atualizações do acompanhado
- **THEN** B mantém o último marcador e sua idade crescente, sem continuar animando uma suposta posição atual.

### Requirement: Zonas de contexto com origem explícita
A demo MUST incluir polígonos de contexto e aviso de entrada visual/háptico. Dados sintéticos MUST ser rotulados como Zona de demonstração e não associar o campus a crime real. Se dados históricos reais forem usados, MUST incluir fonte, período, categoria e granularidade. Entrada isolada MUST NOT gerar alerta policial ou sirene.

#### Scenario: Entrada em polígono sintético
- **WHEN** o cenário cruza uma zona de demonstração
- **THEN** o app mostra aviso contextual e legenda sintética, sem declarar área perigosa real ou acionar emergência.

### Requirement: Oscilação e privacidade
Oscilações na borda MUST evitar avisos repetidos segundo a configuração do cenário. Mapa e trajetória da sala MUST ser acessíveis somente a seus participantes autorizados; a demo MUST usar destino fictício ou público autorizado em vez de endereço residencial real por padrão.

#### Scenario: Acesso de outra sala
- **WHEN** um participante tenta consultar trajeto de sala não vinculada
- **THEN** nenhuma posição ou metadado dessa sala é revelado.
