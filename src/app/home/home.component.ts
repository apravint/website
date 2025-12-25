import { Component, OnInit } from '@angular/core';

import { RouterModule } from '@angular/router';
import { AdUnitComponent } from '../shared/ad-unit/ad-unit.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, AdUnitComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  today = new Date().toDateString();
  showGreeting = true;

  ngOnInit(): void {
    // hide the greeting after 5 seconds
    setTimeout(() => (this.showGreeting = false), 4000);
  }
}
