/**
 * Tipuri hand-written, nu generate de Supabase CLI (nu exista proiect Supabase
 * conectat inca in acest mediu). Cand se creeaza proiectul real, ruleaza
 * `supabase gen types typescript` si inlocuieste acest fisier — pastreaza
 * numele de camp identice cu migrarea din supabase/migrations/0001_schema.sql.
 */

export type UserRole = "admin" | "client_b2b";
export type CompanyStatus = "active" | "inactive" | "pending";
export type OrderStatus = "draft" | "submitted" | "confirmed" | "cancelled";

export interface Company {
  id: string;
  company_name: string;
  cui: string;
  address: string | null;
  city: string | null;
  country: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  status: CompanyStatus;
  created_at: string;
}

export interface AppUser {
  id: string; // = auth.users.id
  company_id: string | null; // null pentru admin (nu apartine unei companii client)
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "disabled";
  created_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  base_price: number;
  unit: "buc" | "kg" | "set" | "ml";
  technical_sheet_url: string | null;
  image_url: string | null;
  active: boolean;
  created_at: string;
}

export interface ClientCategoryDiscount {
  id: string;
  company_id: string;
  category_id: string;
  discount_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  company_id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  discount_total: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  base_unit_price: number;
  discount_percentage: number;
  final_unit_price: number;
  line_total: number;
}
