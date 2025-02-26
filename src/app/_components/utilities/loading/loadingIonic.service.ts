import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { concatMap, finalize, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LoadingServiceIonic {
  private loading: HTMLIonLoadingElement | null = null;

  constructor(private loadingCtrl: LoadingController) {}

  async loadingOn() {
    this.loading = await this.loadingCtrl.create({
      message: 'Caricamento...',
      spinner: 'crescent',
    });
    await this.loading.present();
  }

  async loadingOff() {
    if (this.loading) {
      await this.loading.dismiss();
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
