import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { PatientsService } from '../patients.service';



@Component({
  selector: 'app-exam-details',
  templateUrl: './exam-details.component.html',
  styleUrls: ['./exam-details.component.css']
})
export class ExamDetailsComponent implements OnInit {
  @Output() switchScreen = new EventEmitter<boolean>();

  userName: string = "";
  today: Date = new Date();
  patient: any = null;
  exams: any[] = [];
  lesions: Lesion[] = [];
  lesionsHidden: Lesion[] = [];
  hiddenLesionsCollapsed: boolean = true;
  progress: boolean[] = [false, false, false, false, false, false, false];
  progressCurrent: number = 0;
  contextMenuStyle: any = { 'display': 'none' };
  valueToCopy: string = "";
  valueName: string = "";
  valueEditable: boolean = false;
  valueEditing: boolean = false;
  valueEdited: number[] = [];
  valueEditedB: string[] = [];
  valueParent: any = null;
  isContentHiddenMessung: boolean = false;
  isContentHiddenT: boolean = false;
  isContentHidden: boolean = false;
  isContentHiddenGesamtscore: boolean = false;
  selectedMainLesion: number = 1;
  selectedMainLesionChecked: boolean = false; // Variable für den Status der Hauptläsion

  toggleSelectedMainLesion() {
    this.selectedMainLesionChecked = !this.selectedMainLesionChecked;
  }



  constructor(private dataService: PatientsService) { }

  ngOnInit(): void {
    this.updatePatient();
    this.updateExams();
    this.updateLesions();
    //this.updateImages();
    console.log("patient:", this.patient)
    console.log("exams:", this.exams)
    console.log("lesions:", this.lesions)
  }

  updatePatient() {
    let p = this.dataService.getActivePatient();
    this.patient = new Patient(p.ID, p.name, p.surname, p.birthdate);
  }

  exitPage() {
    this.switchScreen.emit(false);
  }

  updateExams() {
    let list = this.dataService.getExams();
    for (let i = 0; i < list.length; i++) {
      let e = list[i];
      if (e.patientID == this.patient.ID) {
        this.exams.push(new Exam(e));
      }
    }
  }

  toggleContentMessung(event: MouseEvent) {
    event.stopPropagation(); // Stoppt die Propagierung des Ereignisses
    this.isContentHiddenMessung = !this.isContentHiddenMessung;
  }

  toggleContentTumor(event: MouseEvent) {
    event.stopPropagation(); // Stoppt die Propagierung des Ereignisses
    this.isContentHiddenT = !this.isContentHiddenT;
  }

  toggleContentNeben(event: MouseEvent) {
    event.stopPropagation(); // Stoppt die Propagierung des Ereignisses
    this.isContentHidden = !this.isContentHidden;
  }

  toggleContentGesamtscore(event: MouseEvent) {
    event.stopPropagation(); // Stoppt die Propagierung des Ereignisses
    this.isContentHiddenGesamtscore = !this.isContentHiddenGesamtscore;
  }

  updateLesions() {
    for (let i = 0; i < this.exams.length; i++) {
      let e = this.exams[i];
      for (let j = 0; j < e.lesions.length; j++) {
        let l = e.lesions[j];
        let index = this.findLesion(l);
        if (index >= 0) {
          this.lesions[index].addInstance(l);
        }
        else {
          this.lesions.push(new Lesion(l, i));
        }
      }
      for (let j = 0; j < this.lesions.length; j++) {
        let l = this.lesions[j];
        if (l.instances.length < i + 1) {
          l.addEmpty();
        }
      }
    }
  }

  updateImages() {
    for (let i = 0; i < this.getActiveExam().sequences.length; i++) {
      let s = this.getActiveExam().sequences[i];
      for (let j = 0; j < s.images.length; j++) {
        this.preloadImage(s.images[j]);
      }
      for (let j = 0; j < s.masks.length; j++) {
        let m = s.masks[j];
        for (let k = 0; k < m.paths.length; k++)
          this.preloadImage(m.paths[k]);
      }
    }
  }

  checkSection(index: number) {
    let p = this.progress;
    p[index] = !p[index];
    for (let i = 0; i < p.length; i++) {
      if (!p[i]) {
        this.progressCurrent = i;
        return;
      }
    }
  }

  formatDate(date: Date | string) {
    let d;
    if (typeof date == 'string') d = new Date(date);
    else d = date;
    return d.toLocaleDateString('en-GB').replace(/\//g, '.');
  }

  findLesion(lesion: any) {
    let id = lesion.id;
    for (let i = 0; i < this.lesions.length; i++) {
      let l = this.lesions[i];
      if (l.id == id) return i;
    }
    return -1;
  }

  public scrollImages(event: WheelEvent | KeyboardEvent) {
    if (event instanceof WheelEvent) {
        if (event.deltaY > 0) {
            this.getActiveExam().nextImage();
        } else {
            this.getActiveExam().previousImage();
        }
    } else if (event instanceof KeyboardEvent) {
        if (event.code === 'ArrowDown') {
            this.getActiveExam().nextImage();
        } else if (event.code === 'ArrowUp') {
            this.getActiveExam().previousImage();
        }
    }


}

  getActiveExam() {
    for (let i = 0; this.exams.length; i++) {
      let e = this.exams[i];
      if (e.ID == this.dataService.activeExamID) {
        return e;
      }
    }
    return {};
  }

  getActiveInstance(lesion: Lesion) {
    for (let i = 0; i < lesion.instances.length; i++) {
      let inst = lesion.instances[i];
      if (inst.examId == this.getActiveExam().ID) {
        return inst;
      }
    }
    return {};
  }

  getBirthdate() {
    return new Date(this.patient.birthdate);
  }

  getAge() {
    const birthDate = this.getBirthdate();
    let age = this.today.getFullYear() - birthDate.getFullYear();
    const m = this.today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && this.today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  calPSADensity(psa: number, volume: number) {
    return psa / volume;
  }

  isActiveExam(exam: any) {
    return exam.ID == this.dataService.activeExamID;
  }

  isActiveLesion(lesion: any) {
    return lesion.examId == this.dataService.activeExamID;
  }

  isCriticalPSAD(psad: number) {
    return psad >= 15;
  }

  boolToString(b: boolean) {
    return b ? "Ja" : "Nein";
  }

  displayDCE(value: boolean) {
    return value ? "+" : "-";
  }

  isNA(value: number) {
    return value <= 0 ? true : false;
  }

  isNAZ(value: number) {
    return value < 0 ? true : false;
  }

  isNAD(value: string) {
    return value === "" ? true : false;
  }

  toPIRADS(value: any) {
    switch (parseInt(value)) {
      case -1:
      case 0: return "N/A";
      case 1: return "1";
      case 2: return "2";
      case 3: return "3";
      case 4: return "4";
      case 5: return "5";
    }
    return "";
  }

  toDCE(value: any) {
    switch (parseInt(value)) {
      case -1: return "N/A";
      case 0: return "-";
      case 1: return "+";
    }
    return "ERR";
  }

  toBool(value: any) {
    switch (parseInt(value)) {
      case -1: return "N/A";
      case 0: return "Nein";
      case 1: return "Ja";
    }
    return "ERR";
  }

  toNumber(value: number, decimals: number) {
    if (value < 0) return "N/A";
    return parseFloat(value.toFixed(decimals)).toString();
  }

  toDate(value: string) {
    if (this.isNAD(value)) return "N/A";
    return this.formatDate(new Date(value));
  }

  getADCRange(instance: LesionInstance) {
    let min = instance.ADCMin;
    let max = instance.ADCMax;
    if (min < 0 || max < 0) return "N/A";
    return this.toNumber(min, 1) + "-" + this.toNumber(max, 2);
  }

  getReference(instance: LesionInstance) {
    let s = instance.seriesNr;
    let i = instance.imageNr;
    if (s <= 0 || i <= 0) return "N/A";
    return "S" + s + ", B" + i;
  }

  getSectorZone(value: any) {
    switch (parseInt(value)) {
      case -1: return "N/A";
      case 0: return "TZa";
      case 1: return "TZp";
      case 2: return "PZpm";
      case 3: return "PZpl";
      case 4: return "PZa";
      case 5: return "CZ";
      case 6: return "AFS";
      case 7: return "SV";
      case 8: return "US";
    }
    return "";
  }

  getSectorSection(value: any) {
    switch (parseInt(value)) {
      case 0: return " basal";
      case 1: return " mittig";
      case 2: return " apikal";
    }
    return "";
  }

  getSectorSide(value: any) {
    switch (parseInt(value)) {
      case 0: return " L";
      case 1: return " R";
    }
    return "";
  }

  sectionDisplayed(zoneValue: any) {
    switch (parseInt(zoneValue)) {
      case -1:
      case 5:
      case 7:
      case 8: return false;
    }
    return true;
  }

  sideDisplayed(zoneValue: any) {
    switch (parseInt(zoneValue)) {
      case -1:
      case 7:
      case 8: return false;
    }
    return true;
  }

  getSector(instance: LesionInstance) {
    let zone = instance.region[0];
    let section = instance.region[1];
    let side = instance.region[2];
    let output = this.getSectorZone(zone);
    if (this.sectionDisplayed(zone)) output += this.getSectorSection(section);
    if (this.sideDisplayed(zone)) output += this.getSectorSide(side);
    return output;
  }

  getDifference(current: number, previous: number, decimal: number, unit: string) {
    if (current <= 0 || previous <= 0) return "";
    let diff = current - previous;
    let output = "";
    if (diff == 0) output = "+0";
    else if (diff > 0) output = "+" + parseFloat(diff.toFixed(decimal)).toString();
    else output = "-" + parseFloat(diff.toFixed(decimal)).toString();
    if (unit) output += " " + unit;
    return output;
  }

  getDifferenceRange(currentMin: number, previousMin: number, currentMax: number, previousMax: number, decimal: number, unit: string) {
    if (currentMin <= 0 || previousMin <= 0 || currentMax <= 0 || previousMax <= 0) return "";
    let diffMin = currentMin - previousMin;
    let diffMax = currentMax - previousMax;
    let output = "";
    (diffMin >= 0) ? output += "+" : output += "-";
    output += parseFloat(diffMin.toFixed(decimal)).toString() + ", ";
    (diffMax >= 0) ? output += "+" : output += "-";
    output += parseFloat(diffMax.toFixed(decimal)).toString();
    if (unit) output += " " + unit;
    return output;
  }

  getDifferenceDate(current: string, previous: string) {
    if (current === "" || previous === "") return "";
    let dateCurrent = new Date(current);
    let datePrevious = new Date(previous);
    let months = (dateCurrent.getFullYear() - datePrevious.getFullYear()) * 12;
    let monthDiff = dateCurrent.getMonth() - datePrevious.getMonth();
    return "+" + (months + monthDiff).toString() + " Monate";
  }

  getPatientInfo() {
    let bd = new Date(this.patient.birthdate);
    let d = bd.getDate() < 10 ? "0" + bd.getDate() : bd.getDate();
    let m = bd.getMonth() < 10 ? "0" + bd.getMonth() : bd.getMonth();
    return this.patient.surname + ", " + this.patient.name + " (" + d + "." + m + "." + bd.getFullYear() + ")";
  }

  hideLesion(index: number) {
    this.lesionsHidden.push(this.lesions[index]);
    this.lesions.splice(index, 1);
  }



  addNewLesion() {
    let lesion = new Lesion(false, 0);
    for (let i = 0; i < this.exams.length; i++) {
      let instance = new LesionInstance(false);
      instance.examId = this.exams[i].ID;
      lesion.instances.push(instance);
    }
    this.lesions.push(lesion);
  }

  getMaskName(type: number) {
    switch (type) {
      case 0: return "Prostata";
      case 1: return "PZ";
      case 2: return "Läsion";
    }
    return "";
  }

  detectClickR(event: MouseEvent, parent: Exam | LesionInstance, valueToCopy: string, valueName: string) {
    //if (event.button != 2) return;
    if (this.valueEditing) return;
    if (parent instanceof Exam && !this.isActiveExam(parent)) return;
    if (parent instanceof LesionInstance && !this.isActiveLesion(parent)) return;
    this.valueParent = parent;
    this.contextMenuStyle = {
      'display': 'block',
      'position': 'absolute',
      'left.px': event.clientX,
      'top.px': event.clientY
    };
    this.valueToCopy = valueToCopy;
    this.valueName = valueName;
  }

  detectDblClick(parent: Exam | LesionInstance, valueName: string) {
    if (this.valueEditing) return;
    if (parent instanceof Exam && !this.isActiveExam(parent)) return;
    if (parent instanceof LesionInstance && !this.isActiveLesion(parent)) return;
    this.valueParent = parent;
    this.valueName = valueName;
    this.editValue();
  }

  closeContextMenu() {
    this.contextMenuStyle = {
      'display': 'none'
    }
  }

  copyValue() {
    navigator.clipboard.writeText(this.valueToCopy).then(() => {
      console.log(`Value "${this.valueToCopy}" saved to clipboard.`);
    })
      .catch((error) => {
        console.error(`Error saving value to clipboard: ${error}`);
      });
    this.closeContextMenu();
  }

  editValue() {
    this.closeAllEdits();
    let p = this.valueParent;
    switch (this.valueName) {
      case "psa-value": this.valueEdited = [p.PSAValue]; p.editPSA = true; break;
      case "psa-date": this.valueEditedB = [p.PSADate.substring(0, 10)]; p.editPSADate = true; break;
      case "prostate-volume": this.valueEdited = [p.ProstateVolume]; p.editProstateVolume = true; break;
      case "lesion-region": this.valueEdited = [p.region[0], p.region[1], p.region[2]]; p.editRegion = true; break;
      case "lesion-ref": this.valueEdited = [p.seriesNr, p.imageNr]; p.editRef = true; break;
      case "lesion-diameter": this.valueEdited = [p.diameter]; p.editDiameter = true; break;
      case "lesion-epe": this.valueEdited = [p.EPE]; p.editEPE = true; break;
      case "lesion-adc": this.valueEdited = [p.ADCMin, p.ADCMax]; p.editADC = true; break;
      case "lesion-t2w": this.valueEdited = [p.T2W]; p.editT2W = true; break;
      case "lesion-dwi": this.valueEdited = [p.DWI]; p.editDWI = true; break;
      case "lesion-dce": this.valueEdited = [p.DCE]; p.editDCE = true; break;
      case "lesion-pirads": this.valueEdited = [p.PIRADS]; p.editPIRADS = true; break;
      case "staging-epe": this.valueEdited = [p.stagingEPE]; p.editStagingEPE = true; break;
      case "staging-nvb": this.valueEdited = [p.stagingNVB]; p.editStagingNVB = true; break;
      case "staging-sv": this.valueEdited = [p.stagingSV]; p.editStagingSV = true; break;
      case "staging-lk": this.valueEdited = [p.stagingLK]; p.editStagingLK = true; break;
      case "staging-bm": this.valueEdited = [p.stagingBM]; p.editStagingBM = true; break;
      case "staging-other": this.valueEdited = [p.stagingOther]; p.editStagingOther = true; break;
      case "other": this.valueEdited = [p.other]; p.editOther = true; break;
      case "env-0": this.valueEdited = [p.environment[0]]; p.editEnvironment[0] = true; break;
      case "env-1": this.valueEdited = [p.environment[1]]; p.editEnvironment[1] = true; break;
      case "env-2": this.valueEdited = [p.environment[2]]; p.editEnvironment[2] = true; break;
      case "env-3": this.valueEdited = [p.environment[3]]; p.editEnvironment[3] = true; break;
      case "env-4": this.valueEdited = [p.environment[4]]; p.editEnvironment[4] = true; break;
      case "env-5": this.valueEdited = [p.environment[5]]; p.editEnvironment[5] = true; break;
      case "env-6": this.valueEdited = [p.environment[6]]; p.editEnvironment[6] = true; break;
      case "env-7": this.valueEdited = [p.environment[7]]; p.editEnvironment[7] = true; break;
      case "qual-0": this.valueEdited = [p.imageQuality[0]]; p.editImageQuality[0] = true; break;
      case "qual-1": this.valueEdited = [p.imageQuality[1]]; p.editImageQuality[1] = true; break;
      case "qual-2": this.valueEdited = [p.imageQuality[2]]; p.editImageQuality[2] = true; break;
      case "qual-3": this.valueEdited = [p.imageQuality[3]]; p.editImageQuality[3] = true; break;
      case "pirads": this.valueEdited = [p.PIRADS]; p.editPIRADS = true; break;
      case "precise": this.valueEdited = [p.PRECISE]; p.editPRECISE = true; break;
      case "tnm": this.valueEdited = [p.TNM[0], p.TNM[1], p.TNM[2]]; p.editTNM = true; break;
    }
    this.closeContextMenu();
  }

  closeAllEdits() {
    this.getActiveExam().cancelEditing();
    for (let i = 0; i < this.lesions.length; i++) {
      let l = this.lesions[i];
      for (let j = 0; j < l.instances.length; j++) {
        l.instances[j].cancelEditing();
      }
    }
  }

  getExamDate(id: number) {
    for (let i = 0; i < this.exams.length; i++) {
      let e = this.exams[i];
      if (e.ID == id) return e.date;
    }
    return null;
  }

  jumpToLesion(lesion: Lesion) {
    for (let i = 0; i < lesion.instances.length; i++) {
      let instance = lesion.instances[i];
      let exam = this.getActiveExam();
      if (instance.examId == exam.ID) {
        let id = instance.id;
        let sequence = exam.getActiveSeries();
        let masks = sequence.masks;
        for (let j = 0; j < masks.length; j++) {
          let m = masks[j];
          if (m.type == 2) {
            if (m.lesionID == id) {
              m.active = true;
              sequence.currentIndex = m.getFirstMaskedIndex();
            }
            else {
              m.active = false;
            }
          }
        }
        exam.openSequence(0);
        return;
      }
    }
  }

  mapLesion() {
    this.getActiveExam().openGraphic();
  }

  applyCurrentImageRef() {
    let s = this.getActiveExam().getActiveSeries();
    this.valueEdited = [s.seriesNr, s.currentIndex + 1];
  }

  preloadImage(url: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  }

  protected readonly TargetLesion = TargetLesion;
}

class Patient {
  ID: number;
  name: string;
  surname: string;
  birthdate: string;

  constructor(ID: number, name: string, surname: string, birthdate: string) {
    this.ID = ID;
    this.name = name;
    this.surname = surname;
    this.birthdate = birthdate;
  }
}

class Exam {
  ID: number;
  patientID: number;
  date: string;
  sequences: Sequence[] = [];
  selectedSequence: number = 0;
  masks: any[];
  markers: Marker[] = [];
  PSAValue: number;
  PSADate: string;
  ProstateVolume: number;
  lesions: any[];
  imageQuality: number[];
  environment: number[];
  other: string;
  stagingEPE: number;
  stagingSV: number;
  stagingLK: number;
  stagingBM: number;
  stagingNVB: number;
  stagingOther: string;
  PIRADS: number;
  PRECISE: number;
  TNM: number[];
  collapsed: boolean = true;
  graphicActive: boolean = false;
  graphicOptions: boolean[] = [true, true];
  editPSA: boolean = false;
  editPSADate: boolean = false;
  editProstateVolume: boolean = false;
  editPIRADS: boolean = false;
  editPRECISE: boolean = false;
  editTNM: boolean = false;
  editImageQuality: boolean[] = [false, false, false, false];
  editEnvironment: boolean[] = [false, false, false, false, false, false, false, false];
  editStagingEPE: boolean = false;
  editStagingSV: boolean = false;
  editStagingLK: boolean = false;
  editStagingBM: boolean = false;
  editStagingNVB: boolean = false;
  editStagingOther: boolean = false;
  editOther: boolean = false;

  constructor(exam: any) {
    this.ID = exam.ID;
    this.patientID = exam.patientID;
    this.date = exam.date;
    this.masks = exam.masks;
    this.PSAValue = exam.PSAValue;
    this.PSADate = exam.PSADate;
    this.ProstateVolume = exam.ProstateVolume;
    this.lesions = exam.lesions;
    this.imageQuality = exam.imageQuality;
    this.environment = exam.environment;
    this.other = exam.other;
    this.stagingEPE = exam.stagingEPE;
    this.stagingSV = exam.stagingSV;
    this.stagingLK = exam.stagingLK;
    this.stagingBM = exam.stagingBM;
    this.stagingNVB = exam.stagingNVB;
    this.stagingOther = exam.stagingNVB;
    this.PIRADS = exam.PIRADS;
    this.PRECISE = exam.PRECISE;
    this.TNM = exam.TNM;

    for (let i = 0; i < exam.sequences.length; i++) {
      let s = exam.sequences[i];
      this.sequences.push(new Sequence(s.name, s.type, s.series, s.images, s.masks));
    }
    this.sequences[0].active = true;

    for (let i = 0; i < exam.markers.length; i++) {
      let m = exam.markers[i];
      this.markers.push(new Marker(m.lesionID, m.path));
    }
  }

  switchCollapse() {
    this.collapsed = !this.collapsed;
  }

  getPSADensitiy() {
    if (this.PSAValue <= 0 || this.ProstateVolume <= 0) return -1;
    return this.PSAValue / this.ProstateVolume;
  }

  getActiveSeries() {
    for (let i = 0; i < this.sequences.length; i++) {
      let s = this.sequences[i];
      if (s.active) return s;
    }
    return this.sequences[0];
  }

  getActiveImagePath() {
    let s = this.getActiveSeries();
    return s.paths[s.currentIndex];
  }

  nextImage() {
    let s = this.getActiveSeries();
    if (s.currentIndex < s.paths.length - 1) {
      s.currentIndex++;
    }
  }

  previousImage() {
    let s = this.getActiveSeries();
    if (s.currentIndex > 0) {
      s.currentIndex--;
    }
  }

  closeAllSequences() {
    for (let i = 0; i < this.sequences.length; i++) {
      let s = this.sequences[i];
      s.active = false;
    }
  }

  openSequence(index: number) {
    this.graphicActive = false;
    this.closeAllSequences();
    this.sequences[index].active = true;
  }

  openGraphic() {
    this.closeAllSequences();
    this.graphicActive = true;
  }

  toggleGraphicOption(index: number) {
    this.graphicOptions[index] = !this.graphicOptions[index];
  }

  jumpToProstateSeg() {
    this.openSequence(0);
    this.sequences[0].jumpToProstateSeg();
  }

  stagingActive() {
    if (this.stagingEPE >= 0 || this.stagingNVB >= 0 || this.stagingSV >= 0 || this.stagingLK >= 0 || this.stagingBM >= 0 || this.stagingOther.trim().length > 0) return true;
    else return false;
  }

  environmentActive() {
    for (let i = 0; i < this.environment.length; i++) {
      if (this.environment[i] >= 0) return true;
    }
    return false;
  }

  getTNM() {
    let t: any = this.TNM[0];
    let n: any = this.TNM[1];
    let m: any = this.TNM[2];
    if (t < 0 || n < 0 || m < 0) return "N/A";
    let output = "";
    switch (parseInt(t)) {
      case 0: output += "TX"; break;
      case 1: output += "T0"; break;
      case 2: output += "T1"; break;
      case 3: output += "T1a"; break;
      case 4: output += "T1b"; break;
      case 5: output += "T1c"; break;
      case 6: output += "T2"; break;
      case 7: output += "T2a"; break;
      case 8: output += "T2b"; break;
      case 9: output += "T2c"; break;
      case 10: output += "T3"; break;
      case 11: output += "T3a"; break;
      case 12: output += "T3b"; break;
      case 13: output += "T4"; break;
    }
    switch (parseInt(n)) {
      case 0: output += ", NX"; break;
      case 1: output += ", N0"; break;
      case 2: output += ", N1"; break;
    }
    switch (parseInt(m)) {
      case 0: output += ", MX"; break;
      case 1: output += ", M0"; break;
      case 2: output += ", M1"; break;
      case 3: output += ", M1a"; break;
      case 4: output += ", M1b"; break;
      case 5: output += ", M1c"; break;
    }
    return output;
  }

  cancelEditing() {
    this.editPSA = false;
    this.editPSADate = false;
    this.editProstateVolume = false;
    this.editImageQuality = [false, false, false, false];
    this.editEnvironment = [false, false, false, false, false, false, false, false];
    this.editOther = false;
    this.editStagingEPE = false;
    this.editStagingNVB = false;
    this.editStagingSV = false;
    this.editStagingLK = false;
    this.editStagingBM = false;
    this.editStagingOther = false;
    this.editOther = false;
    this.editPIRADS = false;
    this.editPRECISE = false;
    this.editTNM = false;
  }

  confirmEdit(newValue: any[]) {
    if (this.editPSA) this.PSAValue = newValue[0];
    else if (this.editPSADate) newValue[0] != "" ? this.PSADate = new Date(newValue[0]).toISOString() : this.PSADate = "";
    else if (this.editProstateVolume) this.ProstateVolume = newValue[0];
    else if (this.editStagingEPE) this.stagingEPE = newValue[0];
    else if (this.editStagingNVB) this.stagingNVB = newValue[0];
    else if (this.editStagingSV) this.stagingSV = newValue[0];
    else if (this.editStagingLK) this.stagingLK = newValue[0];
    else if (this.editStagingBM) this.stagingBM = newValue[0];
    else if (this.editStagingOther) this.stagingOther = newValue[0];
    else if (this.editOther) this.other = newValue[0];
    else if (this.editPIRADS) this.PIRADS = newValue[0];
    else if (this.editPRECISE) this.PRECISE = newValue[0];
    else if (this.editTNM) this.TNM = [newValue[0], newValue[1], newValue[2]];
    for (let i = 0; i < this.editEnvironment.length; i++) {
      if (this.editEnvironment[i]) {
        this.environment[i] = newValue[0];
        break;
      }
    }
    for (let i = 0; i < this.editImageQuality.length; i++) {
      if (this.editImageQuality[i]) {
        this.imageQuality[i] = newValue[0];
        break;
      }
    }
    this.cancelEditing();
  }
}

class Lesion {
  id: number = -1;
  hidden: boolean = false;
  checked: boolean = false;
  instances: any[] = [];

  constructor(lesion: any, emptySpaces: number) {
    if (lesion) {
      this.id = lesion.id;
      if (emptySpaces > 0) this.hidden = true;
      for (let i = 0; i < emptySpaces; i++) this.addEmpty();
      this.instances.push(new LesionInstance(lesion));
    }
  }

  public addInstance(lesion: any) {
    this.instances.push(new LesionInstance(lesion));
  }

  public addEmpty() {
    this.instances.push(new LesionInstance(false));
  }
}

class TargetLesion{
  checked: boolean = false;
}

class LesionInstance {
  examId: number = -1;
  id: number = -1;
  index: number = -1;
  region: number[] = [-1, -1, -1];
  seriesNr: number = -1;
  imageNr: number = -1;
  diameter: number = -1;
  EPE: number = -1;
  ADCMin: number = -1;
  ADCMax: number = -1;
  T2W: number = -1;
  DWI: number = -1;
  DCE: number = -1;
  PIRADS: number = -1;
  hidden: boolean = false;
  collapsed: boolean = true;
  empty: boolean = false;
  editRegion: boolean = false;
  editRef: boolean = false;
  editDiameter: boolean = false;
  editEPE: boolean = false;
  editADC: boolean = false;
  editT2W: boolean = false;
  editDWI: boolean = false;
  editDCE: boolean = false;
  editPIRADS: boolean = false;

  constructor(lesionInstance: any) {
    if (lesionInstance) {
      this.examId = lesionInstance.examId;
      this.id = lesionInstance.id;
      this.index = lesionInstance.index;
      this.region = lesionInstance.region;
      this.seriesNr = lesionInstance.seriesNr;
      this.imageNr = lesionInstance.imageNr;
      this.diameter = lesionInstance.diameter;
      this.EPE = lesionInstance.EPE;
      this.ADCMin = lesionInstance.ADCMin;
      this.ADCMax = lesionInstance.ADCMax;
      this.T2W = lesionInstance.T2W;
      this.DWI = lesionInstance.DWI;
      this.DCE = lesionInstance.DCE;
      this.PIRADS = lesionInstance.PIRADS;
      this.hidden = lesionInstance.hidden;
    }
    else {
      this.empty = true;
    }
  }

  switchCollapse() {
    this.collapsed = !this.collapsed;
  }

  calculateScore(overwritten: boolean) {
    if (overwritten && this.PIRADS != 6) return this.PIRADS;
    let zone: any = this.region[0];
    switch (parseInt(zone)) {
      case (0):
      case (1): {
        // TZ
        let output = this.T2W;
        if (output < 0) break;
        if (output == 3 && this.DWI == 5) output++;
        if (output == 4 && (this.diameter >= 15 || this.EPE == 1)) output++;
        //console.log("TZ output", output);
        return output;
      }
      case (2):
      case (3):
      case (4): {
        // PZ
        let output = this.DWI;
        if (output < 0) break;
        if (output == 3 && this.DCE == 1) output++;
        if (output == 4 && (this.diameter >= 15 || this.EPE == 1)) output++;
        //console.log("PZ output", output);
        return output;
      }
    }
    return -1;
  }

  cancelEditing() {
    this.editRegion = false;
    this.editRef = false;
    this.editDiameter = false;
    this.editEPE = false;
    this.editADC = false;
    this.editT2W = false;
    this.editDWI = false;
    this.editDCE = false;
    this.editPIRADS = false;
  }

  confirmEdit(newValue: any[]) {
    if (this.editRegion) { this.region = [newValue[0], newValue[1], newValue[2]] };
    if (this.editRef) { this.seriesNr = newValue[0]; this.imageNr = newValue[1] };
    if (this.editDiameter) this.diameter = newValue[0];
    if (this.editEPE) this.EPE = newValue[0];
    if (this.editADC) { this.ADCMin = newValue[0]; this.ADCMax = newValue[1] };
    if (this.editT2W) this.T2W = newValue[0];
    if (this.editDWI) this.DWI = newValue[0];
    if (this.editDCE) this.DCE = newValue[0];
    if (this.editPIRADS) this.PIRADS = newValue[0];
    this.cancelEditing();
  }
}

class Sequence {
  name: string;
  type: number;
  seriesNr: number;
  paths: string[] = [];
  masks: Mask[] = [];
  currentIndex: number = 0;
  active: boolean = false;

  constructor(name: string, type: number, nr: number, paths: string[], masks: any[]) {
    this.name = name;
    this.type = type;
    this.seriesNr = nr;
    this.paths = paths;

    for (let i = 0; i < masks.length; i++) {
      let m = masks[i];
      this.masks.push(new Mask(m.name, m.type, m.lesionID, m.paths));
    }
  }

  getSliceState(index: number) {
    let state = 0;
    for (let i = 0; i < this.masks.length; i++) {
      let m = this.masks[i];
      if (m.active && m.isMasked(index)) {
        switch (m.type) {
          case 0:
          case 1:
            state = 1;
            break;
          case 2:
            state = 2;
            break;
        }
        if (state == 2) break;
      }
    }
    return state;
  }

  jumpToProstateSeg() {
    for (let i = 0; i < this.masks.length; i++) {
      let m = this.masks[i];
      if (m.type == 0) {
        m.active = true;
        this.currentIndex = m.getFirstMaskedIndex();
      }
      else {
        //m.active = false;
      }
    }
  }

  getType() {
    switch (this.type) {
      case 0: return "T2W-ax";
      case 1: return "T2W-sa";
      case 2: return "DWI";
      case 3: return "ADC";
      case 4: return "DCE";
    }
    return "";
  }
}

class Mask {
  name: string;
  type: number;
  lesionID: number;
  paths: string[] = [];
  active: boolean = false;

  constructor(name: string, type: number, lesionID: number, paths: string[]) {
    this.name = name;
    this.type = type;
    this.lesionID = lesionID;
    this.paths = paths;
  }

  isMasked(index: number) {
    return this.paths[index] === "" ? false : true;
  }

  getFirstMaskedIndex() {
    for (let i = 0; i < this.paths.length; i++) {
      if (this.isMasked(i)) return i;
    }
    return -1;
  }
}

class Marker {
  lesionID: string;
  path: string;

  constructor(lesionID: string, path: string) {
    this.lesionID = lesionID;
    this.path = path;
  }
}
