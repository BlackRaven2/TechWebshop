import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, getDoc } from '@angular/fire/firestore';
import { Observable, from, switchMap, map, of, take, firstValueFrom } from 'rxjs';
import { Product } from '../models/Product';
import { AuthService } from './auth.service';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly PRODUCTS_COLLECTION = 'Products';
  private readonly USERS_COLLECTION = 'Users';

  constructor(
    private authService: AuthService,
    private firestore: Firestore      
  ) { }

  // CREATE
  async addProduct(product: Omit<Product, 'id' | 'createdBy'>): Promise<Product> {
  try {
    const user = await firstValueFrom(this.authService.currentUser.pipe(take(1)));
    if (!user) throw new Error('No authenticated user found');

    const productsCollection = collection(this.firestore, this.PRODUCTS_COLLECTION);

    // Ide tesszük be a createdBy mezőt:
    const productToSave = { 
      ...product, 
      createdBy: user.uid 
    };

    const docRef = await addDoc(productsCollection, productToSave);
    const productId = docRef.id;

    // Frissítjük az id-t is a Firestore dokumentumban
    await updateDoc(docRef, { id: productId });

    const newProduct = { ...productToSave, id: productId } as Product;

    // Frissítjük a user dokumentum products tömbjét
    const userDocRef = doc(this.firestore, this.USERS_COLLECTION, user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      const products = userData.products || [];
      products.push(newProduct);
      await updateDoc(userDocRef, { products });
    }

    return newProduct;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

  // READ - összes termék lekérése a felhasználóhoz tartozó ID-k alapján
  getAllProducts(): Observable<Product[]> {
  const productsCollection = collection(this.firestore, this.PRODUCTS_COLLECTION);
  return from(getDocs(productsCollection)).pipe(
    map(snapshot =>
      snapshot.docs.map(doc => ({
        ...(doc.data() as Product),
        id: doc.id
      }))
    )
  );
}

  // UPDATE - termék frissítése
  async updateProduct(productId: string, updatedData: Partial<Product>): Promise<void> {
    try {
      const user = await firstValueFrom(this.authService.currentUser.pipe(take(1)));
      if (!user) throw new Error('No authenticated user found');

      const userDocRef = doc(this.firestore, this.USERS_COLLECTION, user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) throw new Error('User not found');

      const userData = userDoc.data() as User;
      if (!userData.products || !userData.products.some(p => p.id === productId)) {
        throw new Error('Product does not belong to the user');
      }

      const productDocRef = doc(this.firestore, this.PRODUCTS_COLLECTION, productId);
      return updateDoc(productDocRef, updatedData);

    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // DELETE - termék törlése és user products tömb frissítése
  async deleteProduct(productId: string): Promise<void> {
  try {
    const user = await firstValueFrom(this.authService.currentUser.pipe(take(1)));
    if (!user) throw new Error('No authenticated user');

    const userDocRef = doc(this.firestore, this.USERS_COLLECTION, user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) throw new Error('User document not found');

    const userData = userDoc.data() as User;

    console.log('User products before deletion:', userData.products);

    if (!userData.products?.some(p => (typeof p === 'string' ? p === productId : p.id === productId))) {
      throw new Error('Product not found in user products');
    }

    // Delete from PRODUCTS_COLLECTION
    const productDocRef = doc(this.firestore, this.PRODUCTS_COLLECTION, productId);
    await deleteDoc(productDocRef);

    // Update user document products array
    const updatedProducts = userData.products.filter(p => (typeof p === 'string' ? p !== productId : p.id !== productId));
    await updateDoc(userDocRef, { products: updatedProducts });

  } catch (error) {
    console.error('Delete product error:', error);
    throw error;
  }
}
}
