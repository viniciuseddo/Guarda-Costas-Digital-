## Purpose

Demonstrar o ciclo de proteção da pessoa e resposta do familiar usando a mesma aplicação em dois Androids vinculados à mesma sessão de apresentação.

## ADDED Requirements

### Requirement: Dois papéis e vínculo de demo
O mesmo app MUST oferecer Meu trajeto e Familiar, com identidades fictícias claramente identificadas e vínculo autorizado a uma sala de demo. O app MUST mostrar quem acompanha quem e permitir inverter papéis após encerrar a execução. O Familiar MUST funcionar sem casa cadastrada nem permissões de captura próprias.

#### Scenario: Segundo celular vinculado
- **WHEN** o Android B entra na sala autorizada como Familiar
- **THEN** mostra a identidade fictícia acompanhada e a sessão de A, sem ativar GPS ou microfone de B.

### Requirement: Recepção funcional entre aparelhos
Com ambos os apps visíveis e conectados, o Familiar MUST receber mudanças da mesma execução, mapa, bateria, timestamps, indícios, fotos e áudio. Os dados podem ser mockados, mas os comandos e estados MUST ser compartilhados de verdade. Cópias independentes de telas sem sincronização MUST NOT cumprir o critério de demo em dois aparelhos.

#### Scenario: Incidente disparado em A
- **WHEN** um cenário de incidente é acionado em A
- **THEN** B apresenta o incidente correspondente com o mesmo identificador, conteúdo e sequência de estados.

### Requirement: Resposta proporcional e modos escolhidos
SOS e frase de ajuda MUST gerar alerta direto; suspeitas MUST permitir checagem e confirmação antes de escalar. Modo discreto MUST impedir som automático em A. Modo sonoro MUST permitir sirene curta em A com botão de silenciar, sem encerrar o alerta. Antes de emitir som real, o app MUST exigir que a saída sonora da demo esteja habilitada; autoplay de evidências em B MUST permanecer desativado.

#### Scenario: Alerta sonoro de ensaio
- **WHEN** um alerta ocorre em modo sonoro com saída de ensaio habilitada
- **THEN** A toca sirene limitada e pode silenciá-la sem remover o alerta de B.

#### Scenario: Modo discreto
- **WHEN** o mesmo cenário ocorre em modo discreto
- **THEN** a mudança visual e o recebimento em B ocorrem sem sirene ou fala automática em A.

### Requirement: Reconhecimento humano não é entrega técnica
A interface MUST distinguir criado, sincronizado, apresentado e reconhecido pelo familiar. Reconhecer MUST registrar identidade de demo e horário, sem confirmar chegada ou encerrar o trajeto. Chegada confirmada em A MUST atualizar B e preservar o histórico.

#### Scenario: Familiar confirma recebimento
- **WHEN** B toca em Confirmar recebimento
- **THEN** os dois apps mostram o reconhecimento e o acompanhamento permanece ativo até encerramento explícito em A.

### Requirement: Reconexão e destinatário indisponível
O coordenador MUST preservar o estado para reabertura durante a apresentação. Sem conexão real de B, o sistema MUST NOT alegar apresentação ou reconhecimento humano. Recepção com app fechado ou em background não é requisito; a UI MUST recuperar o estado ao retornar e indicar perda da conexão ao vivo.

#### Scenario: Familiar reconecta
- **WHEN** B volta depois de um alerta
- **THEN** recebe snapshot e eventos pertinentes com horários originais, sem criar outra ocorrência.

### Requirement: Controle do titular e revogação
O familiar MUST NOT iniciar captura real, confirmar chegada ou trocar destinatários do titular. Revogar o vínculo MUST impedir novas consultas e mostrar destinatário indisponível sem cancelar automaticamente o prazo. Controles de apresentação autorizados MUST ser separados das ações que representam autoridade do familiar no produto.

#### Scenario: Familiar tenta encerrar trajeto
- **WHEN** uma ação não autorizada solicita encerrar o trajeto de A a partir de B
- **THEN** a operação é negada e o estado continua coerente nos dois aparelhos.

### Requirement: Acesso explícito à simulação policial
O detalhe de um alerta no Familiar MUST oferecer Simular acionamento policial, levando à prévia de dados e chamada fictícia. MUST NOT mostrar Polícia acionada como um fato real; os estados desse fluxo MUST ser separados do recebimento pelo familiar.

#### Scenario: Familiar abre acionamento
- **WHEN** B escolhe Simular acionamento policial
- **THEN** abre o fluxo de `authority-escalation-demo`, com aviso de que nenhuma ligação ou comunicação real ocorrerá.
