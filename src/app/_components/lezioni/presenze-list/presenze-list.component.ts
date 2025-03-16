import { Component, Input, OnInit, ViewChild }  from '@angular/core';
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

  loadData () {
    if (this.lezioneID != undefined) {
      const obsPresenze$ = this.svcPresenze.listByLezione(this.lezioneID);
      const loadPresenze$ = this._loadingService.showLoaderUntilCompleted(obsPresenze$);

      loadPresenze$.subscribe(res => {
        console.log("presenze-list - loadData - res", res);
        this.listaPresenze.data = res;
      });
    }
  }

  changedCkPresente(checked: boolean, presenza: CAL_Presenza) {
    presenza.ckPresente = checked;
    this.svcPresenze.put(presenza).subscribe();
  }

}
