import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subscription, combineLatest } from 'rxjs';
import { UserService } from '../../shared/services/user.service';
import { User } from '../../shared/models/User';
import { Product } from '../../shared/models/Product';
import { ProductService } from '../../shared/services/product.service';
import { BasketService } from '../../shared/services/basket.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  products: Product[] = [];
  uploadedProducts: Product[] = [];
  basketProducts: Product[] = [];
  isLoading = true;

  private subscriptions: Subscription[] = [];

  constructor(
    private userService: UserService,
    private productService: ProductService,
    private basketService: BasketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserProfileAndProducts();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadUserProfileAndProducts(): void {
    this.isLoading = true;

    const userSub = this.userService.getUserProfile().subscribe({
      next: (data) => {
        this.user = data.user;

        if (!this.user) {
          this.uploadedProducts = [];
          this.basketProducts = [];
          this.isLoading = false;
          return;
        }

        // Betöltjük a termékeket és a kosarat egyszerre
        const uploadedProducts$ = this.productService.getAllProducts();
        const basketProducts$ = this.basketService.getBasketItems();

        const combinedSub = combineLatest([uploadedProducts$, basketProducts$]).subscribe({
          next: ([allProducts, basketItems]) => {
            // Feltételezzük, hogy a Product modellben van egy 'createdBy' mező, ami a user.uid
            this.uploadedProducts = allProducts.filter(p => p.createdBy === this.user?.id);
            this.basketProducts = basketItems;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error loading products or basket:', err);
            this.isLoading = false;
          }
        });

        this.subscriptions.push(combinedSub);
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
        this.isLoading = false;
      }
    });

    this.subscriptions.push(userSub);
  }

  getUserInitials(): string {
    if (!this.user || !this.user.name) return '?';
    
    const firstInitial = this.user.name.firstname ? this.user.name.firstname.charAt(0).toUpperCase() : '';
    const lastInitial = this.user.name.lastname ? this.user.name.lastname.charAt(0).toUpperCase() : '';
    
    return firstInitial + (lastInitial ? lastInitial : '');
  }
}
