import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { EventDetailsComponent } from './components/event-details/event-details.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    
    {
    	path: '', 
    	component: LoginComponent
  	},
    {
      path: 'home',
      component: HomeComponent
    },
    {
      path: 'event_details/:eid', 
      component: EventDetailsComponent
    },      
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
