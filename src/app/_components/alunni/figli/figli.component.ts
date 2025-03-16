import { Component, OnInit }                 from '@angular/core';
import { map, switchMap, forkJoin, of }      from 'rxjs';
import { ALU_Alunno }                        from 'src/app/_models/ALU_Alunno';
import { User }                              from 'src/app/_user/Users';
import { AlunniService }                     from '../alunni.service';
import { GenitoriService }                   from '../../genitori/genitori.service';
import { Utility }                           from '../../utilities/utility.component';
import { UserService }                       from 'src/app/_user/user.service';
import { _UT_UserFoto }                      from 'src/app/_models/_UT_UserFoto';
import { IscrizioniService }                 from '../../iscrizioni/iscrizioni.service';
import { CLS_Iscrizione }                    from 'src/app/_models/CLS_Iscrizione';
import { Router }                            from '@angular/router';
import { LoadingServiceIonic }               from '../../utilities/loading/loadingIonic.service';

@Component({
  selector: 'app-figli',
  templateUrl: './figli.component.html',
  styleUrls: ['../alunni.scss'],
  standalone: false
})
export class FigliComponent implements OnInit {
  annoCorrente!: number;
  public currUser!: User;
  // figli: (ALU_Alunno & { foto?: _UT_UserFoto })[] = [];

  figli: (ALU_Alunno & { 
    foto?: _UT_UserFoto, 
    iscrizione?: CLS_Iscrizione 
  })[] = [];
  

  constructor(
    private svcUser                          : UserService,
    private svcAlunni                        : AlunniService,
    private svcGenitori                      : GenitoriService,
    private svcIscrizioni                    : IscrizioniService,
    private router                           : Router,
    private _loadingService                  : LoadingServiceIonic,
  ) { }

  async ngOnInit() {
    this.currUser = await Utility.getCurrentUser();

    if (this.currUser?.persona?._LstRoles?.includes('Genitore')) {
      const personaID = this.currUser.persona.id;

      const figli$ = this.svcGenitori.getByPersona(personaID).pipe(
        switchMap(genitore => {
          return genitore?.id ? this.svcAlunni.listByGenitore(genitore.id) : of([]);
        }),
        switchMap(alunni => {
          if (!alunni.length) return of([]);

          const annoCorrenteStr = localStorage.getItem('AnnoCorrente');
          this.annoCorrente = annoCorrenteStr ? JSON.parse(annoCorrenteStr).parValue : null;
  
          if (!this.annoCorrente) {
            console.error("Anno scolastico corrente non trovato.");
            return of([]);
          }

          // Per ogni alunno, ottieni lo User e la Foto se esiste
          const richiesteDati = alunni.map(alunno =>
            this.svcUser.getByPersonaID(alunno.persona.id).pipe(
              switchMap(user => {
                return user ? this.svcUser.getFotoByUserID(user.id) : of(null);
              }),
              switchMap(foto => {
                return this.svcIscrizioni.getByAlunnoAndAnno(this.annoCorrente, alunno.id).pipe(
                  map(iscrizione => ({
                    ...alunno,
                    foto: foto ?? undefined,
                    iscrizione: iscrizione ?? undefined
                  }))
                );
              })
            )
          );


          return forkJoin(richiesteDati);
        })
      );
      
      this._loadingService.showLoaderUntilCompleted(figli$).subscribe({
        next: figliConDati => {
          this.figli = figliConDati;
          console.log("Figli completi:", this.figli);
        },
        error: err => console.error("Errore nel caricamento dei figli:", err)
      });
    }
  }

  mostraOrario(classeSezioneAnnoID: number, classeEsezione: string) {
    this.router.navigate(['/orario', classeSezioneAnnoID, classeEsezione]);
  }

  mostraPagamenti(alunnoID: number, annoID: number) {
    this.router.navigate(['/pagamenti', alunnoID, annoID]);
  }

  mostraPresenze(alunnoID: number, annoID: number) {
    this.router.navigate(['/presenze', alunnoID, annoID]);
  }

  mostraDocumenti(alunnoID: number) {
    this.router.navigate(['/documenti', alunnoID]);
  }
}
