# Regras de Negócio e Desenvolvimento do ControlTec

## 1. Princípios Gerais
- **Clean Code:** Todo código deve ser legível, com variáveis e funções tendo nomes claros e descritivos.
- **Limite de Linhas:** Nenhum arquivo pode ultrapassar **300 linhas de código**. Se um arquivo estiver chegando a este limite, ele deve ser refatorado ou dividido em componentes menores.
- **Responsividade:** A interface do usuário deve se adaptar de forma fluida a qualquer tamanho de tela (mobile e web/desktop).

## 2. Padrões de Projeto e Arquitetura
- O projeto usa uma variação de Clean Architecture, com separação estrita de camadas.
- Componentes de UI não devem conter regras de negócio complexas.
- Entidades do domínio não devem ter dependências de frameworks externos (Ex: React ou Expo).

## 3. UI, UX e Temas
- **Gluestack UI & NativeWind:** Todos os componentes visuais devem ser baseados no Gluestack UI configurado via Tailwind CSS/NativeWind.
- **Sistema de Cores Desacoplado:** Qualquer cor usada na aplicação deve referenciar uma variável de tema. Não utilize cores "hardcoded" (ex: `text-[#FF0000]`) nos componentes diretamente.
- **Animações (iOS-like):** Priorize animações suaves e fluídas usando transições naturais, fade-ins e feedback visual nas interações.

## 4. Regras do Domínio (Assistência Técnica)
*(A ser expandido conforme as regras específicas de OS, orçamentos, etc)*
- Todo Orçamento (OS) possui status (Aberto, Em Análise, Aprovado, Recusado, Concluído).
- Equipamentos devem estar vinculados a pelo menos um Cliente.
