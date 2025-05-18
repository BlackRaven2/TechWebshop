import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { User } from '../models/User';
import { Product } from '../models/Product';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) { }

  getUserProfile(): Observable<{
    user: User | null,
    products: Product[]
  }> {
    return this.authService.currentUser.pipe(
      switchMap(authUser => {
        if (!authUser) {
          return of({
            user: null,
            products: []
          });
        }

        return from(this.fetchUserWithProducts(authUser.uid));
      })
    );
  }

  private async fetchUserWithProducts(userId: string): Promise<{
    user: User | null,
    products: Product[]
  }> {
    try {
      // Felhasználó adatainak lekérése
      const userDocRef = doc(this.firestore, 'Users', userId);
      const userSnapshot = await getDoc(userDocRef);
      
      if (!userSnapshot.exists()) {
        return {
          user: null,
          products: []
        };
      }

      const userData = userSnapshot.data() as User;
      const user = { ...userData, id: userId };
      
      if (!user.products || user.products.length === 0) {
        return {
          user,
          products: []
        };
      }

      // Feladatok lekérése a Products kollekcióból
      const productsCollection = collection(this.firestore, 'Products');
      const q = query(productsCollection, where('id', 'in', user.products));
      const productsSnapshot = await getDocs(q);
      
      const products: Product[] = [];
      productsSnapshot.forEach(doc => {
        const data = doc.data() as { name: string; price: string };
        const product: Product = {
          id: doc.id,
          name: data.name,
          price: String(data.price)
        };
        products.push(product);
      });

      return {
        user,
        products
      };
    } catch (error) {
      console.error('Hiba a felhasználói adatok betöltése során:', error);
      return {
        user: null,
        products: []
      };
    }
  }
}