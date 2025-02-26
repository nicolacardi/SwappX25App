import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private titleSource = new BehaviorSubject<string>(''); // inizializza con un valore vuoto
  currentTitle = this.titleSource.asObservable(); // esponi l'osservabile

  constructor() { }

  setTitle(newTitle: string) {
    this.titleSource.next(newTitle); // aggiorna il titolo
  }
}
