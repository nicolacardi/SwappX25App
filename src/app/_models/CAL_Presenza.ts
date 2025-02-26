import { CAL_Lezione } from "./CAL_Lezione";

export interface CAL_Presenza {
  id:                                           number;
  LezioneID:                                    number;
  lezione?:                                     CAL_Lezione;
  AlunnoID:                                     number;
  ckPresente:                                   boolean;
  ckDAD:                                        boolean;

}