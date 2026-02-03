export type Product = {
  id: number;
  title: string;
  price: number;
  location: string;
  image: string;
  category: string;
};

export const categories = [
  "All",
  "Electronics",
  "Home",
  "Vehicles",
  "Clothing",
  "Hobbies",
];

export const mockProducts: Product[] = [
  {
    id: 1,
    title: "Mountain Bike - Great Condition",
    price: 250,
    location: "San Francisco, CA",
    image:
      "https://images.unsplash.com/photo-1763098843789-e03a632b4710?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWN5Y2xlJTIwb3V0ZG9vcnxlbnwxfHx8fDE3NjgxNDk4MDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Vehicles",
  },
  {
    id: 2,
    title: "Modern Gray Sofa - Like New",
    price: 400,
    location: "Los Angeles, CA",
    image:
      "https://images.unsplash.com/photo-1658946376297-629ade5ac607?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXJuaXR1cmUlMjBjb3VjaHxlbnwxfHx8fDE3NjgyMjM4OTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Home",
  },
  {
    id: 3,
    title: "MacBook Pro 2021",
    price: 1200,
    location: "San Jose, CA",
    image:
      "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjgxNjY3OTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Electronics",
  },
  {
    id: 4,
    title: "Acoustic Guitar with Case",
    price: 180,
    location: "Oakland, CA",
    image:
      "https://images.unsplash.com/photo-1610620146780-26908fab50ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWl0YXIlMjBpbnN0cnVtZW50fGVufDF8fHx8MTc2ODIzMDMyMnww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Hobbies",
  },
  {
    id: 5,
    title: "Canon DSLR Camera",
    price: 550,
    location: "Berkeley, CA",
    image:
      "https://images.unsplash.com/photo-1579535984712-92fffbbaa266?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1lcmElMjBwaG90b2dyYXBoeXxlbnwxfHx8fDE3NjgyMjAyMjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Electronics",
  },
  {
    id: 6,
    title: "Nike Running Shoes",
    price: 65,
    location: "San Francisco, CA",
    image:
      "https://images.unsplash.com/photo-1562183241-b937e95585b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXN8ZW58MXx8fHwxNjgyMTE0ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Clothing",
  },
];
