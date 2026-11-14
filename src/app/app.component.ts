import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AddEntryPage } from './add-entry/add-entry-page'; 
import { addIcons } from 'ionicons';
import { 
  IonTabs,
  IonApp, 
  IonRouterOutlet, 
  IonTabBar, 
  IonTabButton, 
  IonIcon, 
  IonLabel, 
  IonFab, 
  IonFabButton,
  ModalController 
} from '@ionic/angular';
import { 
  homeOutline, 
  walletOutline, 
  receiptOutline, 
  settingsOutline, 
  add 
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonFab,
    IonFabButton,
    IonTabs
  ],
})
export class AppComponent implements OnInit {
  showNavigation: boolean = true;

  constructor(
    private modalController: ModalController,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      'home-outline': homeOutline,
      'wallet-outline': walletOutline,
      'receipt-outline': receiptOutline,
      'settings-outline': settingsOutline,
      'add': add
    });
  }

  ngOnInit() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const currentUrl = event.urlAfterRedirects.split('?')[0];
      
      const hiddenRoutes = ['/', '/splash', '/onboarding'];
      this.showNavigation = !hiddenRoutes.includes(currentUrl);

      // Force Angular to update the view immediately
      this.cdr.detectChanges();
    });
  }

  async openAddEntryModal() {
    const modal = await this.modalController.create({
      component: AddEntryPage,
      breakpoints: [0, 0.9],
      initialBreakpoint: 0.9,   
    });
    await modal.present();
  }
}