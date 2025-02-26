//#region ----- IMPORTS ------------------------
import { Component, OnInit }     from '@angular/core';
import { ActivatedRoute }        from '@angular/router';
import { Observable }            from 'rxjs';

//components

//services
import { PagamentiService }      from '../pagamenti.service';
import { TitleService }          from 'src/app/_services/title.service';
import { AnniScolasticiService } from '../../anni-scolastici/anni-scolastici.service';

//models

//#end
@Component({
  selector: 'app-pagamenti',
  templateUrl: './pagamenti-list.component.html',
  styleUrls: ['../pagamenti.css'],
  standalone: false
})
export class PagamentiListComponent implements OnInit {
  alunnoID!       : number;
  annoID!         : number;
  obsPagamenti$!  : Observable<any>;
  Pagamenti!      : any[];


  private mesi = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  constructor(
              private route               : ActivatedRoute,
              private svcPagamenti        : PagamentiService,
              private svcTitle            : TitleService,
              private svcAnno             : AnniScolasticiService
            ) {}

  ngOnInit() {

    this.svcTitle.setTitle('Pagamenti');

    
    this.route.params.subscribe(params => {
      this.alunnoID = +params['alunnoID']; // Converte in numero
      this.annoID = +params['annoID'];
      this.svcAnno.get(this.annoID).subscribe(
        anno=> {
          this.svcTitle.setTitle('Pagamenti '+anno.annoscolastico.slice(2));
        }
      )
      console.log("Ricevuti Alunno ID:", this.alunnoID, "Anno ID:", this.annoID);

      this.obsPagamenti$ = this.svcPagamenti.listByAlunnoAnno(this.alunnoID, this.annoID);
    
      this.obsPagamenti$.subscribe( 

        Pagamenti => {
          this.Pagamenti = Pagamenti;
          console.log ("Pagamenti", Pagamenti);
        },
        
      );
    });
  }


  
  getNomeMese(mese: number): string {
    return this.mesi[mese - 1] || '';  // Restituisce il mese in base al numero (1-12)
  }


}
