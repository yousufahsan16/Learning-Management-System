import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NavigateDataService } from '../../../../src/app/shared/services/navigate-data.service';
import { DataService } from '../../../app/shared/services/data.service';

@Component({
  selector: 'app-task-created',
  templateUrl: './task-created.component.html',
  styleUrls: ['./task-created.component.css']
})
export class TaskCreatedComponent implements OnInit {

  dev = ['Uzair Ahmed Qureshi', 'Gulfam Ajaz', 'Arsalan Ali', 'Haris Ajaz', 'Yousuf Ahsan'];
  qa = ['Ramisa Rasheed', 'Hassan Khatai', 'AbdulBari'];
  ba = ['Duaa Zakir'];
  allResources = [...this.dev, ...this.qa, ...this.ba];

  selectedResource: any;
  resourceWiseTopics: any;
  showEditDiv = false;
  taskDeadLine: any;
  taskQuestions = new Array();
  entryLevelQuestionCount: any;
  intermediateLevelQuestionCount: any;
  expertLevelQuestionCount: any;
  questionsToDelete: any = new Array();
  topicQuestions: any;
  deletePopUpDisplayStyle = "none";
  dismissPopUpDisplayStyle = "none";
  questionsToAdd: any = new Array();
  topicName: any;
  topicUserRole: any;
  ROLE: any;
  USER: any;
  multipleSelectedQuestions: any = new Array();
  parent = true;
  dataToChild: any;
  adminRole: any;
  dataToManageGrades: any;
  navigateToManageGrades = false;
  date: any;
  todaysDate = moment(new Date()).format('MM-DD-YYYY');
  timeAvailable = true;
  isUpdateDate = false;
  updateDatePopUp = 'none';
  minDate: any;
  dateRequired = false;
  selectedTopic: any;

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    location.reload();
  }

  constructor(private router: Router, private dataService: DataService, private navigateDataService: NavigateDataService) { }

  ngOnInit() {
    this.resourceWiseTopics = null;
    this.selectedResource = null;
    this.ROLE = localStorage.getItem('currentUser');
    this.adminRole = this.dataService.ADMIN_ROLES;
    console.log(this.adminRole.includes(this.ROLE));
    if (!this.adminRole.includes(this.ROLE)) {
      this.USER = localStorage.getItem('userDisplayName');
      this.getUserSpecificTopics(this.USER);
    }
    this.minDate = new Date().toISOString().split('T')[0];
    this.selectedTopic = 'Topic';
  }

  togglePage(topicName?: any) {
    this.showEditDiv = true;
    this.topicName = topicName;
    this.entryLevelQuestionCount = 0;
    this.intermediateLevelQuestionCount = 0;
    this.expertLevelQuestionCount = 0;
    this.questionsToAdd = new Array();
    this.getTaskQuestions();
    if (this.taskQuestions.length < 15) {
      this.getTopicQuestions();
    }
  }

  attemptQuizPage(topic: any) {
    const body = { ['resource']: this.selectedResource, ['topicName']: topic, ['userRole']: this.ROLE };
    this.dataToChild = body;
    console.log(this.ROLE);
    this.navigateDataService.changeTopic(this.dataToChild);
    this.router.navigate(['attempt-quiz']);
    this.parent = false;
  }

  getUserSpecificTopics(resource: string) {
    this.selectedResource = resource;
    const queryParameters = { ['User']: resource };

    this.dataService.processGetRequest('getUserSpecificTopics', queryParameters).subscribe((data: any) => {
      this.resourceWiseTopics = data;
      console.dir(this.resourceWiseTopics)
      this.resourceWiseTopics.Topics?.forEach((topic: any) => {
        if (topic.TopicStatus === 'InProgress' || topic.TopicStatus === 'TaskCreated') {
          console.dir('Here')
          this.topicName = topic.Topic;
          this.getTaskQuestions(true);
          if (this.todaysDate > this.taskDeadLine) {
            this.updateTopicStatus();
          }
        }
      });
    });
  }

  getSelectedUserSpecificTopics(topic?: any) {
    if (!topic) {
      this.selectedTopic = 'Topic';
      this.getUserSpecificTopics(this.selectedResource);
    } else {
      console.log(topic);
      console.log(this.resourceWiseTopics);
      this.resourceWiseTopics.Topics = [];
      this.resourceWiseTopics.Topics[0] = topic;
      this.selectedTopic = topic.Topic;
    }
  }

  getTaskQuestions(countquestions = false) {
    const queryParameters = { ['User']: this.selectedResource, ['Topic']: this.topicName };

    this.dataService.processGetRequest('getTask', queryParameters).subscribe((data: any) => {
      try {
        this.taskDeadLine = data['DeadLine'];
        this.taskQuestions = data['Questions'];
        if (!countquestions) {
          for (const questions of this.taskQuestions) {
            if (questions.Level === "Entry") {
              this.entryLevelQuestionCount++;
            } else if (questions.Level === "Intermediate") {
              this.intermediateLevelQuestionCount++;
            }
            else {
              this.expertLevelQuestionCount++;
            }
          }
        }
      } catch {
        console.log('Error: Unable to get Data');
      }

    });
  }

  manageQuestionsToDelete(event: any, index: number) {
    if (event.target.checked) {
      if (this.taskQuestions[index].Level === "Entry") {
        this.entryLevelQuestionCount--;
      } else if (this.taskQuestions[index].Level === "Intermediate") {
        this.intermediateLevelQuestionCount--;
      }
      else {
        this.expertLevelQuestionCount--;
      }

      this.questionsToDelete.push(this.taskQuestions[index]);
      console.dir(this.questionsToDelete);
    } else {
      const idx = this.questionsToDelete.indexOf(index);
      this.questionsToDelete.splice(idx, 1);
      console.dir(this.questionsToDelete);
    }
  }

  manageQuestionsToAdd(event: any, index: number, isSingleQuestion = false) {
    if (event.target.checked || isSingleQuestion) {
      let alertTriggered = false;
      const isQuestionExistsAlreadyInQuiz = this.taskQuestions.find((q: any) => q.Question === this.topicQuestions[index].Question && q.Level === this.topicQuestions[index].Level);
      const isQuestionExistsAlready = this.questionsToAdd.find((q: any) => q.Question === this.topicQuestions[index].Question && q.Level === this.topicQuestions[index].Level);

      console.log(isQuestionExistsAlready);
      console.log(isQuestionExistsAlreadyInQuiz);

      if (isQuestionExistsAlready || isQuestionExistsAlreadyInQuiz) {
        window.alert('You have already added this question in the task');
        alertTriggered = true;
      }
      else {
        if (this.topicQuestions[index].Level === "Entry" && this.entryLevelQuestionCount < 5) {
          this.entryLevelQuestionCount++;
        }
        else if (this.topicQuestions[index].Level === "Intermediate" && this.intermediateLevelQuestionCount < 5) {
          this.intermediateLevelQuestionCount++;
        } else if (this.topicQuestions[index].Level === "Expert" && this.expertLevelQuestionCount < 5) {
          this.expertLevelQuestionCount++;
        }
        else {
          window.alert('You can only add 5 Questions from each Level');
          alertTriggered = true;
        }

        if (!alertTriggered) {
          if (isSingleQuestion) {
            this.questionsToAdd.push(this.topicQuestions[index]);
          }
          else {
            this.multipleSelectedQuestions.push(this.topicQuestions[index]);
          }
        }
      }

      if (alertTriggered) {
        event.target.checked = false;
      }
    } else {
      console.log(this.topicQuestions[index]);
      if (this.topicQuestions[index].Level === "Entry") {
        this.entryLevelQuestionCount--;
      } else if (this.topicQuestions[index].Level === "Intermediate") {
        this.intermediateLevelQuestionCount--;
      }
      else {
        this.expertLevelQuestionCount--;
      }

      const idx = this.questionsToAdd.indexOf(index);
      this.questionsToAdd.splice(idx, 1);
      console.dir(this.questionsToAdd);
    }
  }

  mergeAllQuestions() {
    this.dateRequired = false;
    if (this.date) {
      this.taskDeadLine = this.date;
    }

    if (!this.taskDeadLine) {
      this.dateRequired = true;
      alert('You have to give a Deadline.');
    }

    if (this.taskDeadLine) {
      console.dir(`this.questionsToAdd: ${JSON.stringify(this.questionsToAdd)}`);
      const concatenatedArray = this.questionsToAdd.concat(this.multipleSelectedQuestions);
      console.dir(`concatenatedArray: ${JSON.stringify(concatenatedArray)}`);
      this.questionsToAdd = Array.from(new Set(concatenatedArray));

      console.dir(`this.UpdatedquestionsToAdd: ${JSON.stringify(this.questionsToAdd)}`);
      this.multipleSelectedQuestions = new Array();
    }
  }

  removeQuestions(indexToRemove: number) {
    if (this.questionsToAdd[indexToRemove].Level === "Entry") {
      this.entryLevelQuestionCount--;
    } else if (this.questionsToAdd[indexToRemove].Level === "Intermediate") {
      this.intermediateLevelQuestionCount--;
    }
    else {
      this.expertLevelQuestionCount--;
    }
    this.questionsToAdd.splice(indexToRemove, 1);
  }

  openPopup(index?: any) {
    if (index || index === 0) {
      this.questionsToDelete = [this.taskQuestions[index]];
    }
    this.deletePopUpDisplayStyle = "block";
  }


  closePopup() {
    this.questionsToDelete = [];
    this.deletePopUpDisplayStyle = "none";
  }

  // getTopicQuestions() {
  //   this.topicUserRole = 'DEV';
  //   const queryParameters = { ['Role']: this.topicUserRole, ['Topic']: this.topicName };

  //   this.dataService.processGetRequest('getQuestions', queryParameters).subscribe((data: any) => {
  //     this.topicQuestions = data['response'];
  //   });
  // }

  getTopicQuestions() {
    if (this.dev.includes(this.selectedResource)) {
      this.topicUserRole = 'DEV';
    } else if (this.qa.includes(this.selectedResource)) {
      this.topicUserRole = 'QA'
    } else if (this.ba.includes(this.selectedResource)) {
      this.topicUserRole = 'BA'
    }

    const queryParameters = { ['Role']: this.topicUserRole, ['Topic']: this.topicName };

    this.dataService.processGetRequest('getQuestions', queryParameters).subscribe((data: any) => {
      try {
        const newQuestions = data['response'].filter((question: any) => !this.taskQuestions.some(q => q.Question === question.Question && q.Level === question.Level));
        console.dir(newQuestions);
        if (newQuestions.length > 0) {
          this.topicQuestions = newQuestions;
          console.dir(this.topicQuestions);
        }
      } catch {
        console.log('Error: Unable to get Data');
      }
    });
  }

  deleteQuestion() {
    const body = {
      User: this.selectedResource,
      Topic: this.topicName,
      DeadLine: this.taskDeadLine || '',
      Questions: this.questionsToDelete
    }
    this.questionsToDelete.forEach((question: any) => {
      if (question.Level === 'Entry') {
        this.entryLevelQuestionCount++;
      } else if (question.Level === 'Intermediate') {
        this.intermediateLevelQuestionCount++;
      } else if (question.Level === 'Expert') {
        this.expertLevelQuestionCount++;
      }
    });

    this.dataService.processPostRequest('deleteTaskQuestionsIndividual', body).subscribe((response: any) => {
      console.log(response);
      this.closePopup();
      this.togglePage(this.topicName);
    }, error => {
      console.error(error);
    });
  }

  addQuestion() {
    const totalQuestionLength = this.questionsToAdd.length + this.taskQuestions.length;

    console.dir(this.questionsToAdd);

    if (totalQuestionLength === 15 && (this.taskDeadLine || this.date)) {
      const body = {
        User: this.selectedResource,
        Topic: this.topicName,
        DeadLine: this.date || this.taskDeadLine,
        Questions: this.questionsToAdd
      }

      console.dir(body);

      this.dataService.processPostRequest('createTaskIndividual', body).subscribe((response: any) => {
        console.log(response);
        this.togglePage(this.topicName);
      }, error => {
        console.error(error);
      });
    } else {
      window.alert(`You have to add 15 Questions in each task Current no of Questions: ${totalQuestionLength}`);
    }
  }


  navigateToGrades(topic: any, status: any) {
    if (this.dev.includes(this.selectedResource)) {
      this.topicUserRole = 'DEV';
    } else if (this.qa.includes(this.selectedResource)) {
      this.topicUserRole = 'QA'
    } else if (this.ba.includes(this.selectedResource)) {
      this.topicUserRole = 'BA'
    }

    const queryParameters = { 
      ['topic']: topic,
      ['user']: this.selectedResource || localStorage.getItem('userDisplayName'),
      ['status']: status,
      ['role']: this.topicUserRole
    }
    this.dataToManageGrades = queryParameters;
    this.navigateDataService.changeTopic(this.dataToManageGrades);
    this.router.navigate(['manage-grades']);
    this.navigateToManageGrades = true;
    console.log('sent')
  }

  openAndClosePopup(popupType: any, topic?: any) {
    if (popupType === "DeleteTopic") {
      this.dismissPopUpDisplayStyle = "block";
    } else {
      this.dismissPopUpDisplayStyle = "none";
    }

    this.topicName = topic?.Topic;
    console.log(this.topicName);
    console.log(this.selectedResource);
  }

  dismissTopic() {
    const queryParameters = { ['ResourceName']: this.selectedResource, ['Topic']: this.topicName, ['status']: 'Assign' };
    console.log(queryParameters);

    this.dataService.processPostRequest('deleteUserSpecificTasks', queryParameters).subscribe((data: any) => {
      console.log(data);
      this.openAndClosePopup('Close');
      this.getUserSpecificTopics(this.selectedResource);
      this.ngOnInit();
    }, error => {
      console.error(error);
    });
  }

  updateTopicStatus() {
    const queryParameters = { ['ResourceName']: this.selectedResource, ['Topic']: this.topicName, ['status']: 'DeadlineEnded' };
    this.dataService.processPostRequest('updateUserSpecificTopics', queryParameters).subscribe((data: any) => {
      console.log(data);
    });
  }

  openAndCloseUpdateDatePopUp(popupType: string) {
    if (popupType === "updateDate") {
      this.updateDatePopUp = 'block';
    } else {
      this.updateDatePopUp = 'none';
    }
  }

  updateDeadline() {
    this.dateRequired = false;
    if (!this.date) {
      this.dateRequired = true;
      alert('You have to give a Deadline.');
    }

    if (this.date) {
      const body = { User: this.selectedResource, Topic: this.topicName, DeadLine: this.date }
      console.dir(body);

      this.dataService.processPostRequest('createTaskIndividual', body).subscribe((response: any) => {
        console.log(response);
        this.openAndCloseUpdateDatePopUp('Close');
        this.togglePage(this.topicName);
      }, error => {
        console.error(error);
      });
    }
  }

  dateSubmitted() {
    this.date = moment(this.date).format('MM-DD-YYYY');
  }

}
