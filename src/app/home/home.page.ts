import { Component, OnInit }     from '@angular/core';
import { User }                  from '../_user/Users';
import { TitleService }          from '../_services/title.service';
import { Utility }               from '../_components/utilities/utility.component';
import { RisorseService } from '../_components/risorse/risorse.service';
import { _UT_Risorsa } from '../_models/_UT_Risorsa';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  currUser!                   : User;
  bachecaItems                : _UT_Risorsa[] = []; // Conterrà le immagini filtrate
  expandedIndex               : number | null = null; // Tiene traccia dell'immagine aperta
  contattiScuolaExpanded      : boolean = false;

  constructor(
            private svcTitle        : TitleService,
            private svcRisorse      : RisorseService

  ) {

    this.currUser = Utility.getCurrentUser();
  }

   ngOnInit() {

    //this.currUser = Utility.getCurrentUser();
    console.log ("home.page - ngOnInit - CurrUser", this.currUser);
    this.svcTitle.setTitle(`Homepage`);

    this.svcRisorse.list().subscribe((data: any[]) => {
      
      this.bachecaItems = [];
      const filteredItems = data.filter(item => item.nomeFile.startsWith("BachecaApp"));

      filteredItems.sort((a, b) => a.nomeFile.localeCompare(b.nomeFile));

      console.log ("home.page - ngOnInit - filteredItems",filteredItems);
      this.bachecaItems = filteredItems.map(item => ({ ...item, FileBase64: null }));
      
      
      this.bachecaItems.forEach((item, index) => {
        this.svcRisorse.get(item.id).subscribe((fileData: any) => {
          console.log("File ricevuto:", fileData);
          this.bachecaItems[index].fileBase64 = fileData.fileBase64;
          console.log("home.page ngOnInit - bachecaItems", this.bachecaItems);
        });
      });
    });
  

  }

  toggleExpand(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }



  toggleContattiScuola() {
    this.contattiScuolaExpanded = !this.contattiScuolaExpanded;
  }

}
