
-- Очищаем текущие предметы (необязательно, но полезно для обновления цен)
TRUNCATE TABLE public.items CASCADE;

-- Вставляем актуальный список предметов
INSERT INTO public.items (name, price, rarity) VALUES
('Soda', 10, 'common'),
('Nesergey', 12, 'common'),
('Chill', 10, 'common'),
('Akashi', 100, 'rare'),
('Twink Expa', 250, 'rare'),
('Epic', 500, 'rare'),
('Amnesia', 1000, 'legendary')
ON CONFLICT DO NOTHING;

-- Остальная часть схемы (таблицы и политики) остается без изменений, 
-- если они уже созданы. Если нет - используй код из предыдущих ответов.
