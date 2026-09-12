## Purpose

Demonstrar como sinais cinemáticos, voz e pedidos explícitos de ajuda iniciam checagens e alertas, aceitando gatilhos mockados com o mesmo contrato de eventos da interface.

## ADDED Requirements

### Requirement: Catálogo de incidentes simulados
A demo MUST permitir disparar possível impacto/queda, possível arrebate, conversa suspeita, frase de socorro e SOS manual. Cada evento MUST incluir origem, horário, motivo e indicação real/simulado. Visualizações de aceleração ou rotação podem ser sintéticas e MUST NOT ser apresentadas como medições reais quando não forem.

#### Scenario: Simular arrebate
- **WHEN** o apresentador escolhe Simular arrebate
- **THEN** o app mostra o indício, sua origem simulada e inicia a checagem e a coleta demonstrativa de registros.

### Requirement: SOS sem espera de classificação
SOS manual e gesto de socorro, real ou simulado, MUST entrar diretamente em alerta, sem aguardar a checagem de suspeita. A função MUST continuar utilizável se o cenário indicar IA indisponível.

#### Scenario: SOS durante checagem
- **WHEN** a pessoa toca em Pedir ajuda durante uma contagem de suspeita
- **THEN** a contagem é promovida imediatamente a alerta e o Familiar recebe o novo estado uma única vez.

### Requirement: Atalho físico demonstrável sem bloquear entrega
O produto conceitual MUST apresentar três pressões de volume+ em até dois segundos como gesto de SOS. A demo MUST oferecer um controle Simular 3 toques em volume+ que gere o evento correspondente. Captura real é opcional; se habilitada, MUST distinguir três pressões de auto-repeat e informar quais estados de tela foram validados.

#### Scenario: Sem integração de tecla física
- **WHEN** o controle Simular 3 toques em volume+ é acionado
- **THEN** o fluxo de SOS ocorre com rótulo de simulação e a demo não exige alteração de permissões de acessibilidade.

### Requirement: Suspeita, confirmação e deduplicação
Indícios de movimento e contexto de voz MUST abrir checagem com prazo. Confirmar segurança MUST resolver como falso alarme sem encerrar o trajeto; não responder MUST gerar alerta. Eventos repetidos ou correlacionados durante incidente aberto MUST enriquecer o mesmo incidente, sem duplicar contagens ou sirenes.

#### Scenario: Dois sinais do mesmo incidente
- **WHEN** movimento e voz são disparados durante a mesma checagem
- **THEN** o incidente mostra ambas as origens e mantém uma única sequência de escalonamento.

### Requirement: Linguagem de indício
O sistema MUST usar descrições como Possível impacto e Conversa suspeita, sem declarar diagnóstico, crime confirmado ou precisão de detector inexistente. Cobertura por sensores reais e avaliação de modelo MUST ser evolução opcional, não critério de aceitação da interface mockada.

#### Scenario: Exibição do motivo
- **WHEN** o familiar consulta um evento cinemático de exemplo
- **THEN** vê motivo e rótulo simulado, sem percentual de acurácia apresentado como medido.
