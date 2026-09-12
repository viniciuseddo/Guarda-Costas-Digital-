## Purpose

Ilustrar no aplicativo do familiar como um possível acionamento policial e compartilhamento de contexto poderiam funcionar, exclusivamente por uma simulação interativa sem comunicação com autoridades reais.

## ADDED Requirements

### Requirement: Entrada e aviso de simulação
Somente a partir do detalhe de alerta no Familiar o app MUST oferecer Simular acionamento policial. Todas as telas e estados do fluxo MUST exibir Simulação e a informação Nenhuma ligação ou envio real será realizado. O rótulo MUST permanecer visível também em telas de conclusão e detalhes acessados isoladamente.

#### Scenario: Familiar inicia o fluxo
- **WHEN** B toca em Simular acionamento policial
- **THEN** vê o aviso e a prévia do pacote antes de iniciar a chamada fictícia.

### Requirement: Prévia do pacote de contexto
O app MUST mostrar pessoa fictícia acompanhada, motivo do alerta, última posição com idade/precisão, timestamps e fotos/áudios disponíveis. O familiar MUST poder selecionar os registros da demo e revisar o pacote. Itens pendentes MUST ser identificados, sem aparecer como entregues.

#### Scenario: Foto ainda indisponível
- **WHEN** o pacote inclui um registro cujo envio de cenário está pendente
- **THEN** a prévia o marca como pendente e permite seguir com os dados disponíveis, sem inventar conclusão do envio.

### Requirement: Chamada e transmissão encenadas
O fluxo MUST oferecer estados preparando pacote, chamada simulada em andamento, envio simulado e recebimento fictício, acionados por escolhas e relógio de cenário. Um identificador de acompanhamento MUST usar prefixo DEMO e rótulo de referência fictícia, nunca protocolo oficial. O sistema MUST permitir cancelar ou repetir sem duplicar a ocorrência.

#### Scenario: Fluxo concluído
- **WHEN** a sequência simulada chega ao fim
- **THEN** o Familiar mostra Pacote recebido na simulação, referência DEMO e resumo do conteúdo, sem afirmar que uma autoridade foi informada.

#### Scenario: Cancelamento
- **WHEN** o familiar cancela a chamada simulada
- **THEN** o fluxo retorna ao alerta, registra cancelamento fictício e mantém o acompanhamento e os registros existentes.

### Requirement: Não executar efeitos externos
Esta capacidade MUST NOT abrir o discador, solicitar permissão de chamadas, usar números de emergência, enviar SMS/e-mail, acessar endpoints de polícia ou produzir áudio de conversa com autoridade real. O transporte permitido MUST se limitar à sincronização interna da sala de demo. Identidade visual MUST NOT usar brasões oficiais ou fingir afiliação institucional.

#### Scenario: Confirmar envio na simulação
- **WHEN** o familiar confirma Enviar na simulação
- **THEN** somente o estado interno da sala é atualizado; nenhuma chamada, mensagem ou requisição para autoridade é executada.

### Requirement: Falha simulada e consistência
O operador MUST poder simular falha e nova tentativa de envio. Os aparelhos MUST mostrar o mesmo estado da referência fictícia. Reconhecimento do familiar MUST continuar separado de recebimento policial simulado e de chegada segura.

#### Scenario: Falha seguida de nova tentativa
- **WHEN** a primeira tentativa mockada falha e B tenta novamente
- **THEN** a mesma referência DEMO transita para envio simulado e conclusão fictícia, sem duplicar alerta nem marcar chegada.
