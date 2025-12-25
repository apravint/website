import { Component } from '@angular/core';
import { AdUnitComponent } from '../shared/ad-unit/ad-unit.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [AdUnitComponent],
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent { }
