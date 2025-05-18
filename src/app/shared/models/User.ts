import { Product } from "./Product";

export interface User {
    id: string, 
    name: {
      firstname: string;
      lastname: string;
    };
    email: string;
    password: string;
    products: Product[];
  }