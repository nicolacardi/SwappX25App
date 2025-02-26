import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) {}

  async presentToast(message: string, duration: number = 2000, position: 'top' | 'bottom' | 'middle' = 'bottom') {
    const toast = await this.toastController.create({
      message: message, // Il messaggio che mostri nel toast
      duration: duration, // Durata del toast
      position: position, // Posizione del toast
      color: 'dark', // Colore del toast
      animated: true, // Animazione
    });

    await toast.present();
  }
}
