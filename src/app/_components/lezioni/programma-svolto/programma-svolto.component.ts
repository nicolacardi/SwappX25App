import { Component, OnInit }     from '@angular/core';
import { ActivatedRoute }        from '@angular/router';
import { LezioniService }        from '../lezioni.service';
import { LoadingServiceIonic }   from '../../utilities/loading/loadingIonic.service';
import { TitleService }          from 'src/app/_services/title.service';
import { ModalController }       from '@ionic/angular';
import { ToastService }          from 'src/app/_services/toast.service';
import { CAL_Lezione }           from 'src/app/_models/CAL_Lezione';
import { MaterieService }        from '../../materie/materie.service';
import { FormatoData, Utility }  from '../../utilities/utility.component';


@Component({
  selector: 'app-programma-svolto',
  templateUrl: './programma-svolto.component.html',
  styleUrls: ['../lezioni.scss'],
  standalone: false
})
export class ProgrammaSvoltoComponent  implements OnInit {

  lezioni: (CAL_Lezione & { isOpen: boolean })[] = [];  // Aggiungi `isOpen` per ogni alunno
  lezioniOriginali: (CAL_Lezione & { isOpen: boolean })[] = []; // Copia originale degli alunni
  

  filterValue = '';
  constructor(
              private route                : ActivatedRoute,
              private svcLezioni           : LezioniService,
              private svcMaterie           : MaterieService,
              private _loadingService      : LoadingServiceIonic,
              private svcTitle             : TitleService,
              private modalCtrl            : ModalController,
              private _toast               : ToastService,
  ) { }



  ngOnInit() {

    this.svcTitle.setTitle(`Programma`);
    this.route.paramMap.subscribe(params => {
      const classeSezioneAnnoIDStr = params.get('classeSezioneAnnoID') ?? '';
      const classeEsezione = params.get('classeEsezione') ?? '';

      const classeSezioneAnnoID = parseInt(classeSezioneAnnoIDStr, 10);

      this.route.queryParamMap.subscribe(queryParams => {
        const materiaIDStr = params.get('materiaID') ?? '';
        const materiaID = materiaIDStr ? parseInt(materiaIDStr, 10) : 0;
        this.svcMaterie.get(materiaID).subscribe(
          materia =>  this.svcTitle.setTitle(materia.descrizione + ' ' + classeEsezione)

        );

        const obsLezioni$ = this.svcLezioni.listByMateriaClasseSezioneAnno(materiaID, classeSezioneAnnoID);
        const loadLezioni$ = this._loadingService.showLoaderUntilCompleted(obsLezioni$);
  
        loadLezioni$.subscribe({
          next: res => {
            //tengo le lezioni firmate, ordinate e ci aggiungo il campo isOpen

            this.lezioni = res
            .filter (lezione=> lezione.ckFirma == 1)
            .sort((a, b) => new Date(b.dtCalendario).getTime() - new Date(a.dtCalendario).getTime())
            .map(lezione => (
              { ...lezione, 
                isOpen: false,
                dtCalendario: Utility.formatDate(lezione.dtCalendario, FormatoData.dd_mm_yyyy) 
               }
            ));

            console.log ("programma-svolto - ngOnInit lezioni", this.lezioni);


            this.lezioniOriginali = [...this.lezioni]; // Salviamo una copia originale

          },
          error: err => console.error("Errore nel caricamento delle lezioni:", err)
        });

      });
    });
  }

  filterLezioni() {
    if (!this.filterValue) {
      this.lezioni = [...this.lezioniOriginali]; // Ripristina l'elenco originale
    } else {
      console.log (this.lezioni);
      this.lezioni = this.lezioniOriginali.filter(lezione =>
        
        (lezione.argomento?.toLowerCase() || '').includes(this.filterValue)

        // || alunno.persona.cognome.toLowerCase().includes(this.filterValue) 
      );
    }
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filterLezioni();
  }

  toggleCard(lezione: { isOpen: boolean }) {
    lezione.isOpen = !lezione.isOpen;
  }

  

}
