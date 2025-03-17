import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PresenzeService } from '../presenze.service';
import { CAL_Presenza } from 'src/app/_models/CAL_Presenza';
import { TitleService } from 'src/app/_services/title.service';
import { ActivatedRoute } from '@angular/router';
import { LoadingServiceIonic } from '../../utilities/loading/loadingIonic.service';

@Component({
  selector: 'app-presenze-alunno-list',
  templateUrl: './presenze-alunno-list.component.html',
  styleUrls: ['../lezioni.scss'],
  standalone:false
})
export class PresenzeAlunnoListComponent implements OnInit {

  alunnoID!             : number;
  annoID!               : number;
  presenze              : CAL_Presenza[] = [];
  presenzeFiltrate      : CAL_Presenza[] = [];
  mostraSoloAssenti     = false;
  obsPresenze$!         : Observable<CAL_Presenza[]>;

  constructor(
              private route:            ActivatedRoute,
              private svcPresenze:      PresenzeService, 
              private _loadingService:  LoadingServiceIonic,
              private svcTitle:         TitleService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {

    this.svcTitle.setTitle(`Presenze`);

    this.route.params.subscribe(params => {
      this.alunnoID = +params['alunnoID']; // Converte in numero
      this.annoID = +params['annoID'];
      console.log("Ricevuti Alunno ID:", this.alunnoID, "Anno ID:", this.annoID);

      this.obsPresenze$ = this.svcPresenze.listByAlunno(this.alunnoID);
    
      const loadPresenze$ = this._loadingService.showLoaderUntilCompleted(this.obsPresenze$);
      loadPresenze$.subscribe( 
        Presenze => {
          this.presenze = Presenze.sort((a, b) => {
            const dateA = new Date(a.lezione!.dtCalendario).getTime();
            const dateB = new Date(b.lezione!.dtCalendario).getTime();
          
            // Prima ordina per dtCalendario (decrescente)
            if (dateB !== dateA) {
              return dateB - dateA;
            }
          
            // Se le date sono uguali, ordina per h_Ini (crescente)
            return a.lezione!.h_Ini.localeCompare(b.lezione!.h_Ini);
          });


          this.filtraPresenze(); // Applica il filtro iniziale

          console.log ("Presenze", Presenze);
        },
        
      );
    });
  }

  toggleFiltroAssenti() {
    this.mostraSoloAssenti = !this.mostraSoloAssenti;
    this.filtraPresenze();
  }

  filtraPresenze() {
    if (this.mostraSoloAssenti) {
      this.presenzeFiltrate = this.presenze.filter(p => !p.ckPresente);
    } else {
      this.presenzeFiltrate = [...this.presenze];
    }
  }
}
