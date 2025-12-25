import { Component } from '@angular/core';
import { AdUnitComponent } from '../shared/ad-unit/ad-unit.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [AdUnitComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent { }
