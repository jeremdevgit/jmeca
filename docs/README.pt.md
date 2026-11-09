# JMeca

[English](../README.md) · [Français](../README.fr.md)

Rastreador de manutenção de veículos de desktop para Windows, macOS e Linux.

👉 **[Baixar instaladores para Windows, macOS e Linux](https://github.com/jeremdevgit/jmeca/releases/tag/v0.2.0-beta.1)**. Windows: `.exe`; macOS universal: `.pkg` ou `.dmg`; Debian/Ubuntu: `.deb`. As somas SHA-256 estão em `SHA256SUMS.txt`.

A interface segue o idioma do seu sistema na primeira inicialização. Você pode alterá-lo no aplicativo.

## Recursos

- Gerencie vários veículos em pastas de clientes e pesquise sua frota.
- Rastreie peças e lembretes de manutenção personalizados por data e quilometragem.
- Mantenha registros de serviços, faturas, fotos e documentos cadastrais em um cofre criptografado.
- Registre o consumo e as despesas de combustível. Pesquise postos de combustível franceses usando dados abertos oficiais.
- Escolha em um catálogo off-line de 53.596 versões (1980–2026), um A3 8P 3D personalizável e silhuetas genéricas.

## Experimente a demonstração

Instale os pré-requisitos do Tauri e execute `npm ci` e `npm run desktop:dev`. A demonstração usa dados fictícios.

Para dados pessoais, use uma senha de pelo menos 12 caracteres e exporte um backup criptografado para outra unidade.

## Segurança e limitações

- O conteúdo do Vault é criptografado em repouso com AES-256-GCM. Um computador comprometido pode acessar um cofre enquanto ele está desbloqueado.
- Verifique os intervalos de manutenção e as peças compatíveis com o manual do seu veículo exato. O catálogo não é um banco de dados de manutenção certificado.
- A pesquisa de estações usa dados abertos oficiais franceses, não uma API da Essence&Co. Os lembretes aparecem apenas enquanto o aplicativo está aberto.
- Esta versão é adequada para uma garagem pessoal ou uma pequena oficina local, não para uma grande frota multiusuário.

Veja a documentação completa em inglês e licenças de terceiros. [README.md](../README.md) · [THIRD_PARTY.md](../THIRD_PARTY.md)
