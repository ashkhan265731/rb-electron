import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LoginService } from './../../services/login.service';
import { ElectronService } from '../../providers/electron.service';
import { timer } from 'rxjs';

declare var jsPDF: any;

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit {
  @Output() alert: EventEmitter<any> = new EventEmitter();

  ports: any = [];
  portName: string = '';
  port: any;
  isPortOpen: boolean = false;
  raceTime: string = '';
  drawIndex: number = 0;

  pageTitle: any = 'raceclasslist';
  sessionid: any = '';
  serviceUrl = 'https://racebox.herokuapp.com';
  //serviceUrl = 'http://192.168.0.106:3000';
  eventData: any = {};
  alertMessage: any = null;
  errorLog: any = false;
  eventId: String = '';
  currentDate: any;
  raceClassDataReponse: any;
  eventSignedUpUsers: any = {};
  eventName: any = '';
  seachValue: any = "";
  searchType: any = "";
  rider_horse_lists: any = [];
  drawingsResponse: any;
  hideSortIcon: any = true;
  deviceStatus:any = '';


  constructor(
    private http: HttpClient,
    private router: Router,
    private loginService: LoginService,
    private route: ActivatedRoute,
    private electron: ElectronService,

  ) {
    this.loginService.changeMessage("raceclasslist");
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    this.currentDate = Date.parse(new Date().toString());
  }

  ngOnInit() {
    this.eventId = this.route.snapshot.params['eid'];
    this.getEventDetails();

    this.electron.serialPort.list().then((ports: any) => {
      this.ports = ports;

      this.ports.forEach((port) => {
        this.portName = port.comName;
        console.log('Port Name is ' + this.portName);
      });

    }).catch((err: any) => {
      console.log('error occured while listening to serial port')
    });

    const source = timer(1000, 10000);
    const subscribe = source.subscribe((val) => {
      console.log(val);

      this.electron.serialPort.list().then((ports: any) => {
        if(ports && ports.length >0){
          console.log('Connected');
          this.deviceStatus = 'connected';
        }else{
          console.log('disconnected');
          this.deviceStatus = 'disconnected';
        }

  
      }).catch((err: any) => {
        console.log('error occured while listening to serial port')
      });
    });
  }

  openPort() {
    this.port = new this.electron.serialPort(this.portName, {
      baudRate: 1200
    }, (err) => {
      if (err) {
        console.log('Error occured while opening Port ' + this.portName + '\n' + ' Error' + err);
      } else {
        console.log('Port ' + this.portName + 'is now open');
        this.isPortOpen = true;
      }
    });
  }

  closePort() {
    this.port.close(() => {
      this.isPortOpen = false
    });
  }

  readPort() {
    this.port.on('data', (data) => {
      var regexStr = new RegExp('\.[0-9][0-9][0-9]$');
      data = data.toString('ascii');
      this.raceTime += data;

      //this.raceTime = this.raceTime.replace(/[^a-zA-Z0-9.]/g, '');
      if (this.raceTime != null && this.raceTime != '') {
        console.log('PORT :' + this.raceTime + ':');
      }

      if (this.raceTime.indexOf('(M)') != -1) {
        this.raceTime = this.raceTime.replace(/[^0-9.]/g, '');
        this.updateTimings(this.raceTime);
        console.log('RACE TIME : --> ' + this.raceTime);
        this.raceTime = '';
      }
      else if (this.raceTime.indexOf('--NO TIME--') != -1) {
        this.raceTime = this.raceTime.replace(/[^a-zA-Z0-9.]/g, '');
        this.updateTimings(this.raceTime);
        console.log('RACE TIME : --> ' + this.raceTime);
        this.raceTime = '';
      }
      else if (this.raceTime.indexOf('Penalty') != -1 && this.raceTime.search(regexStr) > -1) {
        this.raceTime = this.raceTime.replace(/ +(?= )/g, '');
        this.updateTimings(this.raceTime);
        console.log('RACE REGEX TIME : --> ' + this.raceTime);
        this.raceTime = '';
      }
    });
  }

  getEventDetails() {
    var current = this;
    this.http.get(this.serviceUrl + "/geteventdetails/" + this.eventId)
      .subscribe(function (response) {
        current.errorLog = false;
        current.eventData = response;
        //current.getRaceClassType();
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

  checkDrawExists(index: number, raceClassObject, searchType) {
    if (this.isPortOpen) {
      this.closePort();
      this.drawIndex = 0;
    }

    var current = this;
    var response = this.loginService.getFormData(this.serviceUrl + '/getdrawings/' + this.eventId + '/' + raceClassObject.type);
    response.subscribe((response) => {
      if (response['length'] > 0) {
        current.drawingsResponse = response;
      } else {
        current.drawingsResponse = [];
        console.log("get riders");
      }
      current.errorLog = false;
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

  updateTimings(raceTime:string){
    for(var i = 0; i < this.drawingsResponse[0].list.length; i++){
      if(i == this.drawIndex){
        this.drawingsResponse[0].list[this.drawIndex].raceTime = raceTime;
        console.log(this.drawingsResponse[this.drawIndex]);

        var data = {
          draw_id : this.drawingsResponse[0]._id,
          time: raceTime,
          position: i        
        }
        console.log("data-----");
        console.log(data);
        var response = this.http.post(this.serviceUrl + "/addraceresults" , {data: JSON.stringify(data) })
        .subscribe(function (response) {
          this.errorLog = false;
          this.alertMessage = {
            type: 'success',
            title: 'Event Edited Successfully',
            data: ''
          };
        }, function (err) {
          this.errorLog = true;
          this.alertMessage = {
            type: 'danger',
            title: 'Something Went wrong. Please Contact Administartor',
            data: err
          };
        });

        this.drawIndex++;
        break;
      }
    }
  }


  /*
    getRaceClassType() {
     var current = this;
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
 
   sIndex: number = null;
 
   getRiders(index: number, raceClassObject, searchType) {
     this.sIndex = index;
     var current = this;
     current.rider_horse_lists = [];
     current.seachValue = raceClassObject.type;
     // console.log(current.seachValue);
     this.http.get(this.serviceUrl + "/getRegisteredUsersForEvent/" + this.eventId)
       .subscribe(function (response) {
         current.errorLog = false;
         current.eventSignedUpUsers = response;
         current.eventName = current.eventSignedUpUsers[0].event_id.event_name;
         // console.log("search value");
         // console.log(current.seachValue);
 
         var result = current.eventSignedUpUsers.filter(function (el, index) {
           if (searchType == 'raceclass') {
             for (var x = 0; x <= el.racetypeList.length; x++) {
               if (el.racetypeList[x]) {
                 if (el.racetypeList[x].ridetype[0].trim() == current.seachValue.trim()) {
                   current.rider_horse_lists.push({
                     rider: el.racetypeList[x].rider,
                     horse: el.racetypeList[x].horse
                   });
                 }
               }
             }
 
           }
         })
         // console.log(current.rider_horse_lists);
       })
   }
 
   shuffleArray(array) {
     //  console.log(array);
     for (let i = array.length - 1; i > 0; i--) {
       const j = Math.floor(Math.random() * (i + 1));
       [array[i], array[j]] = [array[j], array[i]]; // eslint-disable-line no-param-reassign
     }
     // console.log("shuffled_array");
     // console.log(array)
     this.rider_horse_lists = array;
   }
 
   saveDrawArray(drawArray) {
     console.log(this.seachValue);
     console.log(drawArray);
     var drawArrayObject = []
 
     for (var x = 0; x < drawArray.length; x++) {
       drawArrayObject.push(
         {
           draw_number: x + 1,
           horse_id: drawArray[x].horse['_id'],
           rider_id: drawArray[x].rider['_id'],
 
         }
       )
     }
 
     var dataObject = {
       drawList: drawArrayObject,
       event_id: this.eventId,
       raceclass_name: this.seachValue.toLowerCase().replace(/\s\s+/g, ' '),
       draw_date: this.currentDate
     }
 
     var data = JSON.stringify(dataObject);
 
     console.log(data);
     var current = this;
     var response = this.http.post(this.serviceUrl + "/addDraw", { data: data })
       .subscribe((res) => {
         current.errorLog = false;
         current.alertMessage = {
           type: 'success',
           title: 'Draw Added!!',
           data: ''
         }
 
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
 
 
 
   generate() {
   this.hideSortIcon =false;
     var doc = new jsPDF('p', 'pt');
 
     var res = doc.autoTableHtmlToJson(document.getElementById("report-table"));
     //doc.autoTable(res.columns, res.data, {margin: {top: 80}, theme: 'grid'});
 
     var header = function (data) {
       doc.setFontSize(18);
       doc.setTextColor(40);
       doc.setFontStyle('normal');
       //doc.addImage(headerImgData, 'JPEG', data.settings.margin.left, 20, 50, 50);
       doc.text("Report", data.settings.margin.left, 50);
     };
 
     var options = {
       beforePageContent: header,
       margin: {
         top: 80
       },
       startY: doc.autoTableEndPosY() + 20
     };
 
     // doc.autoTable(res.columns, res.data, options);
     doc.autoTable(res.columns, res.data, { beforePageContent: header, margin: { top: 80 }, theme: 'grid' });
     doc.save("table.pdf");
   }
 
 
 
   isSortRider: any = true;
   sortByRider() {
     if (this.isSortRider) {
       this.drawingsResponse[0].list.sort(function (a, b) {
         if (a.rider_id.first_name < b.rider_id.first_name) return -1;
         if (a.rider_id.first_name > b.rider_id.first_name) return 1;
         return 0;
       })
     } else {
       this.drawingsResponse[0].list.sort(function (b, a) {
         if (a.rider_id.first_name < b.rider_id.first_name) return -1;
         if (a.rider_id.first_name > b.rider_id.first_name) return 1;
         return 0;
       })
     }
     this.isSortRider = !this.isSortRider;
   }
 
   
   isSortDrawNumber: any = false;
   sortByDrawNumber() {
     if (this.isSortDrawNumber) {
       this.drawingsResponse[0].list.sort(function (a, b) {
         if (a.draw_number < b.draw_number) return -1;
         if (a.draw_number > b.draw_number) return 1;
         return 0;
       })
     } else {
       this.drawingsResponse[0].list.sort(function (b, a) {
         if (a.draw_number < b.draw_number) return -1;
         if (a.draw_number > b.draw_number) return 1;
         return 0;
       })
     }
     this.isSortDrawNumber = !this.isSortDrawNumber;
   }
 
   substitute_contenstant(dlist,dnum){
     var current = this;
       current.router.navigate(["producer/substitute-drawlist/" + dlist['_id'] + "/" + dnum]);
   }
   */
}
