import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Data } from '../services/data';
import { 
    IonContent, 
    IonCard, 
    IonLabel, 
    IonIcon, 
    AlertController, 
    ToastController 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
    walletOutline, 
    contrastOutline, 
    trashOutline, 
    chevronForwardOutline 
} from 'ionicons/icons';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.page.html',
    styleUrls: ['./settings.page.scss'],
    standalone: true,
    imports: [
        CommonModule,
        IonContent,
        IonCard,
        IonLabel,
        IonIcon
    ]
})
export class SettingsPage implements OnInit {
    userName: string = 'Unknown User';
    currency: string = 'PHP';

    constructor(
        private dataService: Data,
        private alertController: AlertController,
        private toastController: ToastController,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) {
        addIcons({
            'wallet-outline': walletOutline,
            'contrast-outline': contrastOutline,
            'trash-outline': trashOutline,
            'chevron-forward-outline': chevronForwardOutline
        });
    }

    async ngOnInit() {
        await this.loadSettings();
    }

    async ionViewWillEnter() {
        await this.loadSettings();
    }

    async loadSettings() {
        const savedName = await this.dataService.get('userName') || localStorage.getItem('user_name');
        if (savedName) this.userName = savedName;

        const savedCurrency = await this.dataService.get('currency');
        if (savedCurrency) this.currency = savedCurrency;

        this.cdr.detectChanges();
    }

    getInitials(): string {
        if (!this.userName) return 'PA';
        const parts = this.userName.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return this.userName.substring(0, 2).toUpperCase();
    }

    async changeName() {
        const alert = await this.alertController.create({
            header: 'Change Name',
            inputs: [
                {
                    name: 'newName',
                    type: 'text',
                    placeholder: 'Enter new name',
                    value: this.userName
                }
            ],
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Save',
                    handler: async (data) => {
                        if (data.newName && data.newName.trim()) {
                            this.userName = data.newName.trim();
                            await this.dataService.set('userName', this.userName);
                            localStorage.setItem('user_name', this.userName);
                            this.dataService.refreshData$.next(); 
                            this.cdr.detectChanges();
                            this.showToast('Name updated successfully!');
                        }
                    }
                }
            ]
        });
        await alert.present();
    }

    async changeCurrency() {
        const alert = await this.alertController.create({
            header: 'Select Currency',
            inputs: [
                { type: 'radio', label: 'Philippine Peso (PHP)', value: 'PHP', checked: this.currency === 'PHP' },
                { type: 'radio', label: 'US Dollar (USD)', value: 'USD', checked: this.currency === 'USD' }
            ],
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Select',
                    handler: async (val) => {
                        if (val) {
                            this.currency = val;
                            await this.dataService.set('currency', val);
                            this.showToast(`Currency changed to ${val}`);
                            this.cdr.detectChanges();
                        }
                    }
                }
            ]
        });
        await alert.present();
    }

    async clearAllData() {
        const alert = await this.alertController.create({
            header: 'Clear All Data & Reset App',
            message: 'Are you sure you want to delete all data and reset the app? This will take you back to the initial terms & conditions screen.',
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Reset & Clear',
                    role: 'destructive',
                    handler: async () => {
                        // Clear all local storage state (including onboarding check & user name)
                        localStorage.clear();

                        // Clear transaction records in data service
                        await this.dataService.set('Transactions', []);
                        await this.dataService.set('userName', '');

                        this.showToast('App data cleared. Restarting setup...');

                        // Route back to onboarding
                        setTimeout(() => {
                            this.router.navigateByUrl('/onboarding', { replaceUrl: true });
                        }, 600);
                    }
                }
            ]
        });
        await alert.present();
    }

    async showToast(msg: string) {
        const toast = await this.toastController.create({
            message: msg,
            duration: 2000,
            position: 'bottom'
        });
        await toast.present();
    }
}