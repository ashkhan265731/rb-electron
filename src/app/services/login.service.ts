import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from "rxjs";
import * as io from 'socket.io-client';


@Injectable({
  providedIn: 'root'
})

export class LoginService {
  private url = 'https://racebox.herokuapp.com';
  private socket;

  private messageSource = new BehaviorSubject<string>("default message");
  currentMessage = this.messageSource.asObservable();

  private messageSourceProfilePic = new BehaviorSubject<string>("profile pic");
  currentMessageProfilePic = this.messageSourceProfilePic.asObservable();

  private messageSourceProfileInfo = new BehaviorSubject<string>("profile info");
  currentMessageProfileInfo = this.messageSourceProfileInfo.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  
  changeMessage(message: string) {
    this.messageSource.next(message)
  }

  updateProfilePic(message: string){
    this.messageSourceProfilePic.next(message);
  }

  updateProfileInfo(message: string){
    this.messageSourceProfileInfo.next(message);
  }

  postFormData(url,data){
    return this.http.post(url,{data:data});
  }

  getFormData(url){
    return this.http.get(url);
  }

  betweenDates(startDate,endDate){
    var dates = [],
      currentDate = startDate,
      addDays = function (days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      };
    while (currentDate <= endDate) {
      dates.push(currentDate);
      currentDate = addDays.call(currentDate, 1);
    }
    return dates;
}

  
  
  sendMessage(message){
    console.log(typeof message);
    message = JSON.parse(message);
    console.log(typeof message);
    this.socket.emit('add-message', message);    
  }
  
  getMessages() {
    let observable = new Observable(observer => {
      this.socket = io(this.url);
      this.socket.on('Updated Fields', (data) => {
        console.log(data);
        console.log(typeof data);
        observer.next(data);    
      });
      return () => {
        this.socket.disconnect();
      };  
    })     
    return observable;
  }  
}