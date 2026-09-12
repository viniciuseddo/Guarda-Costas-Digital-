## Purpose

Demonstrar o acompanhamento de um trajeto e seu compromisso de chegada por estados interativos coerentes, usando dados mockados ou fontes reais explicitamente identificadas.

## ADDED Requirements

### Requirement: Setup e início com um toque
O app MUST permitir confirmar destino, familiar vinculado e modo discreto ou sonoro. A demo MUST oferecer dados fictícios pré-preenchidos e ponto de chegada no campus identificado como destino de demonstração. Com setup válido, iniciar MUST criar uma sessão compartilhada sem redigitar endereço.

#### Scenario: Início da apresentação
- **WHEN** a pessoa toca em Iniciar trajeto com o setup de demo pronto
- **THEN** vê destino, ETA, prazo e familiar, e o segundo aparelho passa a mostrar a mesma sessão após confirmação do coordenador.

### Requirement: ETA e prazo são estados funcionais
O sistema MUST distinguir ETA de prazo de segurança e manter um relógio de cenário compartilhado entre os aparelhos. O percurso e o tempo podem ser mockados, mas avanço, pausa, extensão e vencimento MUST alterar o estado e a interface de forma consistente. Recalcular ETA MUST NOT estender silenciosamente o prazo; extensão MUST ser explícita.

#### Scenario: Prazo vencido
- **WHEN** o relógio do cenário ultrapassa prazo e tolerância sem confirmação de chegada
- **THEN** a sessão gera alerta de chegada não confirmada no Familiar, sem depender de detecção por sensores.

#### Scenario: Extensão solicitada
- **WHEN** a pessoa solicita mais tempo
- **THEN** ambos os aparelhos mostram o prazo confirmado pelo coordenador; se a comunicação falhar, a extensão fica pendente e o prazo anterior continua indicado.

### Requirement: Telemetria com origem e tempos
Durante o cenário o sistema MUST apresentar posição, precisão, bateria e horários de medição e recebimento. Dados sintéticos MUST estar identificados como simulados. Posição atrasada MUST aparecer como última conhecida e não substituir uma medição mais recente na visualização atual.

#### Scenario: Ponto atrasado
- **WHEN** um ponto mais antigo chega depois de um ponto recente
- **THEN** ele pode integrar o histórico, mas não move o marcador atual para trás nem recebe rótulo de posição ao vivo.

### Requirement: Chegada exige ação explícita
Aproximar-se do destino MUST oferecer confirmação, sem encerrar automaticamente. Confirmar segurança em uma suspeita MUST resolver somente o incidente; confirmar chegada MUST encerrar o trajeto e comunicar resolução ao Familiar. Navegar entre telas MUST NOT encerrar uma sessão.

#### Scenario: Confirmação após alerta
- **WHEN** a pessoa confirma chegada depois de um alerta
- **THEN** o Familiar vê a resolução e mantém o histórico do alerta, em vez de perder o registro.

### Requirement: Bateria e desconexão não encerram como seguro
Bateria crítica ou desconexão do aparelho acompanhado, reais ou simuladas, MUST NOT cancelar o prazo de chegada. A interface MUST distinguir falha simulada do cenário de perda real da conexão da demo. Apenas uma sessão aceita pelo coordenador pode ser anunciada como acompanhada no segundo aparelho.

#### Scenario: Bateria crítica simulada
- **WHEN** o apresentador aciona bateria crítica e perda de sinal do cenário
- **THEN** o Familiar vê último sinal e possível indisponibilidade por bateria, e o prazo continua até confirmação ou alerta.

#### Scenario: Sem coordenador no início
- **WHEN** o primeiro aparelho não consegue registrar a sessão compartilhada
- **THEN** o app mostra Sem conexão com a demo e não alega que o Familiar já recebe dados.

### Requirement: Reinício de cenário isolado
Reiniciar a apresentação MUST exigir confirmação e produzir uma nova execução identificável somente para a sala de demo autorizada. MUST NOT apagar dados de outras salas ou permitir que eventos tardios da execução anterior modifiquem a nova.

#### Scenario: Evento antigo após reset
- **WHEN** um evento da execução anterior chega após reiniciar
- **THEN** ele é ignorado para o estado atual e os dois aparelhos continuam na nova execução.
