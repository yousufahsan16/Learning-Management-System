import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
  
export class NavigateDataService {
  private topicSource = new BehaviorSubject<any>(null);
  currentTopic = this.topicSource.asObservable();

  constructor() { }

  changeTopic(topic: any) {
    this.topicSource.next(topic);
  }
}