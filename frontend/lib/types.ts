export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  icon: string;
}

export interface Comment {
  id: number;
  product_id: number;
  user_id: number;
  content: string;
  rating: number;
  created_at: string;
  username?: string;
}

export interface ChatMessage {
  role: "user" | "bot";
  text: string;
  time: string;
  tools?: string[];
  attack_type?: string | null;
}

export interface ChatLog {
  id: number;
  session_id: string;
  user_id: number | null;
  user_message: string;
  system_prompt?: string;
  system_prompt_hash?: string;
  context_injected?: string;
  llm_response: string;
  tools_called: any[];
  attack_type: string | null;
  defense_active?: boolean;
  timestamp: string;
}
