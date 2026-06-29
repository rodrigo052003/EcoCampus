-- ============================================================
--  EcoCampus — Banco de Dados Completo
--  Plataforma de troca, empréstimo e doação de materiais
--  acadêmicos entre estudantes e professores.
--
--  Banco: MySQL 8+
--  Versão: 1.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS ecocampus
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE ecocampus;

-- ============================================================
-- TABELA: usuarios
-- ============================================================

CREATE TABLE usuarios (
    id                INT           AUTO_INCREMENT PRIMARY KEY,
    nome              VARCHAR(150)  NOT NULL,
    email             VARCHAR(200)  NOT NULL UNIQUE,
    senha_hash        VARCHAR(255)  NOT NULL,
    tipo              ENUM('Aluno','Professor') NOT NULL DEFAULT 'Aluno',
    universidade      VARCHAR(200),
    curso             VARCHAR(200),
    pontos_reputacao  INT           NOT NULL DEFAULT 0,
    ativo             TINYINT(1)    NOT NULL DEFAULT 1,
    criado_em         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABELA: materiais
-- ============================================================

CREATE TABLE materiais (
    id              INT  AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT  NOT NULL,
    titulo          VARCHAR(200) NOT NULL,
    descricao       TEXT,
    categoria       ENUM('Livro','Calculadora','Apostila','Outro') NOT NULL,
    qualidade       ENUM('A','B','C') NOT NULL,
    tipo_transacao  ENUM('Troca','Empréstimo','Doação') NOT NULL,
    status          ENUM('Disponível','Emprestado','Reservado','Inativo') NOT NULL DEFAULT 'Disponível',
    criado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_materiais_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABELA: solicitacoes
-- ============================================================

CREATE TABLE solicitacoes (
    id              INT  AUTO_INCREMENT PRIMARY KEY,
    material_id     INT  NOT NULL,
    solicitante_id  INT  NOT NULL,
    tipo            ENUM('Troca','Empréstimo','Doação') NOT NULL,
    status          ENUM('Pendente','Aceita','Recusada','Finalizada','Cancelada') NOT NULL DEFAULT 'Pendente',
    mensagem        TEXT,
    criado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_solic_material    FOREIGN KEY (material_id)    REFERENCES materiais(id) ON DELETE CASCADE,
    CONSTRAINT fk_solic_solicitante FOREIGN KEY (solicitante_id) REFERENCES usuarios(id)  ON DELETE CASCADE,
    CONSTRAINT uq_solicitacao_pendente UNIQUE (material_id, solicitante_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABELA: historico_transacoes
-- ============================================================

CREATE TABLE historico_transacoes (
    id                       INT  AUTO_INCREMENT PRIMARY KEY,
    solicitacao_id           INT,
    material_id              INT  NOT NULL,
    usuario_dono_id          INT  NOT NULL,
    usuario_req_id           INT  NOT NULL,
    tipo                     ENUM('Troca','Empréstimo','Doação') NOT NULL,
    data_transacao           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_devolucao_prevista  DATE,
    data_devolucao_efetiva   DATE,

    CONSTRAINT fk_hist_solicitacao FOREIGN KEY (solicitacao_id)  REFERENCES solicitacoes(id)  ON DELETE SET NULL,
    CONSTRAINT fk_hist_material    FOREIGN KEY (material_id)     REFERENCES materiais(id)     ON DELETE CASCADE,
    CONSTRAINT fk_hist_dono        FOREIGN KEY (usuario_dono_id) REFERENCES usuarios(id)      ON DELETE CASCADE,
    CONSTRAINT fk_hist_req         FOREIGN KEY (usuario_req_id)  REFERENCES usuarios(id)      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABELA: avaliacoes
-- ============================================================

CREATE TABLE avaliacoes (
    id            INT  AUTO_INCREMENT PRIMARY KEY,
    transacao_id  INT  NOT NULL,
    avaliador_id  INT  NOT NULL,
    avaliado_id   INT  NOT NULL,
    nota          TINYINT NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario    TEXT,
    criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_aval_transacao  FOREIGN KEY (transacao_id) REFERENCES historico_transacoes(id) ON DELETE CASCADE,
    CONSTRAINT fk_aval_avaliador  FOREIGN KEY (avaliador_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_aval_avaliado   FOREIGN KEY (avaliado_id)  REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT uq_avaliacao_transacao UNIQUE (transacao_id, avaliador_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABELA: notificacoes
-- ============================================================

CREATE TABLE notificacoes (
    id          INT  AUTO_INCREMENT PRIMARY KEY,
    usuario_id  INT  NOT NULL,
    tipo        ENUM('Solicitacao','Aceite','Recusa','Avaliacao','VencimentoEmprestimo','Sistema') NOT NULL,
    mensagem    TEXT NOT NULL,
    lida        TINYINT(1) NOT NULL DEFAULT 0,
    criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notif_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABELA: reputacao_log
-- ============================================================

CREATE TABLE reputacao_log (
    id             INT  AUTO_INCREMENT PRIMARY KEY,
    usuario_id     INT  NOT NULL,
    variacao       INT  NOT NULL,
    motivo         VARCHAR(200) NOT NULL,
    referencia_id  INT,
    criado_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_rep_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_materiais_usuario   ON materiais(usuario_id);
CREATE INDEX idx_materiais_status    ON materiais(status);
CREATE INDEX idx_materiais_categoria ON materiais(categoria);
CREATE INDEX idx_materiais_tipo_tx   ON materiais(tipo_transacao);
CREATE INDEX idx_solicitacoes_req    ON solicitacoes(solicitante_id);
CREATE INDEX idx_solicitacoes_mat    ON solicitacoes(material_id);
CREATE INDEX idx_historico_dono      ON historico_transacoes(usuario_dono_id);
CREATE INDEX idx_historico_req       ON historico_transacoes(usuario_req_id);
CREATE INDEX idx_notificacoes_user   ON notificacoes(usuario_id, lida);

-- ============================================================
-- TRIGGER: registrar reputação após avaliação
-- ============================================================

DELIMITER $$

CREATE TRIGGER trg_reputacao_apos_avaliacao
AFTER INSERT ON avaliacoes
FOR EACH ROW
BEGIN
    DECLARE v_pontos INT;
    SET v_pontos = NEW.nota * 2;

    INSERT INTO reputacao_log (usuario_id, variacao, motivo, referencia_id)
    VALUES (NEW.avaliado_id, v_pontos, 'Avaliação recebida', NEW.id);

    UPDATE usuarios
    SET pontos_reputacao = pontos_reputacao + v_pontos
    WHERE id = NEW.avaliado_id;
END$$

DELIMITER ;

-- ============================================================
-- DADOS INICIAIS — Usuários
-- ============================================================

INSERT INTO usuarios (nome, email, senha_hash, tipo, universidade, curso) VALUES
('Carlos Eduardo', 'carlos@edu.br', '$2b$12$placeholder_hash_carlos', 'Aluno',     'Universidade Federal', 'Licenciatura em Matemática'),
('Maria Souza',    'maria@edu.br',  '$2b$12$placeholder_hash_maria',  'Aluno',     'Universidade Federal', 'Engenharia Civil'),
('João Silva',     'joao@edu.br',   '$2b$12$placeholder_hash_joao',   'Aluno',     'Universidade Federal', 'Ciência da Computação'),
('Ana Lima',       'ana@edu.br',    '$2b$12$placeholder_hash_ana',    'Professor', 'Universidade Federal', 'Física');

-- ============================================================
-- DADOS INICIAIS — Materiais
-- ============================================================

INSERT INTO materiais (usuario_id, titulo, descricao, categoria, qualidade, tipo_transacao, status) VALUES
(1, 'Livro de Álgebra Linear',        'Excelente estado de conservação.', 'Livro',       'A', 'Troca',      'Disponível'),
(1, 'Calculadora Científica',         'Calculadora Casio FX-991ES.',      'Calculadora', 'B', 'Empréstimo', 'Emprestado'),
(1, 'Livro de Física I',              'Halliday, 10ª edição.',            'Livro',       'A', 'Doação',     'Disponível'),
(2, 'Cálculo Vol. 1 - Stewart',       'Livro em bom estado.',             'Livro',       'B', 'Troca',      'Disponível'),
(3, 'Apostila de Estruturas de Dados','Apostila impressa, completa.',      'Apostila',    'A', 'Doação',     'Disponível');

-- ============================================================
-- DADOS INICIAIS — Solicitações
-- ============================================================

INSERT INTO solicitacoes (material_id, solicitante_id, tipo, status, mensagem) VALUES
(1, 2, 'Troca',      'Pendente',   'Gostaria de trocar pelo Cálculo Stewart.'),
(2, 3, 'Empréstimo', 'Aceita',     'Preciso por 2 semanas para a prova.'),
(4, 1, 'Troca',      'Finalizada', 'Troca pelo Livro de Física I.');

-- ============================================================
-- DADOS INICIAIS — Histórico
-- ============================================================

INSERT INTO historico_transacoes (solicitacao_id, material_id, usuario_dono_id, usuario_req_id, tipo, data_transacao)
VALUES (3, 4, 2, 1, 'Troca', '2026-06-05 14:00:00');

-- ============================================================
-- DADOS INICIAIS — Notificações
-- ============================================================

INSERT INTO notificacoes (usuario_id, tipo, mensagem) VALUES
(1, 'Solicitacao',          'Maria solicitou seu livro de Física.'),
(1, 'Aceite',               'João aceitou sua proposta de troca.'),
(1, 'Avaliacao',            'Ana avaliou você com 5 estrelas.'),
(1, 'VencimentoEmprestimo', 'Seu empréstimo vence amanhã.');
