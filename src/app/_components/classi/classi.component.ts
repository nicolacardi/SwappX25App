import { Component, OnInit }                 from '@angular/core';
import { map, switchMap, forkJoin, of }      from 'rxjs';

import { ClassiSezioniAnniService }          from './classi-sezioni-anni.service';
import { Utility }                           from '../utilities/utility.component';
import { User }                              from 'src/app/_user/Users';
import { DocentiService }                    from '../docenti/docenti.service';
import { LoadingServiceIonic }               from '../utilities/loading/loadingIonic.service';
import { CLS_ClasseSezioneAnno }             from 'src/app/_models/CLS_ClasseSezioneAnno';
import { DocenzeService }                    from '../docenze/docenze.service';
import { ClasseConDocenze, CLS_ClasseDocenteMateria }          from 'src/app/_models/CLS_ClasseDocenteMateria';
import { Router }                            from '@angular/router';

@Component({
  selector: 'app-classi',
  templateUrl: './classi.component.html',
  styleUrls: ['./classi.scss'],
  standalone: false
})
export class ClassiComponent  implements OnInit {

  public currUser!      : User;
  public docenteID!     : number;
  public annoCorrente!  : number;
  public ClassiDocenze        : ClasseConDocenze[] = [];


    constructor(
        // private svcClassiSezioniAnni       : ClassiSezioniAnniService,
        private svcDocenze        : DocenzeService,
        private svcDocenti        : DocentiService,
        private _loadingService   : LoadingServiceIonic,
        private router            : Router,
        

    ) { }

    async ngOnInit() {
        this.currUser = await Utility.getCurrentUser();

        if (this.currUser?.persona?._LstRoles?.includes('Docente')) {
            const personaID = this.currUser.persona.id;

            const docenze$ = this.svcDocenti.getByPersona(personaID).pipe(
                switchMap(docente => {

                    this.docenteID = docente?.id;
                    if (!docente?.id) return of([]); // Se non è un docente valido, restituiamo un array vuoto

                    const annoCorrenteStr = localStorage.getItem('AnnoCorrente');
                    this.annoCorrente = annoCorrenteStr ? JSON.parse(annoCorrenteStr).parValue : null;

                    if (!this.annoCorrente) {
                        console.error("Anno scolastico corrente non trovato.");
                        return of([]);
                    }

                    return this.svcDocenze.listByDocenteAnno(docente.id, this.annoCorrente);
                })
            );

            this._loadingService.showLoaderUntilCompleted(docenze$).subscribe({
                next: docenze => {
                    //this.docenze = docenze;
                    this.ClassiDocenze = this.groupByClasseSezioneAnno(docenze);

                    console.log("Classi con materie:", this.ClassiDocenze);
                },
                error: err => console.error("Errore nel caricamento delle classi con materie:", err)
            });
        }
    }


    mostraOrario(classeSezioneAnnoID: number, classeEsezione: string) {
        //this.router.navigate(['/orario', classeSezioneAnnoID, classeEsezione]);

        this.router.navigate(['/orario', classeSezioneAnnoID, classeEsezione], { queryParams: { docenteID: this.docenteID } });


    }


    groupByClasseSezioneAnno(docenze: CLS_ClasseDocenteMateria[]): ClasseConDocenze[] {
        const grouped: { [key: number]: ClasseConDocenze } = {};
    
        docenze.forEach(docenza => {
            const key = docenza.classeSezioneAnnoID;
            
            if (!grouped[key]) {
                grouped[key] = {
                    classeSezioneAnno: docenza.classeSezioneAnno!,
                    materie: []
                };
            }
            grouped[key].materie.push(docenza.materia!);
        });
    
        return Object.values(grouped);
    }

}
