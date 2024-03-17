import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavigateDataService } from '../../../../src/app/shared/services/navigate-data.service';
import { DataService } from '../../../app/shared/services/data.service';

@Component({
  selector: 'app-assigned-tasks',
  templateUrl: './assigned-tasks.component.html',
  styleUrls: ['./assigned-tasks.component.css']
})
export class AssignedTasksComponent implements OnInit {
  dev = ['Uzair Ahmed Qureshi', 'Gulfam Ajaz', 'Arsalan Ali', 'Haris Ajaz', 'Yousuf Ahsan'];
  qa = ['Ramisa Rasheed', 'Hassan Khatai', 'AbdulBari'];
  ba = ['Duaa Zakir'];
  allResources = [...this.dev, ...this.qa, ...this.ba];

  selectedResource: any;
  resourceWiseTopics: any;
  topicName: any;
  topicDescription: any;
  topicUserRole: any;
  topicWiseQuestions: any;
  ROLE: any;
  USER: any;
  deletePopUpDisplayStyle = "none";
  parent = true;
  public dataToChild = '';
  public dataToTopicDetails = '';
  adminRole: any;
  topicDetails = false;
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
    if (!this.adminRole.includes(this.ROLE)) {
      this.USER = localStorage.getItem('userDisplayName');
      this.getUserSpecificTopics(this.USER);
    }
    this.selectedTopic = 'Topic';
  }

  getUserSpecificTopics(resource: string) {
    this.selectedResource = resource;
    const queryparameters = { ['User']: resource };

    this.dataService.processGetRequest('getUserSpecificTopics', queryparameters).subscribe((data: any) => {
      this.resourceWiseTopics = data;
    });
  }

  getSelectedUserSpecificTopics(topic?: any) {
    if (!topic) {
      this.selectedTopic = 'Topic';
      this.getUserSpecificTopics(this.selectedResource);
    } else {
      this.resourceWiseTopics.Topics = [];
      this.resourceWiseTopics.Topics[0] = topic;
      this.selectedTopic = topic.Topic;
    }
  }

  createTask(topic: any) {
    console.log(`My topics ${topic}`);
    topic.resource = this.selectedResource;

    if (this.dev.includes(this.selectedResource)) {
      this.ROLE = 'DEV';
    } else if (this.qa.includes(this.selectedResource)) {
      this.ROLE = 'QA'
    } else if (this.ba.includes(this.selectedResource)) {
      this.ROLE = 'BA'
    }

    topic.role = this.ROLE;
    this.dataToChild = topic;
    this.navigateDataService.changeTopic(this.dataToChild);
    this.router.navigate(['create-tasks']);
    this.parent = false;
  }

  openAndClosePopup(popupType:string, topic?:any)  {
    if (popupType === "DeleteTopic") {
      this.deletePopUpDisplayStyle = "block";
    } else {
      this.deletePopUpDisplayStyle = "none";
    }

    this.topicName = topic?.Topic;
    console.log(this.topicName);
  }

  dismissTopic() {
    const queryParameters = { ['ResourceName']: this.selectedResource, ['Topic']: this.topicName, ['status']: '' };
    console.log(queryParameters);

    this.dataService.processPostRequest('updateUserSpecificTopics', queryParameters).subscribe((data: any) => {
      console.log(data);
      this.openAndClosePopup('Close');
      this.getUserSpecificTopics(this.selectedResource);
      this.ngOnInit();
    }, error => {
      console.error(error);
    });
  }

  moveToTopicDetails(topic: any) {
    this.navigateDataService.changeTopic(topic);
    topic.Role = this.ROLE;
    // this.dataToTopicDetails = topic;
    console.dir(this.dataToChild);
    this.router.navigate(['topic-details']);
    this.topicDetails = true;
  }
}
