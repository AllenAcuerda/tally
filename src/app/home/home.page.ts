import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Data } from '../services/data';
import { Subscription } from 'rxjs';
import { 
    IonContent, 
    IonCard, 
    IonCardContent, 
    IonItem, 
    IonLabel, 
    IonIcon, 
    IonList 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
    personOutline, 
    notificationsOutline, 
    chevronForwardOutline, 
    restaurantOutline, 
    carOutline, 
    cardOutline, 
    flashOutline, 
    bagHandleOutline 
} from 'ionicons/icons';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
    standalone: true,
    imports: [
        CommonModule,
        IonContent,
        IonCard,
        IonCardContent,
        IonItem,
        IonLabel,
        IonIcon,
        IonList
    ],
})
export class HomePage implements OnInit, OnDestroy {
    userName: string = 'Unknown User';
    totalBalance: number = 0;
    totalIncome: number = 0;
    totalExpense: number = 0;

    nearestBillText: string = 'No pending bills coming up';
    totalOwed: number = 0;
    owedSubtitle: string = 'No active debts';
    owedInitials: string[] = [];

    transactions: any[] = [];
    private refreshSub?: Subscription;

    constructor(
        private dataService: Data,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        addIcons({
            'person-outline': personOutline,
            'notifications-outline': notificationsOutline,
            'chevron-forward-outline': chevronForwardOutline,
            'restaurant-outline': restaurantOutline,
            'car-outline': carOutline,
            'card-outline': cardOutline,
            'flash-outline': flashOutline,
            'bag-handle-outline': bagHandleOutline
        });
    }

    goToSettings() {
        this.router.navigate(['/settings']);
    }

    ngOnInit() {
        this.loadHomeData();
        this.refreshSub = this.dataService.refreshData$.subscribe(() => {
            this.loadHomeData();
        });
    }

    async ionViewWillEnter() {
        await this.loadHomeData();
    }

    ngOnDestroy() {
        if (this.refreshSub) {
            this.refreshSub.unsubscribe();
        }
    }

    async loadHomeData() {
        const savedName = (await this.dataService.get('userName')) || localStorage.getItem('user_name');
        if (savedName) {
            this.userName = savedName;
        }

        const stored = await this.dataService.get('Transactions') || [];
        this.transactions = stored.sort((a: any, b: any) => b.id - a.id).slice(0, 5);

        this.totalIncome = stored
          .filter((t: any) => t.type === 'Income')
          .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

        this.totalExpense = stored
          .filter((t: any) => t.type === 'Expenses' || (t.type === 'Bill' && t.isPaid) || (t.type === 'Owed' && !t.isPaid))
          .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

        this.totalBalance = this.totalIncome - this.totalExpense;

        // Nearest Pending Bill
        const pendingBills = stored.filter((t: any) => t.type === 'Bill' && !t.isPaid);
        if (pendingBills.length > 0) {
            pendingBills.sort((a: any, b: any) => {
                const timeA = new Date(a.dueDate || a.date).getTime();
                const timeB = new Date(b.dueDate || b.date).getTime();
                return timeA - timeB;
            });
            const nearest = pendingBills[0];
            const name = nearest.note || nearest.category;
            const amt = Number(nearest.amount || 0).toLocaleString();
            const dateStr = new Date(nearest.dueDate || nearest.date).toLocaleDateString([], { month: 'short', day: 'numeric' });
            
            this.nearestBillText = `${name} of ₱${amt} due on ${dateStr}`;
        } else {
            this.nearestBillText = 'No pending bills coming up';
        }
        
        const owedItems = stored.filter((t: any) => t.type === 'Owed' && !t.isPaid);

        if (owedItems.length > 0) {
            const firstPerson = owedItems[0].person || 'Someone';
            
            if (owedItems.length > 1) {
                this.owedSubtitle = `${firstPerson} + ${owedItems.length - 1} more`;
            } else {
                this.owedSubtitle = firstPerson;
            }

            this.owedInitials = owedItems
              .slice(0, 2)
              .map((item: any) => (item.person ? item.person.trim().charAt(0).toUpperCase() : '?'));
        } else {
            this.owedSubtitle = 'No active debts';
            this.owedInitials = [];
        }

        this.cdr.detectChanges();
    }

    navigateToTransaction(segment: string) {
        this.router.navigate(['/wallet'], { queryParams: { segment: segment } });
    }

    navigateToBills(segment: string) {
        this.router.navigate(['/bills'], { queryParams: { segment: segment } });
    }

    getCategoryIcon(category: string): string {
        switch (category) {
            case 'Food': return 'restaurant-outline';
            case 'Transportation': return 'car-outline';
            case 'Salary': return 'card-outline';
            case 'Utilities': return 'flash-outline';
            case 'Shopping': return 'bag-handle-outline';
            default: return 'card-outline';
        }
    }

    getCategoryBgClass(category: string): string {
        switch (category) {
            case 'Food': return 'food-bg';
            case 'Transportation': return 'transpo-bg';
            case 'Salary': return 'salary-bg';
            case 'Utilities': return 'transpo-bg';
            default: return 'food-bg';
        }
    }
}