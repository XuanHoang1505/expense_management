ALTER TABLE categories ADD COLUMN color VARCHAR(7) DEFAULT '#607D8B';

UPDATE categories SET color = '#4CAF50' WHERE name = 'Ăn uống';
UPDATE categories SET color = '#2196F3' WHERE name = 'Di chuyển';
UPDATE categories SET color = '#FF9800' WHERE name = 'Mua sắm';
UPDATE categories SET color = '#E91E63' WHERE name = 'Sức khoẻ';
UPDATE categories SET color = '#4CAF50' WHERE name = 'Lương';
UPDATE categories SET color = '#9C27B0' WHERE name = 'Thưởng';