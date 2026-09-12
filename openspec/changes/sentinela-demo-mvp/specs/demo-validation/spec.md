## Purpose

Definir uma entrega de hackathon centrada em interface interativa e comunicação clara da ideia, com dados mockados permitidos e apresentação coerente em dois Androids no campus.

## ADDED Requirements

### Requirement: Mock-first é aceitação suficiente
O roteiro completo MUST poder ser aprovado com sensores, GPS, IA, bateria, fotos, áudio e autoridade simulados. Não é obrigatório treinar modelo, integrar API paga, capturar com tela bloqueada ou fazer chamada real. As ações da interface e a sincronização entre os dois aparelhos MUST funcionar, não apenas reproduzir screenshots independentes.

#### Scenario: Demo sem serviços externos de IA e captura
- **WHEN** todas as fontes sensíveis estão configuradas como mock
- **THEN** o apresentador consegue demonstrar acompanhamento, indício, alerta, registros, resposta do familiar, acionamento policial simulado e chegada.

### Requirement: Controle reproduzível de apresentação
O operador autorizado MUST ter controles de iniciar roteiro, pausar relógio de cenário, avançar etapa, disparar incidente, alternar falhas e reiniciar a própria sala. A execução MUST ter identificador, sequência e estado compartilhados. Pausa do cenário MUST NOT esconder falhas reais de conexão.

#### Scenario: Repetir apresentação
- **WHEN** o operador confirma reiniciar a sala
- **THEN** ambos os apps voltam ao início da nova execução, sem eventos, mídia selecionada ou referência policial da execução anterior.

### Requirement: Origem dos dados visível sem interromper o fluxo
A interface MUST manter indicação de demonstração e identificar mock, captura real opcional e resposta externa simulada nos detalhes pertinentes. A narrativa pode ser visualmente realista, mas MUST NOT afirmar que uma emergência, detecção validada ou atendimento público aconteceu de fato.

#### Scenario: Mostrar conclusão policial isoladamente
- **WHEN** a tela final do acionamento é exibida sem as telas anteriores
- **THEN** ainda fica claro que é simulação e que nenhuma autoridade foi acionada.

### Requirement: Cenários mínimos funcionais
A aceitação MUST cobrir chegada normal, suspeita cancelada, suspeita não respondida, SOS manual, gesto de volume simulado, voz suspeita, frase de socorro, bateria crítica, perda de sinal, envio de mídia com falha/retry, reconhecimento do familiar e acionamento policial simulado com cancelamento/falha/retry. MUST incluir ambos os modos de resposta.

#### Scenario: Conjunto de roteiros
- **WHEN** o responsável revisa a entrega
- **THEN** cada cenário possui passos reproduzíveis e resultado observável, com aprovação ou pendência explícita, sem depender de classificadores reais.

### Requirement: Usabilidade e acabamento da interface
O app MUST manter rótulos em português brasileiro, navegação consistente, estados de carregamento/vazio/erro e ações sem becos sem saída. MUST ser utilizável nas duas telas Android escolhidas, com alvos de toque de pelo menos 48 dp, contraste adequado e estado não comunicado apenas por cor. Contagens e progresso MUST corresponder ao estado do cenário, não a animações desconectadas.

#### Scenario: Tela menor e fonte ampliada
- **WHEN** o roteiro é executado no menor aparelho com tamanho de fonte ampliado
- **THEN** os botões essenciais e avisos de simulação continuam legíveis e acessíveis, sem texto cortado bloquear a ação.

### Requirement: Ensaio no campus com dois celulares
A aceitação MUST registrar os dois modelos Android, versão do mesmo app e condições de conectividade. MUST ensaiar o roteiro no campus com participantes consentidos, destino demonstrativo e som autorizado. Dados mockados podem substituir o deslocamento real; o segundo celular MUST receber os comandos e estados da sala efetivamente utilizada.

#### Scenario: Apresentação ao vivo
- **WHEN** A executa Meu trajeto e B executa Familiar na rede escolhida
- **THEN** o público vê o mesmo incidente, registros e timestamps em ambas as telas, e pode observar as ações de reconhecer e simular atendimento alterando o estado compartilhado.

### Requirement: Isolamento e ausência de efeitos públicos
A validação MUST comprovar isolamento entre salas, negação de comandos de papel indevido, ausência de segredos no cliente e inexistência de ligações ou envios a autoridades. Rotinas de reset MUST limitar-se a dados de demo autorizados. Integrações reais opcionais MUST ter consentimento e indicar suas falhas sem impedir os cenários mockados.

#### Scenario: Verificação da simulação policial
- **WHEN** todo o fluxo policial é executado
- **THEN** a inspeção de permissões, intents e tráfego confirma que apenas o coordenador interno foi usado, sem serviços públicos.

### Requirement: Planejamento separado de execução
A conclusão dos artefatos MUST ser reportada como planejamento pronto para revisão, não como aplicativo implementado. As tarefas MUST permanecer desmarcadas até execução futura. Subagents de implementação solicitados pelo usuário MUST usar exclusivamente swe-2 verificável; na ausência desse controle, a delegação permanece bloqueada, sem troca silenciosa de modelo.

#### Scenario: Entrega destas specs
- **WHEN** os artefatos são validados estruturalmente
- **THEN** a entrega distingue arquivos produzidos de testes e desenvolvimento ainda não executados.
