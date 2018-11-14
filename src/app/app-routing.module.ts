import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { EventDetailsComponent } from './components/event-details/event-details.component';
import { DrawListByEventCategoryComponent } from './components/draw-list-by-event-category/draw-list-by-event-category.component';

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
      path: 'event_details/:id', 
      component: EventDetailsComponent
    },
    { 
      path: 'userreportbyeventdetails/:eid/:searchvalue/:searchtype',
      component: DrawListByEventCategoryComponent
    },    
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
