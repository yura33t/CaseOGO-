
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Item {
  id: string;
  name: string;
  price: number;
  rarity: string; // Изменено на string для поддержки кастомных названий
  image_url?: string;
  custom_color?: string; // HEX код для уникального градиента
}

export interface Profile {
  id: string;
  username: string;
  gcoins: number;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  obtained_at: string;
  item: Item;
}
