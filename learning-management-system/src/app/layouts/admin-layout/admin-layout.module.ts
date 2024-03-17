import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { UserComponent } from '../../pages/user/user.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TopicDetailsComponent } from '../../pages/topic-details/topic-details.component';
import { AssignedTasksComponent } from '../../pages/assigned-tasks/assigned-tasks.component';
import { CreateTasksComponent } from '../../pages/create-tasks/create-tasks.component';
import { TaskCreatedComponent } from '../../pages/task-created/task-created.component';
import { ManageGradesComponent } from '../../pages/manage-grades/manage-grades.component';
import { AttemptQuizComponent } from '../../pages/attempt-quiz/attempt-quiz.component';
import { AcceptRejectTaskComponent } from '../../pages/accept-reject-task/accept-reject-task.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    NgbModule
  ],
  declarations: [
    DashboardComponent,
    UserComponent,
    TopicDetailsComponent,
    AssignedTasksComponent,
    CreateTasksComponent,
    TaskCreatedComponent,
    ManageGradesComponent,
    AttemptQuizComponent,
    AcceptRejectTaskComponent
  ]
})

export class AdminLayoutModule { }
