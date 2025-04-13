import { Product } from "./Product";

export interface User {
    name: {
      firstname: string;
      lastname: string;
    };
    email: string;
    password: string;
    products: Product[];
  }