import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "webshop-6ea45", appId: "1:234707074733:web:21310c9e89b6ad6ac15024", storageBucket: "webshop-6ea45.firebasestorage.app", apiKey: "AIzaSyBuWn8D3_hW3YjQFi83OpDcFAS2yB48LKI", authDomain: "webshop-6ea45.firebaseapp.com", messagingSenderId: "234707074733" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
