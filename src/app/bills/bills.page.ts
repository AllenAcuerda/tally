import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Data } from '../services/data';
import { Subscription } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { AddEntryPage } from '../add-entry/add-entry-page';
import { 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonLabel,
    IonItem,
    IonCard,
    IonList,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonIcon,
    IonSegment, 
    IonSegmentButton,
    IonCheckbox,
    IonButton,
    IonBadge
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
    add, 
    flashOutline, 
    checkmarkOutline, 
    calendarOutline, 
    personOutline,
    cardOutline 
} from 'ionicons/icons';

@Component({
    selector: 'bills-page',
    templateUrl: 'bills.page.html',
    styleUrls: ['bills.page.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        IonButton,
        IonBadge,
        IonHeader, 
        IonToolbar, 
        IonTitle, 
        IonContent,
        IonItem, 
        IonLabel,
        IonCard,
        IonList,
        IonInfiniteScroll,
        IonInfiniteScrollContent,
        IonIcon,
        IonSegment, 
        IonSegmentButton,
        IonCheckbox
    ],
})
export class BillsPage implements OnInit, OnDestroy {
    currentSegment: string = 'pending';
    transactions: any[] = [];
    
    pendingBills: any[] = [];
    paidItems: any[] = [];
    owedItems: any[] = [];
    
    paidThisMonthTotal: number = 0;
    private refreshSub?: Subscription;

    constructor(
        private dataService: Data,
        private modalController: ModalController,
        private cdr: ChangeDetectorRef
    ) {
        addIcons({
            'add': add,
            'flash-outline': flashOutline,
            'checkmark-outline': checkmarkOutline,
            'calendar-outline': calendarOutline,
            'person-outline': personOutline,
            'card-outline': cardOutline
        });
    }

    ngOnInit() {
        this.loadData();
        this.refreshSub = this.dataService.refreshData$.subscribe(() => {
            this.loadData();
        });
    }

    async ionViewWillEnter() {
        await this.loadData();
    }

    ngOnDestroy() {
        if (this.refreshSub) {
            this.refreshSub.unsubscribe();
        }
    }

    async loadData() {
        const stored = await this.dataService.get('Transactions');
        this.transactions = stored || [];

        const bills = this.transactions.filter(t => t.type === 'Bill');
        const owed = this.transactions.filter(t => t.type === 'Owed');

        this.pendingBills = bills.filter(t => !t.isPaid);
        this.owedItems = owed.filter(t => !t.isPaid);
        
        this.paidItems = this.transactions.filter(t => (t.type === 'Bill' || t.type === 'Owed') && t.isPaid);

        const now = new Date();
        this.paidThisMonthTotal = this.paidItems
            .filter(item => {
                const itemDateStr = item.paidDate || item.date || item.dueDate;
                if (!itemDateStr) return false;
                const itemDate = new Date(itemDateStr);
                return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

        this.cdr.detectChanges();
    }

    segmentChanged(event: any) {
        this.currentSegment = event.detail.value;
    }

    async markAsPaid(item: any) {
        item.isPaid = true;
        item.paidDate = new Date().toISOString();

        const updatedTransactions = this.transactions.map(t => t.id === item.id ? item : t);
        await this.dataService.set('Transactions', updatedTransactions);
        await this.loadData();
    }

    async openAddModal() {
        const initialType = this.currentSegment === 'owed' ? 'Owed' : 'Bill';

        const modal = await this.modalController.create({
            component: AddEntryPage,
            breakpoints: [0, 0.9],
            initialBreakpoint: 0.9,
            componentProps: {
                selectedType: initialType
            }
        });

        await modal.present();
    }
}