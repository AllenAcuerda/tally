import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Data {
  private _storage: Storage | null = null;
  private _initPromise: Promise<void> | null = null;
  
  // Central notification stream for all pages
  public refreshData$ = new Subject<void>();

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    if (!this._initPromise) {
      this._initPromise = (async () => {
        const storage = await this.storage.create();
        this._storage = storage;
      })();
    }
    return this._initPromise;
  }

  public async set(key: string, value: any) {
    await this.init();
    const result = await this._storage?.set(key, value);
    
    // Broadcast refresh signal to Home, Wallet, and Bills pages
    if (key === 'Transactions') {
      this.refreshData$.next();
    }
    
    return result;
  }

  public async get(key: string) {
    await this.init();
    return await this._storage?.get(key);
  }
}