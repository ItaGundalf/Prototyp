import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { PatientsService } from '../patients.service';

@Component({
  selector: 'app-exam-list',
  templateUrl: './exam-list.component.html',
  styleUrls: ['./exam-list.component.css']
})
export class ExamListComponent implements OnInit {
  @Output() switchScreen = new EventEmitter<boolean>();

  patients: any = [];
  exams: any = [];
  searchInput: string = "";

  constructor(private dataService: PatientsService) { }

  ngOnInit(): void {
    this.updateData();
    console.log("data", this.patients, this.exams);
  }

  openExamDetails(examId: number) {
    this.dataService.activeExamID = examId;
    this.switchScreen.emit(true);
  }

  updateData() {
    this.patients = this.dataService.getPatients();
    this.exams = this.dataService.getExams();
    this.exams.sort((a: any, b: any) => {
      let dateA = new Date(a.date);
      let dateB = new Date(b.date);
      if (dateA > dateB) return -1;
      else return 1;
    })
  }

  getPatientFromExam(exam: any) {
    return this.patients[exam.patientID];
  }
}