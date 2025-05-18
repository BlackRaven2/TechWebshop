import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { Product } from '../../shared/models/Product';
import { ProductService } from '../../shared/services/product.service';
import { Subscription, combineLatest } from 'rxjs';
import { BasketService } from '../../shared/services/basket.service';

@Component({
  selector: 'app-products',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTableModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    FormsModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  standalone: true
})
export class ProductsComponent implements OnInit, OnDestroy {
  title: string = 'Products';
  displayedColumns: string[] = ['name', 'price'];
  specialDisplayedColumns: string[] = ['name', 'price'];
  productForm!: FormGroup;
  products: Product[] = [];
  isLoading = false;
  newProductName: string = '';
  newProductPrice: string = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private basketService: BasketService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadAllProductData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  loadAllProductData(): void {
    this.isLoading = true;

  const allProducts$ = this.productService.getAllProducts();
  const basketItems$ = this.basketService.getBasketItems();

  const subscription = combineLatest([allProducts$, basketItems$]).subscribe({
    next: ([allProducts, basketItems]) => {
      const basketIds = new Set(basketItems.map(item => item.id));
      this.products = allProducts
        .filter(p => !basketIds.has(p.id)) // Szűrés: csak azok, amik nincsenek a kosárban
        .map((p: Product) => ({
          ...p,
          price: typeof p.price === 'string' ? Number(p.price.replace(/[^\d.-]/g, '')) : p.price
        }));
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error loading products:', error);
      this.isLoading = false;
      this.showNotification('Error loading products', 'error');
    }
  });

  this.subscriptions.push(subscription);
  }

  addProduct(): void {
    console.log('Form value:', this.productForm.value);
console.log('Form valid:', this.productForm.valid);
console.log('Form controls:', this.productForm.controls);
    if (this.productForm.valid) {
      this.isLoading = true;
      const formValue = this.productForm.value;
      const newProduct: Omit<Product, 'id'> = {
        name: formValue.name,
        price: Number(formValue.price)  // itt is számra konvertálunk
      };

      this.productService.addProduct(newProduct)
        .then(() => {
          this.loadAllProductData();
          this.showNotification('Product added successfully', 'success');
        })
        .catch(error => {
          console.error('Error adding product:', error);
          this.showNotification('Failed to add product', 'error');
        })
        .finally(() => {
          this.isLoading = false;
        });
    } else {
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        control?.markAsTouched();
      });
      this.showNotification('Please fill in all required fields correctly', 'warning');
    }
  }

  deleteProduct(productId: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.isLoading = true;
      this.productService.deleteProduct(productId)
        .then(() => {
          this.loadAllProductData();
          this.showNotification('Product deleted successfully', 'success');
        })
        .catch(error => {
          console.error('Error deleting product:', error);
          this.showNotification('Failed to delete product', 'error');
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  addToBasket(product: Product): void {
  this.basketService.addToBasket(product)
    .then(() => this.showNotification('Product added to basket', 'success'))
    .catch(err => {
      console.error('Error adding to basket:', err);
      this.showNotification('Failed to add product to basket', 'error');
    });
}

  private showNotification(message: string, type: 'success' | 'error' | 'warning'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [`snackbar-${type}`]
    });
  }
}
