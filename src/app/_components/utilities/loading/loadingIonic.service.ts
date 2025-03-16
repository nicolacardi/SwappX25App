import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { concatMap, finalize, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LoadingServiceIonic {
  private loading: HTMLIonLoadingElement | null = null;
  private isLoading = false; // Nuova variabile per evitare duplicati

  constructor(private loadingCtrl: LoadingController) {}

  async loadingOn() {
    if (this.isLoading) return; // Evita di creare più loader contemporaneamente

    this.isLoading = true;
    this.loading = await this.loadingCtrl.create({
      message: 'Caricamento...',
      spinner: 'crescent',
    });
    await this.loading.present();
  }

  async loadingOff() {
    if (!this.isLoading) return; // Evita errori se già chiuso

    this.isLoading = false;
    if (this.loading) {
      try {
        await this.loading.dismiss();
      } catch (e) {
        console.warn("Il loader era già chiuso:", e);
      }
      this.loading = null;
    }
  }

  showLoaderUntilCompleted<T>(obs$: Observable<T>): Observable<T> {
    return of(null).pipe(
      tap(() => this.loadingOn()),
      concatMap(() => obs$),
      finalize(() => this.loadingOff())
    );
  }
}
