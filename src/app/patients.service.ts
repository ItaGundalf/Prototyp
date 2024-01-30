import patients from 'src/assets/data/patients.json';
import exams from 'src/assets/data/exams.json';

export class PatientsService {

    patients = JSON.parse(JSON.stringify(patients));
    exams = JSON.parse(JSON.stringify(exams));;
    activeExamID = 0;

    constructor() {
        console.log("service:", this.patients, this.exams);
    }

    getPatients() {
        return this.patients;
    }

    getExams() {
        return this.exams;
    }

    getActiveExam() {
        for (let i = 0; i < this.exams.length; i++) {
            let e = this.exams[i];
            if (e.ID == this.activeExamID) {
                return e;
            }
        }
        return {};
    }

    getActivePatient() {
        for (let i = 0; i < this.patients.length; i++) {
            let p = this.patients[i];
            if (p.ID == this.getActiveExam().patientID) {
                return p;
            }
        }
        return {};
    }

    getActivePatientExams() {
        let exams = [];
        let p = this.getActivePatient();
        for (let i = 0; i < p.exams.length; i++) {
            exams.push(this.exams[p.exams[i]]);
        }
        return exams;
    }
}

export interface lesion {
    index: number;
    region: string;
    reference: string;
    diameter: number;
    EPE: boolean;
    ADCMin: number;
    ADCMax: number;
    T2W: number;
    DWI: number;
    DCE: boolean;
    PIRADS: number;
    hidden: boolean;
}

export interface sequence {
    name: string;
    series: number;
    images: string[];
}

export interface mask {
    name: string;
}

export interface exam {
    date: string;
    sequences: sequence[];
    masks: mask[];
    PSAValue: number;
    PSADate: string;
    ProstateVolume: number;
    lesions: lesion[];
}

export interface patient {
    firstName: string;
    surName: string;
    birthday: string;
    exams: exam[];
}