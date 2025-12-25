import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdUnitComponent } from '../shared/ad-unit/ad-unit.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, AdUnitComponent],
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent { }
