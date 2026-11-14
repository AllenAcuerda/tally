import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonItem, 
  IonCheckbox, 
  IonLabel, 
  IonButton, 
  IonInput, 
  IonIcon 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForward, arrowBack, shieldCheckmarkOutline, documentTextOutline, closeOutline } from 'ionicons/icons';
import { Data } from '../services/data'; 

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonContent, IonItem, IonCheckbox, IonLabel, 
    IonButton, IonInput, IonIcon
  ]
})
export class OnboardingPage {
  step: number = 1;
  acceptedTerms: boolean = false;
  userName: string = '';
  showTermsModal: boolean = false;

  constructor(
    private router: Router,
    private dataService: Data 
  ) {
    addIcons({ 
      arrowForward, 
      arrowBack, 
      shieldCheckmarkOutline, 
      documentTextOutline, 
      closeOutline 
    });
  }

  nextStep() {
    if (this.step === 1 && this.acceptedTerms) {
      this.step = 2;
    }
  }

  prevStep() {
    if (this.step === 2) {
      this.step = 1;
    }
  }

  openTermsModal() {
    this.showTermsModal = true;
  }

  closeTermsModal() {
    this.showTermsModal = false;
  }

  async finishOnboarding() {
    if (this.userName.trim()) {
      const name = this.userName.trim();
      
      localStorage.setItem('user_name', name);
      localStorage.setItem('has_seen_onboarding', 'true');

      await this.dataService.set('userName', name);
      this.dataService.refreshData$.next();
      
      this.router.navigateByUrl('/home', { replaceUrl: true });
    }
  }
}