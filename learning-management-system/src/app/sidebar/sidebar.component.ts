import { Component, OnInit } from '@angular/core';
import { DataService } from '../shared/services/data.service';


export interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

export const ROUTES: RouteInfo[] = [
    { path: '/dashboard', title: 'Home', icon: 'nc-bank', class: '' },
    { path: '/assigned-tasks', title: 'Assigned Topics', icon: 'nc-diamond', class: '' },
    { path: '/tasks-created', title: 'Tasks', icon: 'nc-single-02', class: '' },
    // { path: '/accept-reject-task', title: 'Rejected Tasks', icon: 'nc-basket', class: '' }
];

export const USER_ROUTES: RouteInfo[] = [
    { path: '/assigned-tasks', title: 'Assigned Topics', icon: 'nc-diamond', class: '' },
    { path: '/tasks-created', title: 'My Tasks', icon: 'nc-single-02', class: '' },
    // { path: '/accept-reject-task', title: 'Manage Tasks', icon: 'nc-bullet-list-67', class: '' }
];

@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {
    ROLE: any;

    constructor(private dataService: DataService) {
    }

    public menuItems: any[] = [];
    userImage: any;
    username: any;

    ngOnInit() {
        this.ROLE = localStorage.getItem('currentUser');
        if (!this.dataService.ADMIN_ROLES.includes(this.ROLE)) {
            this.menuItems = USER_ROUTES.filter(menuItem => menuItem);
        } else {
            this.menuItems = ROUTES.filter(menuItem => menuItem);
        }

        const image = localStorage.getItem('userImage');

        if (image !== 'undefined') {
            this.userImage = `data:image/jpeg;base64,/9j/${image}`
        }

        this.username = localStorage.getItem('userDisplayName')
    }
}
