import { Component, OnInit }     from '@angular/core';
import { Observable }            from 'rxjs';

import { LoadingServiceIonic }   from '../../utilities/loading/loadingIonic.service';
import { ALU_Alunno }            from 'src/app/_models/ALU_Alunno';
import { AlunniService }         from '../alunni.service';
import { ActivatedRoute }        from '@angular/router';
import { TitleService }          from 'src/app/_services/title.service';

@Component({
  selector: 'app-alunni-list',
  templateUrl: './alunni-list.component.html',
  styleUrls: ['../alunni.scss'],
  standalone: false
})
export class AlunniListComponent implements OnInit {
  alunni: (ALU_Alunno & { isOpen: boolean })[] = [];  // Aggiungi `isOpen` per ogni alunno
  alunniOriginali: (ALU_Alunno & { isOpen: boolean })[] = []; // Copia originale degli alunni
  classeSezioneAnnoID!: number;
  filterValue = '';

  constructor(
    private svcAlunni            : AlunniService,
    private route                : ActivatedRoute,
    private svcTitle             : TitleService,
    private _loadingService      : LoadingServiceIonic
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    let obsAlunni$: Observable<ALU_Alunno[]>;

    this.route.params.subscribe(params => {
      this.classeSezioneAnnoID = +params['classeSezioneAnnoID'];
      const classeEsezione = params['classeEsezione'];
      this.svcTitle.setTitle("Alunni " + classeEsezione);

      obsAlunni$ = this.svcAlunni.listByClasseSezioneAnnoWithParents(this.classeSezioneAnnoID);
      const loadAlunni$ = this._loadingService.showLoaderUntilCompleted(obsAlunni$);

      loadAlunni$.subscribe(res => {
        // Aggiungiamo `isOpen: false` e ordiniamo per cognome
        this.alunni = res.map(alunno => ({ ...alunno, isOpen: false }))
                         .sort((a, b) => a.persona.cognome.localeCompare(b.persona.cognome));
        this.alunniOriginali = [...this.alunni]; // Salviamo una copia originale

        console.log("alunni-list - loadData - res", res);
      });
    });
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filterAlunni();
  }

  filterAlunni() {
    if (!this.filterValue) {
      this.alunni = [...this.alunniOriginali]; // Ripristina l'elenco originale
    } else {
      this.alunni = this.alunniOriginali.filter(alunno =>
        alunno.persona.nome.toLowerCase().includes(this.filterValue) ||
        alunno.persona.cognome.toLowerCase().includes(this.filterValue) ||
        alunno.persona.email.toLowerCase().includes(this.filterValue)
      );
    }
  }

  toggleCard(alunno: { isOpen: boolean }) {
    alunno.isOpen = !alunno.isOpen;
  }
}


