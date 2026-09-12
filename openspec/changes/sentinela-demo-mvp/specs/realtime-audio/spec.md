## Purpose

Comunicar pela interface a proposta de escuta e análise de voz durante o trajeto, com respostas simuladas reproduzíveis e possibilidade de integrar um provedor real posteriormente.

## ADDED Requirements

### Requirement: Escuta demonstrativa restrita à sessão
A experiência MUST mostrar escuta somente durante o acompanhamento, distinguindo Escuta simulada de Microfone ativo. A demo padrão MUST usar sequência e trechos de exemplo sem abrir microfone ou transmitir áudio ambiente. Encerrar o trajeto MUST parar a animação e novos eventos de análise.

#### Scenario: Sessão mockada ativa
- **WHEN** o trajeto simulado começa
- **THEN** o app exibe Escuta simulada, uma visualização de áudio de exemplo e estado de análise, sem solicitar permissão de gravação.

### Requirement: Cenários de voz com ações funcionais
A demo MUST oferecer fala neutra, conversa suspeita, frase de socorro e IA indisponível. Cada cenário MUST produzir a categoria, motivo, timestamp e ação correspondente na sessão compartilhada. Conversa suspeita MUST iniciar checagem; frase de socorro configurada MUST propor alerta direto.

#### Scenario: Conversa suspeita mockada
- **WHEN** o apresentador escolhe o cenário de conversa suspeita
- **THEN** a interface mostra um trecho de exemplo identificado, a análise simulada e a ação de checagem, refletida no Familiar.

#### Scenario: Falha de IA mockada
- **WHEN** o cenário indica IA indisponível
- **THEN** a interface informa o estado e mantém SOS e checagem de chegada funcionais.

### Requirement: Ações da IA são limitadas
Mesmo em demonstração, ações propostas MUST passar pelas regras de sessão e não podem alterar destinatários, encerrar trajeto, confirmar chegada, apagar registros ou acionar autoridades reais. Eventos atrasados ou duplicados MUST NOT reabrir sessão encerrada. A simulação de acionamento policial MUST ser iniciada explicitamente pelo Familiar, não por instrução de áudio.

#### Scenario: Fala pede para cancelar proteção
- **WHEN** o cenário de áudio contém uma instrução de encerrar a sessão ou trocar o familiar
- **THEN** a interface mostra ação não permitida, mantendo sessão e destinatário inalterados.

### Requirement: Nenhuma fala espontânea no modo discreto
No aparelho acompanhado, o modo discreto MUST impedir fala automática e reprodução automática de exemplos. Trechos de áudio no Familiar MUST depender de toque explícito. Reprodução da própria demo MUST NOT alimentar uma cadeia infinita de novos incidentes.

#### Scenario: Chega trecho de áudio ao Familiar
- **WHEN** um trecho de exemplo fica disponível
- **THEN** o familiar vê duração e botão de reprodução, sem ouvir áudio até acioná-lo.

### Requirement: Áudio real opcional é consentido
Se houver integração real, o app MUST indicar fonte efetiva celular/fone, solicitar consentimento, informar provedor e transmissão, limitar escuta à sessão e guardar segredos fora do cliente. Sem integração real validada, MUST manter a origem mockada visível e considerar o fluxo demonstrativo suficiente para aceitação.

#### Scenario: Fone não disponível para captura real
- **WHEN** o dispositivo de áudio solicitado não está acessível
- **THEN** o app informa a limitação e só usa fonte alternativa real consentida ou fonte simulada explicitamente identificada.
