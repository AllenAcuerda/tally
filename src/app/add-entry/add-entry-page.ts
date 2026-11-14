import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Data } from '../services/data';
import { 
  IonContent, 
  IonIcon, 
  IonButton, 
  IonSegment,
  IonSegmentButton,
  IonItem,
  IonInput,
  IonLabel,
  IonDatetime, 
  IonDatetimeButton, 
  IonModal,
  ModalController,
  ToastController 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  restaurantOutline, 
  carOutline, 
  flashOutline, 
  bagHandleOutline, 
  cardOutline, 
  calendarOutline, 
  chevronForwardOutline,
  personOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-add-entry',
  templateUrl: './add-entry.page.html',
  styleUrls: ['./add-entry.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonButton,
    IonSegment,
    IonSegmentButton,
    IonItem,
    IonInput,
    IonLabel,
    IonDatetime, 
    IonDatetimeButton, 
    IonModal
  ],
})
export class AddEntryPage implements OnInit {
  @Input() selectedType: string = 'Expenses';
  amount: number | null = null;
  formattedAmount: string = ''; 
  titleOrNote: string = '';
  selectedCategory: string = 'Food';
  selectedDate: string = new Date().toISOString();

  dueDate: string = new Date().toISOString();
  personName: string = '';

  constructor(
    private dataService: Data,
    private modalController: ModalController,
    private toastController: ToastController
  ) {
    addIcons({
      'restaurant-outline': restaurantOutline,
      'car-outline': carOutline,
      'flash-outline': flashOutline,
      'bag-handle-outline': bagHandleOutline,
      'card-outline': cardOutline,
      'calendar-outline': calendarOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'person-outline': personOutline
    });
  }

  ngOnInit() {
    this.updateCategoryForType(this.selectedType);
  }

  formatAmount(event: any) {
    const inputVal = event.detail.value || '';
    
    const cleanValue = inputVal.replace(/[^0-9.]/g, '');
    
    const parts = cleanValue.split('.');
    let integerPart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

    if (integerPart) {
      integerPart = Number(integerPart).toLocaleString('en-US');
    }

    this.formattedAmount = integerPart + decimalPart;
    this.amount = cleanValue ? parseFloat(cleanValue) : null;

    const inputElement = event.target as HTMLIonInputElement;
    if (inputElement && inputElement.value !== this.formattedAmount) {
      inputElement.value = this.formattedAmount;
    }
  }

  // getting the selected type of entry
  selectType(event: any) {
    const newType = event.detail.value;
    this.selectedType = newType;
    this.updateCategoryForType(newType);
  }

  // automatic focus on the input field when the modal opens
  updateCategoryForType(type: string) {
    if (type === 'Expenses') {
      this.selectedCategory = 'Food';
    } else if (type === 'Income') {
      this.selectedCategory = 'Salary';
    } else if (type === 'Bill') {
      this.selectedCategory = 'Utilities';
    } else if (type === 'Owed') {
      this.selectedCategory = 'Owed to you'; 
    }
  }

  // warning message if the user did not input the required fields
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'warning',
      position: 'bottom'
    });
    await toast.present();
  }

  async saveEntry() {
    // validation most input amount greater than 0
    if (!this.amount || Number(this.amount) <= 0) {
      await this.showToast('Please enter a valid amount greater than 0.');
      return;
    }

    if (this.selectedType === 'Owed' && !this.personName.trim()) {
      await this.showToast("Please enter the person's name.");
      return;
    }

    // entry
    const newEntry: any = {
      type: this.selectedType, 
      amount: Number(this.amount), 
      category: this.selectedType === 'Owed' ? 'Owed to you' : this.selectedCategory,
      date: this.selectedDate,
      note: this.titleOrNote,
      isPaid: false,
      id: Date.now()
    };

    if (this.selectedType === 'Bill') {
      newEntry.dueDate = this.dueDate;
    }

    if (this.selectedType === 'Owed') {
      newEntry.person = this.personName.trim();
    }

    try {
      let existingEntries = await this.dataService.get('Transactions') || [];
      existingEntries.push(newEntry);
      await this.dataService.set('Transactions', existingEntries);

      this.closeModal();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  }

  async closeModal() {
    await this.modalController.dismiss();
  }
}