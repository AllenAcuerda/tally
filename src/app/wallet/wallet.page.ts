import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Data } from '../services/data';
import { Subscription } from 'rxjs';
import { 
    IonContent, 
    IonLabel,
    IonIcon,
    IonSegment, 
    IonSegmentButton,
    IonButton,
    IonInfiniteScroll,
    AlertController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
    restaurantOutline, 
    carOutline, 
    cardOutline, 
    flashOutline, 
    bagHandleOutline, 
    trashOutline,
    personOutline
} from 'ionicons/icons';

@Component({
    selector: 'app-wallet',
    templateUrl: 'wallet.page.html',
    styleUrls: ['wallet.page.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        IonContent,
        IonLabel,
        IonIcon,
        IonSegment, 
        IonSegmentButton,
        IonButton,
        IonInfiniteScroll
    ],
})
export class WalletPage implements OnInit, OnDestroy {
    transactions: any[] = [];
    groupedTransactions: { title: string; items: any[]; latestTime: number }[] = [];
    currentFilter: string = 'all';
    private refreshSub?: Subscription;

    constructor(
        private dataService: Data,
        private cdr: ChangeDetectorRef,
        private alertController: AlertController
    ) {
        addIcons({
            'restaurant-outline': restaurantOutline,
            'car-outline': carOutline,
            'card-outline': cardOutline,
            'flash-outline': flashOutline,
            'bag-handle-outline': bagHandleOutline,
            'trash-outline': trashOutline,
            'person-outline': personOutline
        });

        this.refreshSub = this.dataService.refreshData$.subscribe(() => {
            this.loadTransactions();
        });
    }

    async ngOnInit() {
        await this.loadTransactions();
    }

    async ionViewWillEnter() {
        await this.loadTransactions();
    }

    ngOnDestroy() {
        if (this.refreshSub) {
            this.refreshSub.unsubscribe();
        }
    }

    async loadTransactions() {
        const storedData = await this.dataService.get('Transactions');
        this.transactions = storedData ? storedData.sort((a: any, b: any) => b.id - a.id) : [];
        this.filterAndGroupTransactions();
        this.cdr.detectChanges();
    }

    segmentChanged(event: any) {
        this.currentFilter = event.detail.value;
        this.filterAndGroupTransactions();
    }

    isIncomeItem(tx: any): boolean {
        return tx.type === 'Income' || (tx.type === 'Owed' && tx.isPaid);
    }

    filterAndGroupTransactions() {
        let filtered = this.transactions;

        if (this.currentFilter === 'income') {
            filtered = this.transactions.filter(tx => this.isIncomeItem(tx));
        } else if (this.currentFilter === 'expenses') {
            filtered = this.transactions.filter(tx => !this.isIncomeItem(tx));
        }

        // Sort using dueDate if it's a Bill and dueDate exists, otherwise fall back to date
        filtered.sort((a, b) => {
            const dateA = new Date((a.type === 'Bill' && a.dueDate) ? a.dueDate : a.date).getTime();
            const dateB = new Date((b.type === 'Bill' && b.dueDate) ? b.dueDate : b.date).getTime();
            return dateB - dateA;
        });

        const groups: { [key: string]: { items: any[], latestTime: number } } = {};
        const todayStr = new Date().toDateString();
        const yesterdayObj = new Date();
        yesterdayObj.setDate(yesterdayObj.getDate() - 1);
        const yesterdayStr = yesterdayObj.toDateString();

        for (let tx of filtered) {
            // Use dueDate for grouping if it's a Bill
            const effectiveDate = (tx.type === 'Bill' && tx.dueDate) ? tx.dueDate : tx.date;
            const txDate = new Date(effectiveDate);
            let label = '';
            
            if (txDate.toDateString() === todayStr) {
                label = 'Today';
            } else if (txDate.toDateString() === yesterdayStr) {
                label = 'Yesterday';
            } else {
                label = txDate.toLocaleDateString();
            }

            if (!groups[label]) {
                groups[label] = { items: [], latestTime: txDate.getTime() };
            }
            groups[label].items.push(tx);
        }

        this.groupedTransactions = Object.keys(groups).map(title => ({
            title,
            items: groups[title].items,
            latestTime: groups[title].latestTime
        })).sort((a, b) => b.latestTime - a.latestTime);

        this.cdr.detectChanges();
    }

    async confirmDelete(id: number) {
        const alert = await this.alertController.create({
            header: 'Delete Transaction',
            message: 'Are you sure you want to delete this?',
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: async () => {
                        await this.deleteTransaction(id);
                    }
                }
            ]
        });
        await alert.present();
    }

    async deleteTransaction(id: number) {
        const updated = this.transactions.filter(tx => tx.id !== id);
        await this.dataService.set('Transactions', updated);
        await this.loadTransactions();
    }

    formatTime(dateString: string): string {
        if (!dateString) return '';
        const txDate = new Date(dateString);
        return txDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    getTransactionSubtitle(tx: any, groupTitle: string): string {
        if (tx.type === 'Bill' && tx.dueDate) {
            const dueDateFormatted = new Date(tx.dueDate).toLocaleDateString([], { 
                month: 'short', 
                day: 'numeric' 
            });
            return `Due on ${dueDateFormatted}`;
        }
        
        return `${tx.category} - ${groupTitle}, ${this.formatTime(tx.date)}`;
    }

    getCategoryIcon(category: string): string {
        switch (category) {
            case 'Food': return 'restaurant-outline';
            case 'Transportation': return 'car-outline';
            case 'Salary': return 'card-outline';
            case 'Utilities': return 'flash-outline';
            case 'Shopping': return 'bag-handle-outline';
            case 'Owed to you': return 'person-outline';
            default: return 'card-outline';
        }
    }

    getCategoryCssClass(tx: any): string {
        if (this.isIncomeItem(tx)) {
            return 'income'; 
        }
        switch (tx.category) {
            case 'Food': return 'food';
            case 'Transportation': return 'transport';
            case 'Shopping': return 'shopping';
            default: return 'food';
        }
    }
}