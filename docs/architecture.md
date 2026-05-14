# Arquitetura do ControlTec

## Organização de Pastas
O projeto é estruturado em diretórios para separar responsabilidades de acordo com os princípios do Clean Code.

- `src/app`: Telas principais baseadas no Expo Router (navegação em arquivo). Representa a camada de Apresentação.
- `src/ui`: Componentes de interface.
  - `/components`: Componentes burros (dumb components) e reutilizáveis (botões, cards, inputs). Baseados no Gluestack UI.
  - `/themes`: Sistema de temas desacoplado (cores, tipografia, espaçamentos).
- `src/core`: Regras de negócio puras (Independente de Framework).
  - `/domain`: Entidades, Modelos e Interfaces.
  - `/usecases`: Regras específicas do sistema de OS (orçamentos, ordens de serviço).
- `src/services`: Camada de comunicação externa. Requisições API, serviços de Storage e Integrações de banco de dados.

## Padrões Adotados
1. Injeção de Dependências ou Repositórios para acesso a dados, evitando chamadas diretas a APIs dentro das telas (app) ou domínios.
2. Componentes UI devem aceitar as propriedades necessárias para renderização, e delegar ações para as telas via callbacks.
3. Arquivos TypeScript devem conter a extensão `.ts` e componentes `.tsx`.
