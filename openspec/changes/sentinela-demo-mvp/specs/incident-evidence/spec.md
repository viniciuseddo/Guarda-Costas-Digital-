## Purpose

Mostrar como fotos, áudio e contexto temporal/geográfico chegam ao familiar e compõem um pacote de incidente, usando registros de exemplo autorizados quando não houver captura real.

## ADDED Requirements

### Requirement: Galeria de registros vinculada ao incidente
Abrir incidente MUST disponibilizar progressivamente fotos e áudio na timeline, vinculados à mesma sessão e execução nos dois aparelhos. A demo MUST incluir imagens de ambiente, como caminho e fachada, e rótulos frontal/traseira quando representarem essas fontes. Assets mockados MUST aparecer como Mídia de exemplo, não como foto recém-capturada.

#### Scenario: Fotos no Familiar
- **WHEN** o roteiro libera duas fotos do incidente
- **THEN** o familiar pode abrir ambas, consultar origem e timestamps e voltar à timeline sem perder o estado.

### Requirement: Pré-evento de áudio com duração honesta
A demo MUST mostrar a ideia de até 30 segundos de áudio anteriores ao gatilho e trecho posterior limitado. O arquivo de exemplo MUST ter duração coerente com o player e seu intervalo apresentado; simulação MUST NOT alegar recuperar áudio real que nunca foi gravado.

#### Scenario: Trecho de exemplo curto
- **WHEN** o asset disponível tem dez segundos
- **THEN** o player e a timeline indicam dez segundos e Mídia de exemplo, sem inventar 30 segundos de gravação.

### Requirement: Timestamp e localização são contextualizados
Cada registro MUST mostrar horário de captura ou horário atribuído no cenário, horário de recebimento, posição referenciada, idade e precisão disponíveis. Horário de cenário MUST ser distinguido de horário de uma captura real. Posição antiga MUST NOT ser atribuída como coordenada exata da foto.

#### Scenario: Foto com localização antiga
- **WHEN** a foto do cenário referencia uma posição anterior
- **THEN** o detalhe indica última posição conhecida e sua idade, sem afirmar captura no ponto exato.

### Requirement: Estados de envio e falha interativos
A interface MUST representar pendente, enviando, disponível e falhou. Repetir envio MUST atualizar o mesmo registro sem duplicá-lo. Um alerta MUST aparecer independentemente de mídia pendente. No mock, assets empacotados podem ser sincronizados por identificador, mas a transmissão do arquivo MUST ser rotulada como simulada.

#### Scenario: Falha de foto seguida de retry
- **WHEN** o apresentador injeta falha e o familiar ou operador solicita nova tentativa
- **THEN** o mesmo registro passa a disponível após a resposta do cenário e permanece uma única vez na galeria.

### Requirement: Dados fictícios e acesso restrito por sala
Por padrão a demo MUST usar imagens e áudios fictícios, licenciados ou de participantes consentidos. Registros MUST ficar restritos à sala vinculada, sem links públicos e sem credenciais no app. Reset MUST afetar apenas a execução autorizada e invalidar a exibição de registros antigos; não há exigência de arquivo pericial ou retenção de produção nesta entrega.

#### Scenario: Outra sala solicita a galeria
- **WHEN** um participante sem vínculo tenta consultar os registros de outra sala
- **THEN** a consulta é negada e nenhum asset privado ou metadado é exposto.

### Requirement: Pacote demonstrativo consistente
O app MUST reunir registros selecionados, motivo, sessão, posição e timestamps em uma prévia usada no acionamento policial simulado. Dados mockados MUST manter seus rótulos dentro do pacote. O pacote MUST NOT ser enviado a autoridade real nem apresentado como prova pericial certificada.

#### Scenario: Preparar dados para simulação
- **WHEN** o familiar seleciona registros para o pacote
- **THEN** a prévia lista os mesmos itens da timeline, com suas origens e lacunas, sem inventar mídia que não existe no cenário.
