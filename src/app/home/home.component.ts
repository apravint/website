import { Component, OnInit } from '@angular/core';

import { RouterModule } from '@angular/router';
import { AdUnitComponent } from '../shared/ad-unit/ad-unit.component';
import { SeoService } from '../shared/seo.service';

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

  constructor(private seo: SeoService) {
    this.seo.updateMetaTags({
      title: 'Pravin Tamilan - Full Stack Engineer & Poet',
      description: 'Portfolio of Pravin Tamilan, a Full Stack Engineer building digital experiences. Explore my projects, poetry, and technical articles.',
      image: 'assets/profile-pic.jpg',
      url: 'https://pravintamilan.com/'
    });
  }

  ngOnInit(): void {
    // hide the greeting after 5 seconds
    setTimeout(() => (this.showGreeting = false), 4000);
  }
}
