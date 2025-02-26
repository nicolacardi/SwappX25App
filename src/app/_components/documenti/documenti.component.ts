import { Component, OnInit } from '@angular/core';
import { CertCompetenzeService } from './certcompetenze.service';
import { ActivatedRoute } from '@angular/router';
import { PagelleService } from './pagelle.service';
import { FilesService } from './files.service';
import { saveAs } from 'file-saver';
import { ToastService } from 'src/app/_services/toast.service';

@Component({
  selector: 'app-documenti',
  templateUrl: './documenti.component.html',
  styleUrls: ['./documenti.component.scss'],
  standalone:false
})
export class DocumentiComponent  implements OnInit {


  alunnoID!: number;
  //documenti: { docID: number; tipoDoc: string; descrizione: string }[] = [];

  documenti: { 
    docID: number; 
    tipoDoc: string; 
    descrizione: string;
    classeSezione: string;  // Aggiungi proprietà per la classe e la sezione
    anno: string;           // Aggiungi proprietà per l'anno scolastico
  }[] = [];
  constructor(

              private route:              ActivatedRoute,
              private svcPagelle:         PagelleService,
              private svcCertCompetenze:  CertCompetenzeService,
              private svcFiles:            FilesService,
              private _toast:             ToastService,
              
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.alunnoID = +params['alunnoID']; // Converte in numero
      console.log("Ricevuto Alunno ID:", this.alunnoID);
      this.documenti = [];
      this.caricaDocumenti();
    });
  }

  caricaDocumenti() {
    this.svcPagelle.listByAlunno(this.alunnoID).subscribe(pagelle => {
      // Filtra le pagelle con StatoID >= 3
      const pagelleFiltrate = pagelle.filter(p => p.statoID! >= 3);
      
      pagelleFiltrate.forEach(p => {
        const iscrizione = p.iscrizione; 
        const classeSezioneAnno = iscrizione!.classeSezioneAnno; 
        this.documenti.push({
          docID: p.id!,
          tipoDoc: 'Pagella',
          descrizione: `Pagella Quadrimestre ${p.periodo}`,
          classeSezione: classeSezioneAnno!.classeSezione!.classe!.descrizione, // Ottieni classe
          anno: classeSezioneAnno.anno.annoscolastico // Ottieni anno
        });
      });
    });

    this.svcCertCompetenze.listByAlunno(this.alunnoID).subscribe(certificati => {
      // Filtra i certificati con StatoID >= 3
      const certificatiFiltrati = certificati.filter(c => c.statoID! >= 3);
      
      certificatiFiltrati.forEach(c => {
        const iscrizione = c.iscrizione;
        const classeSezioneAnno = iscrizione!.classeSezioneAnno;
        this.documenti.push({
          docID: c.id!,
          tipoDoc: 'CertificazioneCompetenze',
          descrizione: 'Certificato Competenze',
          classeSezione: classeSezioneAnno!.classeSezione!.classe!.descrizione,
          anno: classeSezioneAnno.anno.annoscolastico
        });
      });
    });
}

  visualizzaFile (docID: number, tipoFile: string) {
    console.log("scarico", tipoFile, docID)
    this.svcFiles.getByDocAndTipo(docID, tipoFile).subscribe({
      next: res => {
        console.log("res", res);
        const byteCharacters = atob(res.fileBase64!);                  // Decodifica la stringa base64 in un array di byte
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {       // Crea un array di valori numerici, un elemento dell'array per ogni carattere
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);          //a sua volta byteNumbers viene trascodificato in byteArray
        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        saveAs(blob, tipoFile);


      },
      error: err=> this._toast.presentToast('Errore di caricamento')
    });
  }

}
