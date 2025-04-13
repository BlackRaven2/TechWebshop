
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, RouterLink, CommonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  }

  changePage() {
    this.router.navigateByUrl("/tasks");
  }

}