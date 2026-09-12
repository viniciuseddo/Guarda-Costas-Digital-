# Sentinela - Demonstração Mock-First (PWA + Coordenador Node)

Aplicativo PWA único e coordenador TypeScript/Node em tempo real para demonstração de segurança pessoal no campus universitário com dois aparelhos Android sincronizados.

---

## ⚡ Como Rodar em 1 Minuto

### 1. Iniciar o Coordenador
```bash
npm run build
npm start
```
O coordenador iniciará em:
`http://localhost:3000` (ou porta definida em `PORT`).

Para rodar na rede local/hotspot Wi-Fi com os celulares Android:
1. Conecte os dois celulares e o computador na mesma rede Wi-Fi / Hotspot.
2. Descubra o IP do computador (ex: `ipconfig` no Windows -> `192.168.1.50`).
3. No Chrome de cada Android, acesse:
   `http://192.168.1.50:3000`
4. Toque em **"Adicionar à tela inicial"** para instalar como PWA nativo (opcional).

---

## 📱 Roteiro da Demonstração (Ensaio de 2 Aparelhos)

| Aparelho | Papel | Ação Inicial |
|---|---|---|
| **Android A** | **Meu Trajeto** (Alex) | Entrar na sala `sala-demo` (PIN `1234`) como **Meu Trajeto**. Escolher modo discreto e tocar em **Iniciar Trajeto**. |
| **Android B** | **Familiar** (Mariana) | Entrar na mesma sala `sala-demo` como **Familiar**. |

### Sequência do Roteiro de Apresentação:
1. **Acompanhamento ao vivo:** No Android B, veja o marcador avançar ao longo da rota ilustrativa da Biblioteca à Portaria, com telemetria sincronizada em tempo real.
2. **Simulação de Indício (Impacto / Queda):**
   - No Android A, toque em **Simular Queda/Impacto**.
   - O Android A entra em contagem regressiva de checagem (10 segundos).
3. **Escalonamento para Alerta:**
   - Deixe o tempo expirar ou toque em **SOS**.
   - O Android B recebe o alerta imediatamente com vibração e detalhes do indício.
4. **Reconhecimento Humano:**
   - No Android B, toque em **Confirmar Recebimento Humano** (marca reconhecimento auditável sem encerrar o trajeto).
5. **Registros e Evidências:**
   - No Android B, explore a galeria com as fotos da fachada/caminho e ouça o áudio ambiental de 12s no player explícito (sem autoplay).
6. **Simulação Policial Fictícia (100% interna):**
   - No Android B, toque em **Simular Acionamento Policial**.
   - Veja a prévia do pacote com o aviso persistente: *"SIMULAÇÃO: Nenhuma ligação ou envio real será realizado"*.
   - Inicie a chamada/envio fictícios e acompanhe a transição com identificador estável `DEMO-run-XXX`.
7. **Resolução e Chegada Segura:**
   - No Android A, toque em **Confirmar Chegada**.
   - O trajeto é concluído em segurança e ambos os aparelhos registram a resolução preservando o histórico.

---

## ⚙️ Controles do Apresentador

Toque no botão **⚙️ Controles** no topo da tela para:
- **Pausar / Retomar Cenário:** congela a simulação sem afetar a detecção de perda real de conexão.
- **Avançar +5s / +10s:** acelera a rota ou contagem.
- **Inverter Papel (A ⇄ B):** alterna instantaneamente quem caminha e quem acompanha.
- **Resetar Sala:** limpa a execução com confirmação e inicia nova rodada.

---

## 🧪 Testes Automatizados

Para rodar toda a suíte de testes (24 testes cobrindo contratos, transições, relógios, fixtures, autorização, idempotência, persistência e API HTTP/SSE):
```bash
npm test
```
