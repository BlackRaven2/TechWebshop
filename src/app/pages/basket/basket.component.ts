import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BasketService } from '../../shared/services/basket.service';
import { Product } from '../../shared/models/Product';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-basket',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './basket.component.html',
  styleUrl: './basket.component.scss'
})
export class BasketComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['name', 'actions'];
  completedProducts: Product[] = [];
  isLoading = false;
  private subscription: Subscription | null = null;

  constructor(private basketService: BasketService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadBasketItems();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadBasketItems(): void {
    this.isLoading = true;
  this.subscription = this.basketService.getBasketItems().subscribe({
    next: (items) => {
      this.completedProducts = items;
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error loading basket items:', error);
      this.isLoading = false;
    }
  });
  }

  removeItem(productId: string): void {
    this.isLoading = true;
  this.basketService.removeItem(productId)
    .then(() => {
      this.loadBasketItems(); // újratöltés
      this.showNotification('Product removed successfully', 'success');
    })
    .catch((error) => {
      console.error('Failed to remove product:', error);
      this.showNotification('Failed to remove product', 'error');
    })
    .finally(() => {
      this.isLoading = false;
    });
  }

  clearAllProducts(): void {
    this.isLoading = true;
  this.basketService.clearBasket()
    .then(() => {
      this.loadBasketItems(); // újratöltés
      this.showNotification('Product removed successfully', 'success');
    })
    .catch((error) => {
      console.error('Failed to remove product:', error);
      this.showNotification('Failed to remove product', 'error');
    })
    .finally(() => {
      this.isLoading = false;
    });

  }

  private showNotification(message: string, type: 'success' | 'error' | 'warning'): void {
  this.snackBar.open(message, 'Close', {
    duration: 3000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
    panelClass: [`snackbar-${type}`] // pl.: snackbar-success, snackbar-error
  });
}
}
