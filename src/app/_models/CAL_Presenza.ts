import { ALU_Alunno } from "./ALU_Alunno";
import { CAL_Lezione } from "./CAL_Lezione";

export interface CAL_Presenza {
  id:                                           number;
  LezioneID:                                    number;
  lezione?:                                     CAL_Lezione;
  AlunnoID:                                     number;
  ckPresente:                                   boolean;
  ckDAD:                                        boolean;
  alunno?:                                      ALU_Alunno;

}