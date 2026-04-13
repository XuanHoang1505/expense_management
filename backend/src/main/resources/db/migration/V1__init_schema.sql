CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id      BIGSERIAL PRIMARY KEY,
    name    VARCHAR(100) NOT NULL,
    icon    VARCHAR(50),
    type    VARCHAR(20) NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE transactions (
    id          BIGSERIAL PRIMARY KEY,
    amount      DECIMAL(15,2) NOT NULL,
    note        VARCHAR(500),
    type        VARCHAR(20) NOT NULL,
    date        DATE NOT NULL,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name, icon, type) VALUES
('Ăn uống',   'food',      'EXPENSE'),
('Di chuyển', 'transport', 'EXPENSE'),
('Mua sắm',   'shopping',  'EXPENSE'),
('Sức khoẻ',  'health',    'EXPENSE'),
('Lương',     'salary',    'INCOME'),
('Thưởng',    'bonus',     'INCOME');