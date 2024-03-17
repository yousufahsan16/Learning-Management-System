import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigateDataService } from '../../../../src/app/shared/services/navigate-data.service';
import { DataService } from '../../../app/shared/services/data.service';

@Component({
  selector: 'app-attempt-quiz',
  templateUrl: './attempt-quiz.component.html',
  styleUrls: ['./attempt-quiz.component.css']
})
export class AttemptQuizComponent implements OnInit {
  taskDeadLine = '';
  taskQuestions: any;
  question: any;
  questionNo = 1;
  entryLevelArray = new Array();
  intermediateLevelArray = new Array();
  expertLevelArray = new Array();
  sortedArray = new Array();
  questionsArray = new Array();
  count = 0;
  detailedAnswer: any;
  selectedAnswer: any;
  sortedArrayQuestionObject: any;
  topic: any;
  selectedResource: any;
  topicName: any;
  userRole: any;
  shortAnswer = false;
  writeAnswer = false;
  chooseAnswer = false;
  ROLE: any;
  getData: any;
  // @Input() getData: any;
  quizSubmitted = false;
  timeLeft = '01:00:00';
  colorYellow = false;
  colorRed = false;

  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router, private navigateDataService: NavigateDataService,) {
    let duration = 60 * 60; // 1 hour in seconds
    let timer = () => {
      duration--;
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration - hours * 3600) / 60);
      const seconds = duration - hours * 3600 - minutes * 60;
      this.timeLeft = (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);

      if (this.timeLeft === '00:30:00') {
        this.colorYellow = true;
        this.colorRed = false;
      }

      if (this.timeLeft === '00:10:00') {
        this.colorYellow = false;
        this.colorRed = true;
      }

      if (duration > 0) {
        setTimeout(timer, 1000);
      }
    };
    setTimeout(timer, 1000);

  }

  ngOnInit(): void {
    setTimeout(() => { this.submitNotCompletedQuiz() }, 3600000);

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
    this.ROLE = localStorage.getItem('currentUser');
    console.log(JSON.stringify(this.topic));
    this.selectedResource = this.topic.resource;
    this.topicName = this.topic.topicName;
    this.userRole = this.topic.User;
    console.log("Got IT " + (this.selectedResource));
    console.log("Got IT " + (this.userRole));

    const queryParameters = { ['User']: this.selectedResource, ['Topic']: this.topicName, ['Role']: this.userRole };

    this.dataService.processGetRequest('getTask', queryParameters).subscribe((data: any) => {
      try {
        this.taskDeadLine = data['DeadLine'];
        this.taskQuestions = data['Questions'];
        this.taskQuestions.forEach((q: any) => {
          if (q.Level === 'Entry') {
            this.entryLevelArray.push(q);
          }
          if (q.Level === 'Intermediate') {
            this.intermediateLevelArray.push(q);
          }
          if (q.Level === 'Expert') {
            this.expertLevelArray.push(q);
          }
          this.sortedArray = [...this.entryLevelArray, ...this.intermediateLevelArray, ...this.expertLevelArray];
        });

        console.log(this.sortedArray);
        this.question = this.sortedArray[this.count].Question;
      } catch {
        console.log('Error: Unable to get Data');
      }
    });
  }


  submitNotCompletedQuiz() {
    alert('Time Up');
    console.log('go');
    this.submitQuiz();
  }

  getnextQuestion() {
    this.resetErrorStatus();
    this.checkErrorStatus();
    console.log(this.chooseAnswer);
    console.log(this.writeAnswer);
    console.log(this.shortAnswer);

    if (!this.chooseAnswer && !this.writeAnswer && !this.shortAnswer) {
      this.questionsArray.push({
        Question: this.question,
        Answer: this.selectedAnswer || this.detailedAnswer,
        Level: this.sortedArray[this.count]?.Level
      });

      this.count++;
      this.questionNo++;
      this.question = this.sortedArray[this.count]?.Question;    
      console.log(this.count);
      console.log(this.sortedArray);
      console.log(this.questionsArray);

      this.selectedAnswer = '';
      this.detailedAnswer = '';
    }
  }

  submitQuiz() {
    this.questionsArray.push({
      Question: this.question,
      Answer: this.selectedAnswer || this.detailedAnswer,
      Level: this.sortedArray[this.count]?.Level
    });

    console.log(this.questionsArray);
    this.quizSubmitted = true;
    const body = { ['Role']: this.ROLE, ['User']: this.selectedResource, ['Topic']: this.topicName, ['Questions']: this.questionsArray };

    this.dataService.processPostRequest('getGrading', body).subscribe((data: any) => {
      console.log(data);
    });

    const queryParameters = { ['ResourceName']: this.selectedResource, ['Topic']: this.topicName, ['noStatusChange']: true };

    this.dataService.processPostRequest('deleteUserSpecificTasks', queryParameters).subscribe((data: any) => {
      console.log(data);
      this.router.navigate(['/tasks-created']);
    });
  }

  checkErrorStatus() {
    if (!this.selectedAnswer && this.questionNo <= 5) {
      this.chooseAnswer = true;
    }
    if ((!this.detailedAnswer || !this.detailedAnswer.trim()) && this.questionNo > 5) {
      this.writeAnswer = true;
    }
    if (String(this.detailedAnswer).length > 350 && this.questionNo > 5) {
      this.shortAnswer = true;
    }
  }

  resetErrorStatus() {
    this.chooseAnswer = false;
    this.writeAnswer = false;
    this.shortAnswer = false;
  }

}
