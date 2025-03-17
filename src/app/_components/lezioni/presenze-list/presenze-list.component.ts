import { Component, Input, OnInit, ViewChild, OnChanges }  from '@angular/core';
import { Observable }                           from 'rxjs';

//services
import { LoadingServiceIonic }                  from '../../utilities/loading/loadingIonic.service';
import { PresenzeService }                      from '../presenze.service';

//models
import { CAL_Presenza }                         from 'src/app/_models/CAL_Presenza';

@Component({
  selector:     'app-presenze-list',
  templateUrl:  './presenze-list.component.html',
  styleUrls:    ['../lezioni.scss'],
  standalone:   false
})

export class PresenzeListComponent implements OnInit {

//#region ----- Variabili ----------------------
  listaPresenze: { data: CAL_Presenza[] } = { data: [] };
//#endregion

//#region ----- Input ---------
  @Input() lezioneID!: number;
//#endregion

  constructor(
    private svcPresenze       : PresenzeService,
    private _loadingService   : LoadingServiceIonic,
  ) { }

  ngOnInit () {
    this.loadData();
  }

  // ngOnChanges () {
  //   console.log("ngOnChanges chiamato! lezioneID:", this.lezioneID);

  //   this.loadData();
  // }

  loadData () {
    if (this.lezioneID != undefined) {
      const obsPresenze$ = this.svcPresenze.listByLezione(this.lezioneID);
      const loadPresenze$ = this._loadingService.showLoaderUntilCompleted(obsPresenze$);

      loadPresenze$.subscribe({
        next: res => {
          console.log("presenze-list - loadData - res", res);
          this.listaPresenze.data = res.sort((a, b) => b.lezione!.dtCalendario.localeCompare(a.lezione!.dtCalendario));

        },
        error: err => console.error("Errore nel caricamento delle presenze", err),
        complete: () => console.log("Caricamento completato!")
      });
    }
  }

  changedCkPresente(checked: boolean, presenza: CAL_Presenza) {
    presenza.ckPresente = checked;
    this.svcPresenze.put(presenza).subscribe();
  }

  
  

}
