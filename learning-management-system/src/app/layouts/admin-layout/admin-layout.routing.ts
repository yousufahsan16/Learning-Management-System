import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { UserComponent } from '../../pages/user/user.component';
import { TopicDetailsComponent } from '../../pages/topic-details/topic-details.component';
import { AssignedTasksComponent } from '../../pages/assigned-tasks/assigned-tasks.component';
import { CreateTasksComponent } from '../../pages/create-tasks/create-tasks.component';
import { TaskCreatedComponent } from '../../pages/task-created/task-created.component';
import { ManageGradesComponent } from '../../pages/manage-grades/manage-grades.component';
import { AttemptQuizComponent } from '../../pages/attempt-quiz/attempt-quiz.component';
import { AcceptRejectTaskComponent } from '../../pages/accept-reject-task/accept-reject-task.component';


export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'user', component: UserComponent },
    { path: 'topic-details', component: TopicDetailsComponent },
    { path: 'assigned-tasks', component: AssignedTasksComponent },
    { path: 'create-tasks', component: CreateTasksComponent },
    { path: 'tasks-created', component: TaskCreatedComponent },
    { path: 'manage-grades', component: ManageGradesComponent },
    { path: 'attempt-quiz', component: AttemptQuizComponent },
    { path: 'accept-reject-task', component: AcceptRejectTaskComponent }
];