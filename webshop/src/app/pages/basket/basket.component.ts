import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-basket',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './basket.component.html',
  styleUrl: './basket.component.scss'
})
export class BasketComponent {
  displayedColumns: string[] = ['name', 'price', 'actions', 'actions2'];
  
  basketProducts = [
    {
      name: 'Camera',
      price: '12$'
    },
    {
      name: 'Psp',
      price: '21$'
    }
  ];
  
  deleteProduct(index: number): void {
    this.basketProducts = this.basketProducts.filter((_, i) => i !== index);
  }
  
  clearAllProducts(): void {
    this.basketProducts = [];
  }
}