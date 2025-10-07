import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-detail.component.html',
  styleUrls: ['./home-detail.component.scss']
})
export class HomeDetailComponent implements OnInit {
  today = new Date().toDateString();
  showGreeting = true;

  ngOnInit(): void {
    // hide the greeting after 5 seconds
    setTimeout(() => (this.showGreeting = false), 5000);
  }
}
