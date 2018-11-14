import { Component, OnInit, Input, Inject, OnChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { $ } from 'protractor';
import { Location } from '@angular/common';
import { LoginService } from './../../services/login.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit,OnChanges {
  serviceUrl = 'https://racebox.herokuapp.com';
  message: any;
  from_date: any;
  to_date: any;
  s_days: any = [];


  stalls: any;
  event_fromdate: any;
  event_todate: any;
  //  @Input('eventId') eventId: String;
  attachmentList: any = [];
  eventData: any = {};
  eventId: String = '';
  panelOpenState: boolean = false;
  raceClassDataReponse: any;
  eventSignedUpUsers: any = [];
  errorLog: any = false;
  alertMessage: any = null;
  sessionid: any;
  modalTitle: any = "Add/Edit";

  /*modal varibles*/
  modalFormAction: any;
  modalFormType: any;
  raceclass: any = {};

  sessionTypeList: any = {};
 

  validateDate: any = false;
  validateSFromTime: any = false;
  validateSToTime: any = false;
  validateSessionType: any = false;
  
  time = { hour: 13, minute: 30 };
  sessDataResponse: any={};
  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private _location: Location,
    private loginService: LoginService

  ) {
    this.eventId = this.route.snapshot.params['id'];
    
  }

  ngOnInit() {

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
    this.getSess();
    var session = JSON.parse(sessionStorage.getItem("user"));

    this.sessionid = session._id;
    // if(session._id == )
    this.eventId = this.route.snapshot.params['id'];
    this.getEventDetails();
    this.event_fromdate = this.eventData.from_date;
    this.event_todate = this.eventData.to_date;

    // console.log(this.event_fromdate);

  }


  getUser(cn, cr, searchName) {
    var current = this;
    this.http.get(this.serviceUrl + "/getRegisteredUsersForEvent/" + this.eventId)
      .subscribe(function (response) {
        current.errorLog = false;
        current.eventSignedUpUsers = response;

        var searchValue = cn;
        var result = current.eventSignedUpUsers.filter(function (el, index) {

          if (searchName == 'raceclass') {
            for (var x = 0; x <= el.racetypeList.length; x++) {
              return el.racetypeList[x].ridetype[0] == searchValue;
            }
          }
          else if (searchName == 'sessionTypeList') {
            for (var x = 0; x <= el.etimeslots.length; x++) {
              return el.etimeslots[x].exhibition_day == searchValue;
            }
          }
    
          else if (searchName == 'stalls') {
            return el.userStalls >= 1;
          }
        })
      }, function (err) {
        current.errorLog = true;
        current.alertMessage = {
          type: 'danger',
          title: 'Something Went wrong. Please Contact Administartor',
          data: err
        };
      });


  }

  getEventDetails() {
    var current = this;

    this.http.get(this.serviceUrl + "/geteventdetails/" + this.eventId)
      .subscribe(function (response) {
        current.errorLog = false;
        current.eventData = response;
        current.getDaysBetweenEvents(response['from_date'], response['to_date']);
        current.getRaceClassType();
      }, function (err) {
        current.errorLog = true;
        current.alertMessage = {
          type: 'danger',
          title: 'Something Went wrong. Please Contact Administartor',
          data: err
        };
      }
      );
  }

  onUploadFiles(evt: any) {
    if (evt.error) {
      throw evt.error;
    }
    const files = evt.files;
  }
  getRaceClassType() {
    var current = this;
    // this.http.get("http://localhost:3000/getraceclasstype")
    var response = this.http.get(this.serviceUrl + "/getraceclasstype");
    response.subscribe(function (response) {
      current.errorLog = false;
      current.raceClassDataReponse = response;
    }, function (err) {
      current.errorLog = true;
      current.alertMessage = {
        type: 'danger',
        title: 'Something Went wrong. Please Contact Administartor',
        data: err
      };
    }
    );
  }

  getDaysBetweenEvents(from, to) {
    from = new Date(from / 1);
    to = new Date(to / 1);
    if (from > to) {
      alert("from date should be lesser than to date");
      this.to_date = "";
    }
    if (from != null && to != null) {
      var dates = this.loginService.betweenDates(from, to);
      var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var currentContext = this;
      currentContext.s_days = [];
      dates.forEach(function (date) {
        currentContext.s_days.push(days[date.getDay()] + '(' + parseInt(date.getMonth() + 1) + '/' + date.getDate() + ')');

      });
    }
  }
  getExhibitionDays(from, to) {

    if (from != null && to != null) {
      var fromdate = new Date(from.year, from.month - 1, from.day);
      var todate = new Date(to.year, to.month - 1, to.day);
      var dates = this.loginService.betweenDates(fromdate, todate);

      // Usage
      var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var currentContext = this;
      this.s_days = [];
      dates.forEach(function (date) {
        currentContext.s_days.push(days[date.getDay()] + '(' + (parseInt(date.getMonth() + 1)) + '/' + date.getDate() + ')');
   //  console.log(date.getMonth());
      });
    }
  }


  // validation function
  validateStalls() {
    if (!this.eventData.stalls) {
      this.eventData.stalls = 0;
    }

    if (this.eventData.stalls <= 0) {
      this.eventData.stalls_price = 0;
    }
  }

  validateElectric() {
    if (!this.eventData.electric_quantity) {
      this.eventData.electric_quantity = 0;
    }

    if (this.eventData.electric_quantity <= 0) {
      this.eventData.electric_price = 0;
    }
  }
  validateShavings() {
    if (!this.eventData.shavings_quantity) {
      this.eventData.shavings_quantity = 0;
    }

    if (this.eventData.shavings_quantity <= 0) {
      this.eventData.shavings_price = 0;
    }
  }
  validateTieouts() {
    if (!this.eventData.tieout_quantity) {
      this.eventData.tieout_quantity = 0;
    }

    if (this.eventData.tieout_quantity <= 0) {
      this.eventData.tieout_price = 0;
    }
  }
  getValidateDate(fromdate, todate) {
    if (fromdate && todate) {
      if (fromdate.year <= todate.year && fromdate.month <= todate.month && fromdate.day <= todate.day) {
        this.validateDate = false;
        //calculate days between dates
        this.getExhibitionDays(fromdate, todate);
      } else {
        this.validateDate = true;
      }
    }
  }

  getValidateSFromTime(from_time) {
    //  console.log(from_time);

    if (from_time == null) {
      this.validateSFromTime = true;
    } else {
      this.validateSFromTime = false;
    }
  }
  getValidateSToTime(to_time) {
    if (to_time == null) {
      this.validateSToTime = true;
    } else {
      this.validateSToTime = false;
    }
  }

  resetSTime() {
    var current = this;
    setTimeout(function () {
      //  console.log(current.validateEFromTime);
      current.validateSFromTime = false;
      current.validateSToTime = false;
      //  console.log(current.validateEFromTime);
    }, 500)

  }


 
  //validaion functions

  modalFormIndex: any;
  openDialog(EventValues, editType, formaction, index): void {
    this.modalFormIndex = index;
    this.modalFormAction = formaction;
    this.modalFormType = editType;

    //reset validation parametes values
    this.validateSFromTime = false;
    this.validateSToTime = false;
  
    this.sessionTypeList.s_days = this.s_days[0];
  
  }

  closePopup(form, formAction) {
    if (formAction == 'add') {
      form.reset();
    }

    this.getEventDetails();
  }

  updateEvent(form, formAction) {

    var current = this;
    var data;
    //raceclass
    if (this.modalFormType == "racetype" && this.modalFormAction == 'edit') {
      data = JSON.stringify(this.eventData.racetype);
    } else if (this.modalFormType == "racetype" && this.modalFormAction == 'add') {
      var obj = {
        type: this.raceclass.type,
        price: this.raceclass.price
      }
      this.eventData.racetype.push(obj);
      data = JSON.stringify(this.eventData.racetype);
      // console.log(data);
    }

    //sessionTypeList
    if (this.modalFormType == "timeslot" && this.modalFormAction == 'edit') {
      data = JSON.stringify(this.eventData.timeslot);
    } else if (this.modalFormType == "timeslot" && this.modalFormAction == 'add') {
      var date = new Date();
      var rand = Math.floor((Math.random() * 1000000) + 1);
      var id = Date.parse(date.toString()) + rand;
      var sess_object = {
        id: id,
        session_type: this.sessionTypeList.sess_name,
        from: this.sessionTypeList.from_time,
        to: this.sessionTypeList.to_time,
        s_day: this.sessionTypeList.s_days,
        quantity: this.sessionTypeList.quantity,
        fee: this.sessionTypeList.fee
      }
      this.eventData.timeslot.push(sess_object);
      data = JSON.stringify(this.eventData.timeslot);
    }
 
  
    //add ons
    if (this.modalFormType == "addons" && this.modalFormAction == 'edit') {

      data = {
        "stalls": this.eventData.stalls,
        "stalls_price": this.eventData.stalls_price,
        "shavings_quantity": this.eventData.shavings_quantity,
        "shavings_price": this.eventData.shavings_price,
        "electric_quantity": this.eventData.electric_quantity,
        "electric_price": this.eventData.electric_price,
        // "tieout_quantity": this.eventData.tieout_quantity,
        "tieout_price": this.eventData.tieout_price,
        "late_fee": this.eventData.late_fee,
        "office_fee": this.eventData.office_fee,
      }
      data = JSON.stringify(data);
    }

    // console.log("save event");
    // console.log(data);
    // console.log(this.modalFormType);
    var response = this.http.post(this.serviceUrl + "/updateevent/" + this.eventId + "/" + this.modalFormType, { "data": data })
      .subscribe(function (response) {
        current.errorLog = false;
        current.alertMessage = {
          type: 'success',
          title: 'Event Edited Successfully',
          data: ''
        };
        if (formAction == 'add') {
          form.reset();
        }

      }, function (err) {
        current.errorLog = true;
        current.alertMessage = {
          type: 'danger',
          title: 'Something Went wrong. Please Contact Administartor',
          data: err
        };
      }
      );

  }

  goBack() {
    this._location.back();

  }
  getSess() {
    var current = this;
    var response = this.loginService.getFormData(this.serviceUrl + '/getsessinfoall');
    response.subscribe((response) => {
      console.log(response);
      current.errorLog = false;
      current.sessDataResponse = response;
      console.log(current.sessDataResponse);
    },
      function (err) {
        current.errorLog = true;
        current.alertMessage = {
          type: 'danger',
          title: 'Something Went wrong. Please Contact Administartor',
          data: err
        };
      });
  }

  ngOnChanges(){
    console.log(this.eventData.racetype);
  }

  reorderRaceclass(event,racetype){
    this.eventData.racetype = event;
    var data = JSON.stringify(this.eventData.racetype);
    console.log(event);
    var current= this;
    var response = this.http.post(this.serviceUrl + "/raceclass_rearrange/" + this.eventId + "/" , { "data":  data})
      .subscribe(function (response) {
        current.errorLog = false;
       
        

      }, function (err) {
        current.errorLog = true;
        current.alertMessage = {
          type: 'danger',
          title: 'Something Went wrong. Please Contact Administartor',
          data: err
        };
      }
      );
  }


}

