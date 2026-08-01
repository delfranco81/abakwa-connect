export type Business = {
  id: string;
  name: string;
  owner: string;
  category: string;

  phone: string;
  email: string;

  description: string;

  area: string;
  landmark: string;

  verified: boolean;
  featured: boolean;

  rating: number;
  totalReviews: number;

  logo: string;
  coverImage: string;
};