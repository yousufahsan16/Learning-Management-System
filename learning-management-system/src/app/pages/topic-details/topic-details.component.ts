import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NavigateDataService } from '../../shared/services/navigate-data.service';
import { DataService } from '../../../app/shared/services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topic-details',
  templateUrl: './topic-details.component.html',
  styleUrls: ['./topic-details.component.css']
})
export class TopicDetailsComponent implements OnInit, OnDestroy {
  topic: any;
  topicWiseQuestions: any;
  displayStyle = "none";
  topicName: any;
  topicDescription: any;
  topicUserRole: any;

  showAnswer = true;
  questionToAdd: any;
  selectedAnswer: any;
  showUpdateButton: any;

  questionToUpdate: any;
  questionLevelToUpdate: any;
  answerToUpdate: any;
  ROLE: any;
  deletePopUpDisplayStyle = 'none';
  completeTrainingPopUpDisplayStyle = 'none';
  questionToDelete: {
    Question?: string,
    Level?: string
  } = {};
  questionRequired = false;
  answerRequired = false;
  // @Input() topic: any;
  // @Input() dataFromAssignedTasks: any;
  adminRole: any;
  resourceWiseTopics: any;
  resource: any;
  USER: any;
  topicStatus: any;

  constructor(private navigateDataService: NavigateDataService, private dataService: DataService, private router: Router) {
  }

  ngOnInit() {
    this.adminRole = this.dataService.ADMIN_ROLES;
    this.USER = localStorage.getItem('userDisplayName');
    this.ROLE = localStorage.getItem('currentUser');

    const savedTopic = localStorage.getItem('currentTopic');
    if (savedTopic) {
      this.topic = JSON.parse(savedTopic);
      this.getTopicDetails(this.topic);
    }
    else {
      this.navigateDataService.currentTopic.subscribe((topic: any) => {
        if (topic) {
          this.topic = topic;
          localStorage.setItem('currentTopic', JSON.stringify(topic));
          this.getTopicDetails(this.topic);
        }
      });
    }

    if (this.topic.TopicStatus) { //Indicates that this object is from user perspective
      this.topicStatus = this.topic.TopicStatus;
      this.getUserSpecificTopics();
    }

    this.getTopicDetails(this.topic);
  }
  openPopup(question?: string, level?: string) {
    this.deletePopUpDisplayStyle = "block";
    this.questionToDelete = {
      Question: question,
      Level: level
    };
  }

  openAndClosePopup(popupType: string) {
    if (popupType === "Open") {
      this.completeTrainingPopUpDisplayStyle = "block";
    } else {
      this.completeTrainingPopUpDisplayStyle = "none";
    }

  }

  closePopup() {
    this.deletePopUpDisplayStyle = "none";
  }

  resetValues() {
    const level = document.getElementById("dataCategory") as HTMLSelectElement;
    level.value = "Entry";
    this.showAnswer = true;
    this.selectedAnswer = '';
    this.questionToAdd = '';
    this.showUpdateButton = false;
  }

  getUserSpecificTopics() {
    this.dataService.processGetRequest('getAllTopics', null, false).subscribe((response: any) => {
    this.resourceWiseTopics = response;
    console.log(this.resourceWiseTopics);
    console.dir(this.topicDescription);
    this.resourceWiseTopics.Topics?.forEach((topic: any) => {
      console.dir(topic);
      if (topic.Topic === this.topic.Topic) {
        this.topicName = topic.Topic;
        this.topicDescription = topic.Description;
        }
      });
  });
}

  getTopicDetails(topic: any) {
    this.topicName = topic.Topic;
    this.topicDescription = topic.Description;
    this.topicUserRole = topic.Role;
    const queryParameters = { ['Role']: this.topicUserRole, ['Topic']: this.topicName };

    this.dataService.processGetRequest('getQuestions', queryParameters).subscribe((data: any) => {
      try {
        this.topicWiseQuestions = data['response'];
        this.displayStyle = "block";
      } catch {
        console.log('Error: Unable to get Data');
      }
    });
  }

  deleteQuestion() {
    const body = {
      Topic: this.topicName,
      Role: this.topicUserRole,
      Question: this.questionToDelete.Question,
      Level: this.questionToDelete.Level
    }

    this.dataService.processPostRequest('deleteQuestion', body).subscribe((response: any) => {
      console.log(response);
      this.closePopup();
      this.ngOnInit();
    }, error => {
      console.error(error);
    });
  }

  setEditFields(question: string, questionLevel: string, answer: string) {
    const level = document.getElementById("dataCategory") as HTMLSelectElement;
    this.questionToAdd = this.questionToUpdate = question;
    this.showAnswer = questionLevel === 'Entry';
    this.selectedAnswer = this.answerToUpdate = answer;
    this.showUpdateButton = true;
    level.value = this.questionLevelToUpdate = questionLevel;
  }

  showAnswerField() {
    this.resetErrorStatus();
    const level = document.getElementById("dataCategory") as HTMLSelectElement;
    console.log(level.value);
    this.showAnswer = level.value === "Entry";
  }

  insertQuestion() {
    this.resetErrorStatus();
    this.checkErrorStatus();
    console.log(this.questionRequired);
    console.log(this.answerRequired);
    console.log(this.showAnswer);

    if (!this.questionRequired && !this.answerRequired) {
      const level = document.getElementById("dataCategory") as HTMLSelectElement;
      const body = {
        [`${this.topicName}`]: {
          [`${this.topicUserRole}`]: [
            {
              Question: this.questionToAdd,
              Level: level.value,
              Answer: this.selectedAnswer || '',
              InsertedBy: this.USER
            }
          ]
        }
      }

      this.dataService.processPostRequest('insertQuestions', body).subscribe((response: any) => {
        console.log(response);
        this.closePopup();
        this.ngOnInit();
      }, error => {
        console.error(error);
      });
      this.resetValues();
    }
  }

  editQuestion() {
    console.log('Method Invoke')
    this.resetErrorStatus();
    this.checkErrorStatus();

    if (!this.questionRequired && !this.answerRequired) {
      const level = document.getElementById("dataCategory") as HTMLSelectElement;

      const body = {
        Topic: this.topicName,
        Role: this.topicUserRole,
        Question: this.questionToUpdate,
        Level: this.questionLevelToUpdate,
        Answer: this.answerToUpdate || '',
        UpdatedQuestion: this.questionToAdd,
        UpdatedLevel: level.value,
        UpdatedAnswer: this.selectedAnswer
      }

      this.dataService.processPostRequest('editQuestion', body).subscribe((response: any) => {
        console.log(response);
        this.closePopup();
        this.ngOnInit();
      }, error => {
        console.error(error);
      });
      this.resetValues();
    }
  }

  checkErrorStatus() {
    if (!this.questionToAdd || !this.questionToAdd.trim()) {
      this.questionRequired = true;
    }
    if (!this.selectedAnswer && this.showAnswer) {
      this.answerRequired = true;
    }
  }

  resetErrorStatus() {
    this.questionRequired = false;
    this.answerRequired = false;
  }

  updateTopicStatus() {
    const queryParameters = { ['ResourceName']: this.USER, ['Topic']: this.topicName, ['status']: 'TrainingCompleted' };
    this.dataService.processPostRequest('updateUserSpecificTopics', queryParameters).subscribe((data: any) => {
      console.log(data);
      this.openAndClosePopup('Close');
      this.router.navigate(['/assigned-tasks']);
    });
  }

  ngOnDestroy(): void {
    localStorage.removeItem('currentTopic');
  }

}
