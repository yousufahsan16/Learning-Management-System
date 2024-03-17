import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NavigateDataService } from '../../../../src/app/shared/services/navigate-data.service';
import { DataService } from '../../../app/shared/services/data.service';
@Component({
  selector: 'app-manage-grades',
  templateUrl: './manage-grades.component.html',
  styleUrls: ['./manage-grades.component.css']
})
export class ManageGradesComponent implements OnInit, OnDestroy {
  user: any;
  topic: any;
  results: any;
  currentShowingResult: any;
  attemptNo = 1;
  displayStyle = "none";
  questionRating: any;
  strongPoints: any;
  weakPoints: any;
  ratingArray = [0, 1, 2, 3, 4, 5];
  question: any;
  answer: any;
  blurBackground: any;
  currentQuestion: any;
  response: any;
  editLevelDisplay = "none";
  levelArray = ['Entry', 'Intermediate', 'Expert'];
  userLevel: any;
  ROLE: any;
  adminRole: any;
  getData: any;
  TopicStatus: any;
  // @Input() getData: any;
  dataToCreateTask: any;
  showResult = false;

  constructor(private dataService: DataService, private navigateDataService: NavigateDataService, private router: Router) { }

  ngOnInit(): void {
    this.adminRole = this.dataService.ADMIN_ROLES;
    const savedTopic = localStorage.getItem('currentTopic');

    if (savedTopic) {
      this.getData = JSON.parse(savedTopic);
    }
    else {
      this.navigateDataService.currentTopic.subscribe((topic: any) => {
        if (topic) {
          console.log(topic);
          this.getData = topic;
          localStorage.setItem('currentTopic', JSON.stringify(topic));
        }
      });
    }

    if (this.getData) {
      this.TopicStatus = this.getData.status;
      this.getResults(this.getData.user, this.getData.topic);
    }
    this.ROLE = localStorage.getItem('currentUser');
  }

  getResults(resource: string, topic: string) {
    this.user = resource;
    this.topic = topic;
    const queryParameters = { ['User']: resource, ['Topic']: topic };

    this.dataService.processGetRequest('getResults', queryParameters).subscribe((data: any) => {
      try {
        this.response = data[resource][topic]
        this.results = this.response.Results;
        this.currentShowingResult = this.results[0];
        if (this.currentShowingResult.isReviewed) {
          this.showResult = true;
        }
        console.dir(this.results);
        // this.ngOnInit();
      } catch {
        console.log('Error: Unable to get Data');
      }
    });
  }

  getAttemptWiseResult(result: any) {
    this.showResult = false;
    this.currentShowingResult = result;
    this.attemptNo = result.AttemptNo;

    if (result.isReviewed) {
      this.showResult = true;
    }
  }

  closePopup() {
    this.displayStyle = "none";
    this.blurBackground = false;
  }

  setEditFields(result: any) {
    this.ratingArray = [0, 1, 2, 3, 4, 5];
    this.displayStyle = "block";
    this.blurBackground = true;
    this.currentQuestion = result;
    this.question = result.Question;
    this.answer = result.Answer;
    this.questionRating = result.Rating;
    this.strongPoints = result.PositivePoints
    this.weakPoints = result.MissingPoints;
    if (result.Level === "Entry") {
      this.ratingArray = [0, 1];
    }
  }

  // openEditResourcePopUp() {
  //   this.blurBackground = true;
  //   this.editLevelDisplay = "block";
  // }

  // closeEditResourcePopUp() {
  //   this.blurBackground = false;
  //   this.editLevelDisplay = "none";
  // }

  editGrades() {
    const body = {
      User: this.user,
      Topic: this.topic,
      AttemptNo: this.attemptNo,
      RatingToUpdate: this.currentQuestion,
      UpdatedRatings: {
        Rating: this.questionRating,
        PositivePoints: this.strongPoints,
        MissingPoints: this.weakPoints
      }
    }

    this.dataService.processPostRequest('editResults', body).subscribe((response: any) => {
      console.log(response);
      this.closePopup();
      this.ngOnInit();
    }, error => {
      console.error(error);
    });
  }


  finalizeResult() {
    const body = {
      User: this.user,
      Topic: this.topic,
      Status: 'ResultReviewed',
      AttemptNo: this.attemptNo,
    }
    console.log(body);

    this.dataService.processPostRequest('finalizeResult', body).subscribe((response: any) => {
      console.log(response);
      // this.closeEditResourcePopUp();
      this.router.navigate(['/tasks-created']);
    }, error => {
      console.error(error);
    });
  }

  navigateToCreateTask() {
    const queryParameters = { 
      ['Topic']: this.topic,
      ['resource']: this.user,
      ['role']: this.getData.role
    }
    this.dataToCreateTask = queryParameters;
    this.navigateDataService.changeTopic(this.dataToCreateTask);
    this.router.navigate(['create-tasks']);
  }

  ngOnDestroy(): void {
    localStorage.removeItem('currentTopic');
  }

}
