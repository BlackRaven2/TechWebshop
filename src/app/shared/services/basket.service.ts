// shared/services/basket.service.ts
import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc, docData } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Product } from '../models/Product';
import { Observable, from, of, switchMap, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BasketService {
  private BASKETS_COLLECTION = 'Baskets';

  constructor(private firestore: Firestore, private authService: AuthService) {}

  getBasketItems(): Observable<Product[]> {
    return this.authService.currentUser.pipe(
    switchMap(user => {
      if (!user) return of([]);
      const basketRef = doc(this.firestore, this.BASKETS_COLLECTION, user.uid);
      return docData(basketRef).pipe(
        map((data: any) => {
          return data?.items || [];
        })
      );
    })
  );
  }

  addToBasket(product: Product): Promise<void> {
    return this.authService.currentUser.pipe(
      switchMap(user => {
        if (!user) throw new Error('Not logged in');
        const basketRef = doc(this.firestore, this.BASKETS_COLLECTION, user.uid);
        return from(getDoc(basketRef)).pipe(
          switchMap(snapshot => {
            const data = snapshot.data();
            const items = data?.['items'] || [];
            const updated = [...items, product];
            return from(setDoc(basketRef, { items: updated }));
          })
        );
      })
    ).toPromise();
  }

  clearBasket(): Promise<void> {
    return this.authService.currentUser.pipe(
      switchMap(user => {
        if (!user) throw new Error('Not logged in');
        const basketRef = doc(this.firestore, this.BASKETS_COLLECTION, user.uid);
        return from(setDoc(basketRef, { items: [] }));
      })
    ).toPromise();
  }

  removeItem(productId: string): Promise<void> {
    return this.authService.currentUser.pipe(
      switchMap(user => {
        if (!user) throw new Error('Not logged in');
        const basketRef = doc(this.firestore, this.BASKETS_COLLECTION, user.uid);
        return from(getDoc(basketRef)).pipe(
          switchMap(snapshot => {
            const items: Product[] = snapshot.data()?.['items'] || [];
            const filtered = items.filter(item => item.id !== productId);
            return from(updateDoc(basketRef, { items: filtered }));
          })
        );
      })
    ).toPromise();
  }
}
