import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavigateDataService } from '../../shared/services/navigate-data.service';
import { DataService } from '../../../app/shared/services/data.service';
import { HostListener } from '@angular/core';

@Component({
  selector: 'dashboard-cmp',
  moduleId: module.id,
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  dev = ['Uzair Ahmed Qureshi', 'Gulfam Ajaz', 'Arsalan Ali', 'Haris Ajaz', 'Yousuf Ahsan'];
  qa = ['Ramisa Rasheed', 'Hassan Khatai', 'AbdulBari'];
  ba = ['Duaa Zakir'];
  allResources = [...this.dev, ...this.qa, ...this.ba];

  selectedResource: any;
  allTopics: any;
  resourceWiseTopics: any;
  topicName: any;
  topicUserRole: any;
  topicDescription: any;
  showAnswer = true;
  questionToAdd: any;
  selectedAnswer: any;
  showUpdateButton: any;

  questionToUpdate: any;
  questionLevelToUpdate: any;
  answerToUpdate: any;
  ROLE: any;
  USER: any;

  invalidTopicName = false;
  invalidUserRole = false;
  parent = true;
  dataToChild: any;
  adminRole: any;
  selectedUserRole: any;
  selectedTopic: any;

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    location.reload();
    localStorage.removeItem('showChild');
  }

  constructor(private router: Router, private navigateDataService: NavigateDataService, private dataService: DataService) { }

  ngOnInit() {
    this.getAllTopics();

    if (localStorage.getItem('showChild')) {
      this.parent = false;
    }
    this.ROLE = localStorage.getItem('currentUser');
    this.USER = localStorage.getItem('userDisplayName');
    this.adminRole = this.dataService.ADMIN_ROLES;
    if (this.resourceWiseTopics) {
      this.resourceWiseTopics = null;
      this.selectedResource = null;
    }
    this.selectedTopic = 'Topic';
  }

  displayStyle = "none";
  deletePopUpDisplayStyle = "none";
  assignPopUpDisplayStyle = "none";

  openPopup(popupType: string, topic?: any) {
    if (popupType === "AddTopic") {
      this.displayStyle = "block";
    }
    else if (popupType === "DeleteTopic") {
      this.deletePopUpDisplayStyle = "block";
    } else {
      this.assignPopUpDisplayStyle = "block";
    }

    this.topicName = topic.Topic;
    this.topicUserRole = topic.Role;
  }

  closePopup(popupType: string) {

    if (popupType === "AddTopic") {
      this.resetErrorStatus();
      this.displayStyle = "none";
    }
    else if (popupType === "DeleteTopic") {
      this.deletePopUpDisplayStyle = "none";
    } else {
      this.assignPopUpDisplayStyle = "none";
    }
  }

  resetProperties() {
    this.topicName = '';
    this.topicUserRole = '';
  }

  getAllTopics() {
    console.log("Arsalan: Test");
    this.dataService.processGetRequest('getAllTopics', null, false).subscribe((data: any) => {
      console.dir("data" + data);
      this.allTopics = data;
      console.log(this.allTopics);
      console.log("Done API call");
    });
  }

  addTopic() {
    this.resetErrorStatus();
    if (!this.topicName || !this.topicName.trim()) {
      this.invalidTopicName = true;
    }

    if (!this.topicUserRole) {
      this.invalidUserRole = true;
    }

    const body = {
      Topic: this.topicName,
      Role: this.topicUserRole,
      Description: this.topicDescription,
      TargettedResource: this.topicUserRole === 'DEV' ? this.dev : this.topicUserRole === 'QA' ? this.qa : this.ba
    };

    if (!this.invalidTopicName && !this.invalidUserRole) {
      this.dataService.processPostRequest('addTopic', body).subscribe((response: any) => {
        console.log(response);
        this.closePopup('AddTopic');
        this.ngOnInit();
      });
    }

    this.topicName = '';
    this.topicDescription = '';
    this.topicUserRole = '';
  }

  deleteTopic() {
    const url = 'http://localhost:3005/deleteTopic';
    const body = {
      Topic: this.topicName,
      Role: this.topicUserRole,
      TargettedResource: this.topicUserRole === 'DEV' ? this.dev : this.topicUserRole === 'QA' ? this.qa : this.ba
    }

    this.dataService.processPostRequest('deleteTopic', body).subscribe((response: any) => {
      console.log(response);
      this.closePopup('DeleteTopic');
      this.ngOnInit();
    }, error => {
      console.error(error);
    });
  }

  getQuestions(topic: any) {
    this.navigateDataService.changeTopic(topic);
    this.dataToChild = topic;
    this.router.navigate(['/topic-details']);
    this.parent = false
    localStorage.setItem('showChild', 'true');
  }

  getUserSpecificTopics(resource: string) {
    this.selectedResource = resource;

    if (this.dev.includes(this.selectedResource)) {
      this.selectedUserRole = 'DEV';
    } else if (this.qa.includes(this.selectedResource)) {
      this.selectedUserRole = 'QA'
    } else if (this.ba.includes(this.selectedResource)) {
      this.selectedUserRole = 'BA'
    }

    const queryParams = { ['User']: resource };

    this.dataService.processGetRequest('getUserSpecificTopics', queryParams).subscribe((response: any) => {
      this.resourceWiseTopics = response;
      console.log(this.resourceWiseTopics);
    });
  }

  getSelectedTopics(topic: any) {
    this.allTopics.Topics = [];
    this.allTopics.Topics[0] = topic;
    this.selectedTopic = topic.Topic;
  }

  getSelectedUserSpecificTopics(topic?: any) {
    if (!topic) {
      this.selectedTopic = 'Topic';
      this.getUserSpecificTopics(this.selectedResource);
    }

    this.selectedTopic = topic.Topic;
    console.log(this.selectedTopic);
    this.resourceWiseTopics.Topics = [];
    this.resourceWiseTopics.Topics[0] = topic;
  }

  assignTask() {
    const body = {
      Topic: this.topicName,
      ResourceName: this.selectedResource
    }

    this.dataService.processPostRequest('assignTask', body).subscribe((response: any) => {
      console.log(response);
      this.closePopup('');
      this.getUserSpecificTopics(this.selectedResource);
    }, error => {
      console.error(error);
    });
  }

  resetErrorStatus() {
    this.invalidTopicName = false;
    this.invalidUserRole = false;
  }
}
