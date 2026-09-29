CREATE DATABASE IF NOT EXISTS sistema_db;
USE sistema_db;

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

-- Tabela de Técnicos
CREATE TABLE IF NOT EXISTS tecnicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

-- Inserção de dados iniciais para teste
INSERT INTO categorias (nome) VALUES ('Hardware'), ('Software'), ('Redes');
INSERT INTO tecnicos (nome, email) VALUES ('Carlos Silva', 'carlos@email.com'), ('Ana Souza', 'ana@email.com');