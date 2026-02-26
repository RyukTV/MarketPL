export type ListingStatus = "active" | "sold" | "hidden";

export type Listing = {
  id: string;
  seller_id: string;

  title: string;
  description: string | null;

  price: number;
  currency: string;

  city: string | null;
  category_id: number | null;

  status: ListingStatus;

  created_at: string;
  updated_at: string;
};