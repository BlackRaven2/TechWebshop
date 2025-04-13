import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

export interface Product {
  id: number;
  name: string;
  price: string;
}

@Component({
  selector: 'app-products',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  standalone: true
})
export class ProductsComponent {
  @Input() title: string = 'Shop';
  @Output() productAdded = new EventEmitter<Product>();
  
  displayedColumns: string[] = ['name', 'price','actions'];
  
  newProductName: string = '';
  newProductPrice: string = '';
  
  products: Product[] = [
    {
      id: 1,
      name: 'Camera',
      price: '10$'
    },
    {
      id: 2,
      name: 'AirPod',
      price: '45$'
    },
    {
      id: 3,
      name: 'Read documentation on directives',
      price: '110$'
    }
  ];

  addProduct(): void {
    if (this.newProductName.trim()) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 2);
      
      const newProduct: Product = {
        id: this.products.length + 1,
        name: this.newProductName.trim(),
        price: this.newProductPrice
      };
      
      this.products = [...this.products, newProduct];
      this.productAdded.emit(newProduct);
      this.newProductName = '';
      this.newProductPrice = '';
    }
  }

  trackById(index: number, item: Product): number {
    return item.id;
  }
}