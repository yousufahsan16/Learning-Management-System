import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { NavigateDataService } from '../../../../src/app/shared/services/navigate-data.service';
import { DataService } from '../../../app/shared/services/data.service';

@Component({
  selector: 'app-create-tasks',
  templateUrl: './create-tasks.component.html',
  styleUrls: ['./create-tasks.component.css']
})
export class CreateTasksComponent implements OnInit, OnDestroy {
  // topic: any;
  topicName: any;
  expertLevelCounter = 0;
  intermediateLevelCounter = 0;
  entryLevelCounter = 0;
  topicUserRole: any;
  topicWiseQuestions: any;
  selectedResource: any;
  questionArray = new Array();
  multipleQuestionsArray = new Array();
  limitOver = false;
  displayStyle = 'none';
  limitErrorPopUpDisplayStyle = "none";
  limitError = false;

  getData: any;
  // @Input() getData: any;
  topic: any;
  date: any;
  dateRequired: any;
  minDate: any;

  constructor(private route: ActivatedRoute, private dataService: DataService, private router: Router, private navigateDataService: NavigateDataService,) { }

  ngOnInit(): void {
    this.minDate = new Date().toISOString().split('T')[0];
    console.log(this.minDate)
    const savedTopic = localStorage.getItem('currentTopic');

    if (savedTopic) {
      this.getData = JSON.parse(savedTopic);
    }
    else {
      this.navigateDataService.currentTopic.subscribe((topic: any) => {
        if (topic) {
          this.getData = topic;
          localStorage.setItem('currentTopic', JSON.stringify(topic));
        }
      });
    }

    this.topic = this.getData;
    console.log(JSON.stringify(this.topic));
    this.selectedResource = this.topic.resource;
    this.topicName = this.topic.Topic;
    this.topicUserRole = this.topic.role;
    console.log("Got IT " + (this.topic.Topic));
    this.getQuestions(this.topic);
  }

  resetValues() {
    this.limitError = false;
    this.limitOver = false;
  }

  // openPopup(type: any) {
  //   if (type === "limitOver") {
  //     this.displayStyle = "block";
  //   }
  //   if (type === "limitError") {
  //     this.limitErrorPopUpDisplayStyle = "block";
  //   }
  // }

  // closePopup(type: any) {
  //   if (type === "limitOver") {
  //     this.displayStyle = "none";
  //   }
  //   if (type === "limitError") {
  //     this.limitErrorPopUpDisplayStyle = "none";
  //   }
  //   this.resetValues();
  // }

  getQuestions(topic: any) {
    this.topicName = topic.Topic;
    // this.topicDescription = topic.Description;
    // this.topicUserRole = 'DEV';
    console.log(`Before ${this.topicUserRole} ${this.topicName}`);
    const queryParameters = { ['Role']: this.topicUserRole, ['Topic']: this.topicName };


    this.dataService.processGetRequest('getQuestions', queryParameters).subscribe((data: any) => {
      try {
        this.topicWiseQuestions = data['response'];
        console.log(this.topicWiseQuestions);
      } catch {
        console.log('Error: Unable to get Data');
      }
    });
  }

  addQuestionInTask(question: any, checkboxRef: any) {
    const isChecked = checkboxRef.checked;;

    this.checkLimit(question, isChecked);

    if (this.limitOver === false) {
      this.questionArray.push(question);

      const index = this.topicWiseQuestions.findIndex((q: any) => q === question);
      this.topicWiseQuestions.splice(index, 1);
    }
    this.resetValues();
  }

  AddTask() {
    console.log(this.date);
    if (!this.date) {
      this.dateRequired = true;
      alert("You have to give a deadline.");
    }

    if (this.questionArray.length === 15) {
      if (!this.dateRequired) {
        const body = { ['User']: this.selectedResource, ['Topic']: this.topicName, ['Questions']: this.questionArray, ['DeadLine']: moment(this.date).format('MM-DD-YYYY') };

        this.dataService.processPostRequest('createTaskIndividual', body).subscribe((data: any) => {
          console.log(`Added Task ${this.topicWiseQuestions}`);
          this.questionArray = [];
          this.router.navigate(['/assigned-tasks']);

        });
        console.log("Done");
      }
    } else {
      this.limitError = true;
      // this.openPopup('limitError');
      alert("You have to add 15 Questions.");
    }
    this.resetValues();
  }

  manageQuestionsToAdd(event: any, index: any) {
    if (event.target.checked) {
      this.checkLimit(this.topicWiseQuestions[index]);

      if (this.limitOver === false) {
        this.multipleQuestionsArray.push(this.topicWiseQuestions[index]);
        console.log(`multipleQuestionsArray ${this.multipleQuestionsArray}`);
      }
      this.resetValues();

    } else {
      if (this.topicWiseQuestions[index].Level === "Entry") {
        this.entryLevelCounter--;
      } else if (this.topicWiseQuestions[index].Level === "Intermediate") {
        this.intermediateLevelCounter--;
      }
      else {
        this.expertLevelCounter--;
      }
      const idx = this.multipleQuestionsArray.indexOf(index);
      this.multipleQuestionsArray.splice(idx, 1);
    }
  }

  checkLimit(question: any, isCheckBoxChecked?: boolean) {
    if (!isCheckBoxChecked) {
      if (question.Level === 'Entry') {
        this.entryLevelCounter++;
      }
      if (question.Level === 'Intermediate') {
        this.intermediateLevelCounter++;
      }
      if (question.Level === 'Expert') {
        this.expertLevelCounter++;
      }

      if (this.entryLevelCounter >= 6 && question.Level === 'Entry') {
        this.limitOver = true;
        this.entryLevelCounter--;
        console.log(this.limitOver);
        // this.openPopup('limitOver');
        alert("You can add only five Questions of Each Level.");
        // this.resetValues();
      }


      if (this.intermediateLevelCounter >= 6 && question.Level === 'Intermediate') {
        this.limitOver = true;
        this.intermediateLevelCounter--;
        // this.openPopup('limitOver');
        alert("You can add only five Questions of Each Level.");
        // this.resetValues();
      }

      if (this.expertLevelCounter >= 6 && question.Level === 'Expert') {
        this.limitOver = true;
        this.expertLevelCounter--;
        // this.openPopup('limitOver');
        alert("You can add only five Questions of Each Level.");
        // this.resetValues();
      }
    }
  }

  addMultipleQuestions() {
    this.multipleQuestionsArray?.forEach(question => {
      const addedindex = this.topicWiseQuestions.findIndex((q: any) => q === question);
      this.topicWiseQuestions.splice(addedindex, 1);
    });

    const concatenatedArray = this.questionArray.concat(this.multipleQuestionsArray);
    this.questionArray = Array.from(new Set(concatenatedArray));
    console.dir(this.questionArray);
    this.multipleQuestionsArray = new Array();
  }

  removeQuestions(indexToRemove: number) {
    if (this.questionArray[indexToRemove].Level === "Entry") {
      this.entryLevelCounter--;
    } else if (this.questionArray[indexToRemove].Level === "Intermediate") {
      this.intermediateLevelCounter--;
    }
    else {
      this.expertLevelCounter--;
    }
    console.log(`entry ${this.entryLevelCounter} inter ${this.intermediateLevelCounter} expert ${this.expertLevelCounter}`);

    this.topicWiseQuestions.push(this.questionArray[indexToRemove])
    this.questionArray.splice(indexToRemove, 1);
  }

  ngOnDestroy(): void {
    localStorage.removeItem('currentTopic');
  }
}
