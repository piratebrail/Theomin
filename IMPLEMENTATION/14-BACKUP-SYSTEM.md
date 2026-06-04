# 14 - Sistema de Backup e Migração de Dados (Export/Import)

## Objetivo
Criar uma maneira segura e confiável de migrar os dados do usuário do navegador antigo para o novo ambiente isolado do app, fornecendo ao mesmo tempo uma ferramenta permanente de Backup para o Theomin.

## O Problema
Como o Theomin roda 100% offline usando o IndexedDB do navegador, a mudança para o `--user-data-dir` isolado (necessária para o ícone próprio funcionar) fez com que ele nascesse com um banco de dados em branco. Mover os arquivos binários do banco de dados (LevelDB) entre perfis do navegador manualmente por pastas ocultas do Linux é extremamente arriscado e pode corromper os dados.

## Alternativa Proposta (A Melhor Opção)
Em vez de tentarmos copiar arquivos ocultos do sistema operacional, podemos **implementar nativamente um recurso de Exportar/Importar Backup** dentro do próprio Theomin.

**Como vai funcionar:**
1. Eu instalo a biblioteca oficial `dexie-export-import`.
2. Adiciono dois botões discretos no final da Sidebar: "Exportar Backup" e "Importar Backup".
3. **O seu passo a passo será:**
   - Você abre o seu Brave normal e acessa `http://localhost:5173` (que vai carregar seus dados antigos).
   - Clica em "Exportar". Ele vai baixar um arquivo `theomin-backup.json`.
   - Você fecha, abre o Theomin pelo ícone do App novo (que está em branco).
   - Clica em "Importar", seleciona o arquivo e pronto! Dados migrados perfeitamente.

**Bônus**: Você ganha um sistema de backup para a vida toda, permitindo que você salve seu progresso em um pendrive ou na nuvem quando quiser.

## Open Questions

> [!IMPORTANT]
> Posso prosseguir com a criação desse sistema de Exportar/Importar na Sidebar?
