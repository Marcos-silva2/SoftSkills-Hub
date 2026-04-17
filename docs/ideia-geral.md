# 🚀 Projeto: SoftSkills Hub

## 📖 Visão Geral
O **SoftSkills Hub** é um ecossistema digital (Web/App) focado em promover a saúde mental e o desenvolvimento socioemocional de jovens aprendizes que enfrentam os desafios da inserção no mercado de trabalho. 

O projeto atua na intersecção de dois Objetivos de Desenvolvimento Sustentável (ODS) da ONU:
* **ODS 3 (Saúde e Bem-Estar):** Oferecendo um espaço seguro de escuta, descompressão e educação emocional.
* **ODS 9 (Indústria, Inovação e Infraestrutura):** Utilizando tecnologia, banco de dados e inteligência de negócios para estruturar a gestão escolar/corporativa.

---

## 🏛️ Arquitetura do Sistema (As Duas Pontas)

O sistema foi desenhado para eliminar as "ilhas de informação" entre o que o jovem sofre nas empresas e o que a escola ensina, dividindo-se em duas interfaces principais:

### 1. Interface do Aprendiz (O Coletor - SPT)
Focada em **Experiência do Usuário (UX)** e **Segurança Psicológica**, atuando como um Sistema de Processamento de Transações (SPT).
* **Anonimato Garantido:** O jovem cria um nome de usuário livre, informando apenas dados demográficos estratégicos (Idade, Gênero, Empresa) sem vínculo com seu nome real.
* **Pesquisa de Clima Ativa:** Enquetes anônimas sobre problemas reais enfrentados no trabalho (assédio, desvio de função, sobrecarga, etc.) e níveis de satisfação.
* **Momento Descompressão:** Minijogos integrados para redução rápida de estresse e ansiedade.
* **Trilhas de Soft Skills:** Artigos e pílulas de conhecimento sobre inteligência emocional, comunicação e postura profissional.
* **Mural da Comunidade:** Espaço seguro para troca de mensagens de apoio entre os próprios jovens.

### 2. Interface da Gestão (O Dashboard - SIG)
Focada em **Inteligência de Dados** para professores e diretores, atuando como um Sistema de Informação Gerencial (SIG).
* **Painel Analítico:** Transforma os votos anônimos dos alunos em gráficos dinâmicos em tempo real.
* **Decisão Baseada em Dados:** Permite que a coordenação pedagógica identifique tendências (ex: "70% da turma está sofrendo desvio de função na empresa X") e planeje intervenções ou aulas específicas, abandonando o "achismo".
* **Filtros Estratégicos:** Cruzamento de dados por Gênero, Idade e Empresa para identificar focos de problemas estruturais.

---

## ⚙️ Requisitos Principais

### Requisitos Funcionais (O que o sistema faz)
- [x] Cadastro com coleta de dados demográficos (Idade, Gênero, Empresa).
- [x] Sistema segregado de Login (Aprendiz vs. Gestão).
- [x] Formulários de enquetes de múltipla escolha e escala Likert (1 a 5).
- [x] Mural interativo de mensagens da comunidade (com rate limiting e moderação admin).
- [x] Módulo de leitura de artigos educativos (Soft Skills) com CRUD pelo gestor.
- [x] Dashboard gerencial de consolidação de respostas (KPIs, ranking, satisfação por empresa).
- [x] Jogo de memória corporativa (Memória Corporativa) para descompressão.
- [x] Dark mode com transição suave e persistência em `localStorage`.
- [x] Conta de admin para moderação do mural (`aprendiz-adm`).

### Requisitos Não Funcionais (Como o sistema se comporta)
* **Privacidade (LGPD):** A arquitetura do banco de dados não cria relacionamentos diretos entre a tabela de usuários e a tabela de respostas, garantindo o anonimato absoluto das enquetes.
* **Desempenho (SPA):** Construído como uma *Single Page Application* (SPA) com HTML, CSS e JavaScript, garantindo navegação instantânea e fluida sem recarregamento de página.
* **Modelagem Dimensional:** Preparado para estruturação em esquema estrela (*Star Schema*), facilitando a futura integração com ferramentas de Business Intelligence (como Power BI) e bancos de dados relacionais (PostgreSQL).
* **Acessibilidade:** Cores seguem WCAG AA (≥ 4.5:1 com texto branco); touch targets mínimos de 44px; `aria-label` em todos os botões de navegação.

---

## 🎓 Diferencial Acadêmico
O projeto vai além de uma simples interface gráfica. Ele aplica a teoria de **Sistemas de Informação (Laudon/Stair)** na prática: captura o dado bruto e desestruturado do aluno (Transação) e, através de processamento, o entrega como Inteligência e Conhecimento (Informação Gerencial) para a tomada de decisão da instituição de ensino.