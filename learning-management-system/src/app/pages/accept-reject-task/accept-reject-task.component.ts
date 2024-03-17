import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../app/shared/services/data.service';

@Component({
  selector: 'app-accept-reject-task',
  templateUrl: './accept-reject-task.component.html',
  styleUrls: ['./accept-reject-task.component.css']
})
export class AcceptRejectTaskComponent {
  dev = ['Uzair Ahmed Qureshi', 'Gulfam Ajaz', 'Arsalan Ali', 'Haris Ajaz', 'Yousuf Ahsan'];
  qa = ['Ramisa Rasheed', 'Hassan Khatai', 'AbdulBari'];
  ba = ['Duaa Zakir'];
  allResources = [...this.dev, ...this.qa, ...this.ba];

  selectedResource: any;
  ROLE: any;
  reason: any;
  displayStyle = "none";
  acceptPopUpDisplayStyle = "none";
  dismissPopUpDisplayStyle = "none";
  assignPopUpDisplayStyle = 'none';
  topic: any;
  status: any;
  resourceWiseTopics: any;
  selectResource: any;
  rejectedTasksPresent = false;
  adminRole: any;
  nonAcceptedTasks: any = new Array();
  nonAcceptedTasksPresent = false;

  constructor(private router: Router, private dataService: DataService) { }

  ngOnInit(): void {
    this.ROLE = localStorage.getItem('currentUser');
    this.adminRole = this.dataService.ADMIN_ROLES;
    if (!this.adminRole.includes(this.ROLE)) {
      this.selectedResource = localStorage.getItem('userDisplayName');
      console.log("Got IT " + (this.ROLE));
      this.getUserSpecificTopics(this.selectedResource);
    }
  }

  changeTaskStatus() {
    if (this.status === 'Rejected') {
      this.status = `${this.status} ${this.reason}`;
    }

    console.log(this.topic);
    const queryParameters = { ['ResourceName']: this.selectedResource, ['Topic']: this.topic, ['status']: this.status };

    this.dataService.processPostRequest('updateUserSpecificTopics', queryParameters).subscribe((data: any) => {
      console.log(data);
      this.openAndClosePopup('Close');
      this.ngOnInit();
    });
  }

  getUserSpecificTopics(resource: any) {
    this.rejectedTasksPresent = false;
    this.selectedResource = resource;
    const queryparameters = { ['User']: resource };

    this.dataService.processGetRequest('getUserSpecificTopics', queryparameters).subscribe((data: any) => {
      this.resourceWiseTopics = data;
      console.log(this.resourceWiseTopics);
      this.resourceWiseTopics?.Topics?.forEach((topic: any) => {
        console.log(topic.TopicStatus);
        if (topic.TopicStatus.includes('Rejected')) {
          this.rejectedTasksPresent = true;
        }

        if (topic.TopicStatus === 'TaskCreated') {
          this.nonAcceptedTasks.push(topic);
          this.nonAcceptedTasksPresent = true;
          console.log(`Added ${this.nonAcceptedTasks}`);
        }
        console.log(this.rejectedTasksPresent);
      });

      console.log(this.resourceWiseTopics);
    }, error => {
      console.error(error);
    });
  }

  openAndClosePopup(popupType: string, topic?: any, status?: any) {
    if (popupType === "OpenRejectedTaskPopUp") {
      this.displayStyle = "block";
    } else if (popupType === 'OpenAcceptedTaskPopUp') {
      this.acceptPopUpDisplayStyle = 'block';
    } else if (popupType === 'DismissTaskPopUp') {
      this.dismissPopUpDisplayStyle = 'block';
    } else if (popupType === 'AssignTaskPopUp') {
      this.assignPopUpDisplayStyle = 'block';
    } else {
      this.displayStyle = "none";
      this.acceptPopUpDisplayStyle = "none";
      this.dismissPopUpDisplayStyle = "none";
      this.assignPopUpDisplayStyle = 'none';
    }

    this.topic = topic;
    this.status = status;
  }

  // assignTask() {
  //   const body = {
  //     Topic: this.topic,
  //     ResourceName: this.selectResource
  //   }

  //   this.dataService.processPostRequest('assignTask', body).subscribe((response: any) => {
  //     console.log(response);
  //     this.getUserSpecificTopics(this.selectResource);
  //   }, error => {
  //     console.error(error);
  //   });
  // }

  acceptOrRejectTask() {
    if (this.status === 'Rejected') {
      this.status = `${this.status} ${this.reason}`;
    }

    console.log(this.topic);
    const queryParameters = { ['ResourceName']: this.selectedResource, ['Topic']: this.topic, ['status']: this.status };
    console.log(this.selectedResource);

    this.dataService.processPostRequest('updateUserSpecificTopics', queryParameters).subscribe((data: any) => {
      console.log(data);
      this.openAndClosePopup('Close');
      this.router.navigate(['/assigned-tasks']);
      // this.ngOnInit();
    });
  }

  DeleteTask() {
    const queryParameters = { ['ResourceName']: this.selectedResource, ['Topic']: this.topic };
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
}
